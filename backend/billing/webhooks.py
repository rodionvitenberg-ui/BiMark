import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from decimal import Decimal
from django.db import transaction

from billing.models import Transaction
from catalog.models import Project, Ownership
from referrals.services import ReferralService

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            return HttpResponse(status=400)

        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            self.handle_successful_payment(payment_intent)

        return HttpResponse(status=200)

    @transaction.atomic
    def handle_successful_payment(self, payment_intent):
        metadata = payment_intent.get('metadata', {})
        # Stripe отдает нам только ID нашей транзакции
        transaction_id = metadata.get('transaction_id')

        if not transaction_id:
            return

        try:
            # 1. Блокируем транзакцию
            tx = Transaction.objects.select_for_update().get(
                id=transaction_id, 
                status=Transaction.Status.PENDING
            )
            user = tx.wallet.user
            
            # 2. Достаем корзину из метаданных, которые мы сохранили при создании PENDING транзакции
            cart_details = tx.metadata.get('cart', [])
            if not cart_details:
                return

            # 3. ЗАЩИТА ОТ ДЕДЛОКОВ: Сортируем ID проектов перед блокировкой в БД
            project_ids = sorted([item['project_id'] for item in cart_details])
            projects = list(Project.objects.select_for_update().filter(id__in=project_ids))
            project_map = {str(p.id): p for p in projects}

            # 4. ВАЛИДАЦИЯ ВСЕЙ КОРЗИНЫ (Хватит ли долей на все позиции?)
            can_fulfill = True
            for item in cart_details:
                proj = project_map.get(item['project_id'])
                if not proj or proj.available_shares < item['shares'] or proj.status not in [Project.Status.PRESALE, Project.Status.ACTIVE]:
                    can_fulfill = False
                    break

            # 5. Если хотя бы на один пункт долей не хватило - делаем полный Refund
            if not can_fulfill:
                stripe.Refund.create(payment_intent=payment_intent['id'])
                tx.status = Transaction.Status.FAILED
                tx.description += " (ОТМЕНЕНА: Часть долей из корзины раскуплена, оформлен полный возврат)"
                tx.save(update_fields=['status', 'description', 'updated_at'])
                return

            # 6. Долей хватает на всё. Проводим начисление по каждому проекту
            for item in cart_details:
                proj = project_map[item['project_id']]
                shares = item['shares']
                
                # Списываем доли проекта
                proj.available_shares -= shares
                if proj.available_shares == 0:
                    proj.status = Project.Status.SOLD
                proj.save(update_fields=['available_shares', 'status', 'updated_at'])

                # Начисляем в портфель пользователя
                ownership, _ = Ownership.objects.get_or_create(
                    user=user, 
                    project=proj,
                    defaults={'shares_amount': 0, 'average_buy_price': Decimal('0.00')}
                )

                # Математика средней цены (берем цену из корзины, на случай если в БД она успела измениться)
                item_price_per_share = Decimal(item['price_per_share'])
                old_total = Decimal(ownership.shares_amount) * ownership.average_buy_price
                new_total = Decimal(shares) * item_price_per_share
                
                ownership.shares_amount += shares
                ownership.average_buy_price = (old_total + new_total) / Decimal(ownership.shares_amount)
                ownership.save(update_fields=['shares_amount', 'average_buy_price', 'updated_at'])

            # 7. Закрываем транзакцию как успешную
            tx.status = Transaction.Status.COMPLETED
            tx.save(update_fields=['status', 'updated_at'])

            # 8. Начисляем реферальный бонус с общей суммы корзины
            ReferralService.process_purchase_bonus(user=user, amount_spent=tx.amount)

        except Transaction.DoesNotExist:
            pass # Транзакция уже обработана или не существует