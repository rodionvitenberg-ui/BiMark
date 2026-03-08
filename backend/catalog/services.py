import stripe
from django.conf import settings
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from catalog.models import Project, Ownership
from billing.models import Wallet, Transaction # Добавили Transaction
from billing.services import WalletService
from billing.exceptions import InsufficientFunds
from referrals.services import ReferralService
from billing.paypal import create_paypal_order
from billing.triplea import create_triplea_payment

stripe.api_key = settings.STRIPE_SECRET_KEY

class CatalogError(Exception):
    """Базовый класс ошибок каталога"""
    pass

class NotEnoughShares(CatalogError):
    """Недостаточно долей для покупки"""
    pass

class PurchaseService:
    
    @classmethod
    @transaction.atomic
    def process_checkout(cls, user, items: list, payment_method: str):
        """
        Обработка корзины покупок.
        items: [{"project_id": "uuid", "shares_amount": 5}, ...]
        """
        # 1. Извлекаем ID и СОРТИРУЕМ ИХ для предотвращения Deadlock!
        project_ids = sorted([item['project_id'] for item in items])
        
        # 2. Блокируем проекты в строгом порядке
        projects = list(Project.objects.select_for_update().filter(id__in=project_ids))
        if len(projects) != len(set(project_ids)):
            raise ValidationError("Один или несколько проектов не найдены.")
            
        project_map = {str(p.id): p for p in projects}
        
        total_price = Decimal('0.00')
        cart_details = []
        
        # 3. Валидируем корзину и считаем общую сумму
        for item in items:
            proj_id = str(item['project_id'])
            shares = item['shares_amount']
            proj = project_map[proj_id]
            
            if proj.status not in [Project.Status.PRESALE, Project.Status.ACTIVE]:
                raise ValidationError(f"Проект {proj.title} недоступен для покупки.")
            if proj.available_shares < shares:
                raise NotEnoughShares(f"Недостаточно долей в {proj.title}. Доступно: {proj.available_shares}")
                
            cost = proj.price_per_share * Decimal(shares)
            total_price += cost
            
            cart_details.append({
                "project_id": proj_id,
                "shares": shares,
                "price_per_share": str(proj.price_per_share),
                "cost": str(cost)
            })

        # 4. Маршрутизация оплаты
        if payment_method == 'BALANCE':
            return cls._process_balance_checkout(user, project_map, cart_details, total_price)
        elif payment_method == 'STRIPE':
            return cls._process_stripe_checkout(user, cart_details, total_price)
        elif payment_method == 'PAYPAL': # --- НОВОЕ УСЛОВИЕ ---
            return cls._process_paypal_checkout(user, cart_details, total_price)
        elif payment_method == 'TRIPLEA': # <-- ДОБАВЛЯЕМ ВЕТВЛЕНИЕ
            return cls._process_triplea_checkout(user, cart_details, total_price)
        else:
            raise ValidationError("Неизвестный метод оплаты.")

    @classmethod
    def _process_balance_checkout(cls, user, project_map, cart_details, total_price):
        """Мгновенное списание средств и начисление долей"""
        
        # Списываем общую сумму с баланса (WalletService сам проверит нехватку средств)
        tx = WalletService.process_purchase(
            wallet_id=user.wallet.id,
            amount=total_price,
            description=f"Оплата корзины ({len(cart_details)} позиций)"
        )
        # Сохраняем состав корзины для истории
        tx.metadata = {"cart": cart_details}
        tx.save(update_fields=['metadata'])

        ownership_ids = []

        # Обновляем проекты и портфель юзера
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

            old_total_value = Decimal(ownership.shares_amount) * ownership.average_buy_price
            new_total_value = Decimal(shares) * proj.price_per_share
            
            ownership.shares_amount += shares
            ownership.average_buy_price = (old_total_value + new_total_value) / Decimal(ownership.shares_amount)
            ownership.save(update_fields=['shares_amount', 'average_buy_price', 'updated_at'])
            
            ownership_ids.append(str(ownership.id))

        # Начисляем реферальный бонус с общей суммы корзины
        ReferralService.process_purchase_bonus(user=user, amount_spent=total_price)

        return {
            "status": "success",
            "message": "Корзина успешно оплачена",
            "ownership_ids": ownership_ids
        }

    @classmethod
    def _process_stripe_checkout(cls, user, cart_details, total_price):
        """Формирование PENDING транзакции для Stripe"""
        import stripe
        from django.conf import settings
        stripe.api_key = settings.STRIPE_SECRET_KEY

        # Создаем транзакцию. Сохраняем корзину в metadata, чтобы прочитать её при вебхуке!
        pending_tx = Transaction.objects.create(
            wallet=user.wallet,
            amount=total_price,
            type=Transaction.Type.PURCHASE,
            status=Transaction.Status.PENDING,
            description=f"Stripe Checkout ({len(cart_details)} позиций)",
            metadata={"cart": cart_details}
        )

        amount_in_cents = int(total_price * 100)

        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency='usd',
            metadata={
                'transaction_id': str(pending_tx.id),
                'user_id': str(user.id),
            }
        )

        return {
            "status": "pending_payment",
            "transaction_id": str(pending_tx.id),
            "client_secret": intent.client_secret,
            "message": "Ожидается оплата картой"
        }
    
    @classmethod
    def _process_paypal_checkout(cls, user, cart_details, total_price):
        """Формирование PENDING транзакции и заказа для PayPal"""
        
        # 1. Создаем PENDING транзакцию, как в Stripe
        pending_tx = Transaction.objects.create(
            wallet=user.wallet,
            amount=total_price,
            type=Transaction.Type.PURCHASE,
            status=Transaction.Status.PENDING,
            description=f"PayPal Checkout ({len(cart_details)} позиций)",
            metadata={"cart": cart_details}
        )

        # 2. Делаем API запрос к PayPal для создания заказа
        try:
            # Отправляем сумму в PayPal
            paypal_order = create_paypal_order(amount=total_price)
            order_id = paypal_order.get("id")
            
            return {
                "status": "pending_payment",
                "transaction_id": str(pending_tx.id),
                "order_id": order_id, # Отдаем фронту ID заказа PayPal
                "payment_gateway": "paypal",
                "message": "Ожидается оплата через PayPal"
            }
        except Exception as e:
            # Если серверы PayPal лежат или упали, помечаем транзакцию как Failed
            pending_tx.status = Transaction.Status.FAILED
            pending_tx.description = "Ошибка при создании заказа в API PayPal"
            pending_tx.save(update_fields=['status', 'description'])
            raise ValidationError(f"Ошибка шлюза PayPal: {str(e)}")
    
    @classmethod
    def _process_triplea_checkout(cls, user, cart_details, total_price):
        pending_tx = Transaction.objects.create(
            wallet=user.wallet,
            amount=total_price,
            type=Transaction.Type.PURCHASE,
            status=Transaction.Status.PENDING,
            description=f"Crypto Checkout ({len(cart_details)} позиций)",
            metadata={"cart": cart_details}
        )

        try:
            payment_data = create_triplea_payment(amount=total_price, reference_id=pending_tx.id)
            
            return {
                "status": "pending_payment",
                "transaction_id": str(pending_tx.id),
                "hosted_url": payment_data.get("hosted_url"), # <-- Ссылка на оплату Triple-A
                "payment_gateway": "triplea",
                "message": "Ожидается оплата криптовалютой"
            }
        except Exception as e:
            pending_tx.status = Transaction.Status.FAILED
            pending_tx.description = "Ошибка Triple-A API"
            pending_tx.save(update_fields=['status', 'description'])
            raise ValidationError("Сервис оплаты криптовалютой временно недоступен.")
    
