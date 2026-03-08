import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from decimal import Decimal
from django.db import transaction

from billing.models import Transaction
from catalog.models import Project, Ownership
from referrals.services import ReferralService
from billing.paypal import capture_paypal_order # Импортируем наш новый сервис
from rest_framework import status

# --- ОБЩАЯ ФУНКЦИЯ ДЛЯ НАЧИСЛЕНИЯ ДОЛЕЙ (Используется и Stripe, и PayPal) ---
@transaction.atomic
def fulfill_order(transaction_id):
    try:
        # 1. Блокируем транзакцию
        tx = Transaction.objects.select_for_update().get(
            id=transaction_id, 
            status=Transaction.Status.PENDING
        )
        user = tx.wallet.user
        
        cart_details = tx.metadata.get('cart', [])
        if not cart_details:
            return False

        # 2. Защита от дедлоков: Сортируем ID проектов
        project_ids = sorted([item['project_id'] for item in cart_details])
        projects = list(Project.objects.select_for_update().filter(id__in=project_ids))
        project_map = {str(p.id): p for p in projects}

        # 3. Валидация всей корзины
        can_fulfill = True
        for item in cart_details:
            proj = project_map.get(item['project_id'])
            if not proj or proj.available_shares < item['shares'] or proj.status not in [Project.Status.PRESALE, Project.Status.ACTIVE]:
                can_fulfill = False
                break

        if not can_fulfill:
            # Для PayPal возврат будет делаться иначе, но логика отмены транзакции та же
            tx.status = Transaction.Status.FAILED
            tx.description += " (ОТМЕНЕНА: Часть долей из корзины раскуплена)"
            tx.save(update_fields=['status', 'description', 'updated_at'])
            return False

        # 4. Проводим начисление
        for item in cart_details:
            proj = project_map[item['project_id']]
            shares = item['shares']
            
            proj.available_shares -= shares
            if proj.available_shares == 0:
                proj.status = Project.Status.SOLD
            proj.save(update_fields=['available_shares', 'status', 'updated_at'])

            ownership, _ = Ownership.objects.get_or_create(
                user=user, 
                project=proj,
                defaults={'shares_amount': 0, 'average_buy_price': Decimal('0.00')}
            )

            item_price_per_share = Decimal(item['price_per_share'])
            old_total = Decimal(ownership.shares_amount) * ownership.average_buy_price
            new_total = Decimal(shares) * item_price_per_share
            
            ownership.shares_amount += shares
            ownership.average_buy_price = (old_total + new_total) / Decimal(ownership.shares_amount)
            ownership.save(update_fields=['shares_amount', 'average_buy_price', 'updated_at'])

        # 5. Успех
        tx.status = Transaction.Status.COMPLETED
        tx.save(update_fields=['status', 'updated_at'])
        ReferralService.process_purchase_bonus(user=user, purchase_amount=tx.amount)
        return True

    except Transaction.DoesNotExist:
        return False


# --- СТАРЫЙ ДОБРЫЙ STRIPE WEBHOOK ---
@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return HttpResponse(status=400)

        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            transaction_id = payment_intent.get('metadata', {}).get('transaction_id')
            if transaction_id:
                success = fulfill_order(transaction_id)
                if not success:
                    # Оформляем возврат в Stripe, если долей не хватило
                    stripe.Refund.create(payment_intent=payment_intent['id'])

        return HttpResponse(status=200)


# --- НОВЫЙ ENDPOINT ДЛЯ PAYPAL ---
class PayPalCaptureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('orderID')
        transaction_id = request.data.get('transaction_id') # Мы передадим его с фронта

        if not order_id or not transaction_id:
            return Response({"detail": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Захватываем средства через API PayPal
            capture_response = capture_paypal_order(order_id)
            
            # Проверяем статус в ответе PayPal
            if capture_response.get('status') == 'COMPLETED':
                # 2. Начисляем доли пользователю
                success = fulfill_order(transaction_id)
                
                if success:
                    return Response({"status": "success"})
                else:
                    # В идеале здесь нужно дернуть PayPal Refund API, 
                    # если кто-то успел выкупить доли за эти 5 секунд
                    return Response({"detail": "Корзина недействительна (доли раскуплены)"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"detail": "Оплата не завершена"}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class TripleAWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Защита: проверяем, что хук пришел именно от Triple-A
        notify_secret = request.data.get('notify_secret')
        if notify_secret != settings.TRIPLEA_WEBHOOK_SECRET:
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        webhook_status = request.data.get('status')
        tx_id = request.data.get('payment_reference')

        # 'good' означает, что крипта зачислена в полном объеме
        if webhook_status == 'good' and tx_id:
            success = fulfill_order(tx_id)
            # Если success == False (например, доли уже раскупили), 
            # деньги упадут на аккаунт мерчанта TripleA, и менеджер вернет их вручную.

        return Response({"status": "ok"})