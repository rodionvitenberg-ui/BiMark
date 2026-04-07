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
from catalog_assets.models import Asset, AssetOwnership
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

        share_items = [i for i in cart_details if i.get('item_type') == 'share']
        asset_items = [i for i in cart_details if i.get('item_type') == 'asset']

        # 2. Блокируем проекты и активы
        project_map = {}
        if share_items:
            project_ids = sorted([item['item_id'] for item in share_items])
            projects = list(Project.objects.select_for_update().filter(id__in=project_ids))
            project_map = {str(p.id): p for p in projects}

        asset_map = {}
        if asset_items:
            asset_ids = sorted([item['item_id'] for item in asset_items])
            assets = list(Asset.objects.select_for_update().filter(id__in=asset_ids))
            asset_map = {str(a.id): a for a in assets}

        # 3. Валидация всей корзины
        can_fulfill = True
        for item in share_items:
            proj = project_map.get(item['item_id'])
            if not proj or proj.available_shares < item['quantity'] or proj.status not in [Project.Status.PRESALE, Project.Status.ACTIVE]:
                can_fulfill = False
                break
                
        for item in asset_items:
            asset = asset_map.get(item['item_id'])
            if not asset or asset.status != Asset.Status.ACTIVE or (asset.is_unique and item['quantity'] > 1):
                can_fulfill = False
                break

        if not can_fulfill:
            tx.status = Transaction.Status.FAILED
            tx.description += " (ОТМЕНЕНА: Часть товаров из корзины раскуплена)"
            tx.save(update_fields=['status', 'description', 'updated_at'])
            return False

        # 4. Проводим начисление долей
        for item in share_items:
            proj = project_map[item['item_id']]
            shares = item['quantity']
            
            proj.available_shares -= shares
            if proj.available_shares == 0:
                proj.status = Project.Status.SOLD
            proj.save(update_fields=['available_shares', 'status', 'updated_at'])

            ownership, _ = Ownership.objects.get_or_create(
                user=user, project=proj,
                defaults={'shares_amount': 0, 'average_buy_price': Decimal('0.00')}
            )
            item_price_per_share = Decimal(item['price_per_share'])
            old_total = Decimal(ownership.shares_amount) * ownership.average_buy_price
            new_total = Decimal(shares) * item_price_per_share
            
            ownership.shares_amount += shares
            ownership.average_buy_price = (old_total + new_total) / Decimal(ownership.shares_amount)
            ownership.save(update_fields=['shares_amount', 'average_buy_price', 'updated_at'])

        # 4.1 Проводим начисление активов
        for item in asset_items:
            asset = asset_map[item['item_id']]
            qty = item['quantity']
            
            if asset.is_unique:
                asset.status = Asset.Status.SOLD
                asset.save(update_fields=['status', 'updated_at'])
                
            for _ in range(qty):
                AssetOwnership.objects.create(
                    user=user, asset=asset, purchase_price=Decimal(item['price'])
                )

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
        
class PassimPayWebhookView(APIView):
    permission_classes = [AllowAny] # Webhook должен быть открыт для серверов PassimPay

    def post(self, request):
        # PassimPay присылает данные в формате form-data
        data = request.data
        
        platform_id = data.get('platform_id')
        transaction_id = data.get('order_id') # Это наш ID транзакции
        amount = data.get('amount')
        txhash = data.get('txhash')
        received_hash = data.get('hash')

        # TODO: Добавить проверку HMAC-хэша с помощью PASSIMPAY_API_KEY для защиты от фейковых запросов,
        # как только убедимся в формате их подписи (обычно это sha256 от склеенных параметров).

        if transaction_id:
            # Твоя родная функция сделает всю магию!
            success = fulfill_order(transaction_id)
            
            if success:
                # Опционально: сохраняем хэш транзакции в блокчейне для истории
                tx = Transaction.objects.filter(id=transaction_id).first()
                if tx:
                    tx.reference_id = txhash
                    tx.save(update_fields=['reference_id'])
                    
                return Response({"status": "success"}, status=200)
            else:
                return Response({"detail": "Корзина недействительна (доли раскуплены)"}, status=400)
                
        return Response({"error": "Invalid data"}, status=400)