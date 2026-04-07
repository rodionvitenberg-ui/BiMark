import stripe
from django.conf import settings
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from catalog.models import Project, Ownership
from catalog_assets.models import Asset, AssetOwnership # <--- ИМПОРТ НОВЫХ МОДЕЛЕЙ
from billing.models import Wallet, Transaction
from billing.services import WalletService
from billing.exceptions import InsufficientFunds
from referrals.services import ReferralService
from billing.paypal import create_paypal_order
from billing.triplea import create_triplea_payment
from billing.passimpay import create_passimpay_invoice

stripe.api_key = settings.STRIPE_SECRET_KEY

class CatalogError(Exception):
    pass

class NotEnoughShares(CatalogError):
    pass

class PurchaseService:
    
    @classmethod
    @transaction.atomic
    def process_checkout(cls, user, items: list, payment_method: str):
        """
        Обработка смешанной корзины покупок.
        items: [{"item_type": "share", "item_id": "uuid", "quantity": 5},
                {"item_type": "asset", "item_id": "uuid", "quantity": 1}]
        """
        # 1. Разделяем товары на две группы
        share_items = [i for i in items if i.get('item_type') == 'share']
        asset_items = [i for i in items if i.get('item_type') == 'asset']

        # 2. Блокируем проекты (Доли) от двойных списаний
        project_map = {}
        if share_items:
            project_ids = sorted([str(i['item_id']) for i in share_items])
            projects = list(Project.objects.select_for_update().filter(id__in=project_ids))
            if len(projects) != len(set(project_ids)):
                raise ValidationError("Один или несколько проектов (долей) не найдены.")
            project_map = {str(p.id): p for p in projects}

        # 3. Блокируем Активы (Проекты целиком)
        asset_map = {}
        if asset_items:
            asset_ids = sorted([str(i['item_id']) for i in asset_items])
            assets = list(Asset.objects.select_for_update().filter(id__in=asset_ids))
            if len(assets) != len(set(asset_ids)):
                raise ValidationError("Один или несколько активов не найдены.")
            asset_map = {str(a.id): a for a in assets}

        total_price = Decimal('0.00')
        cart_details = []

        # 4. Валидация ДОЛЕЙ
        for item in share_items:
            proj_id = str(item['item_id'])
            shares = item['quantity']
            proj = project_map[proj_id]
            
            if proj.status not in [Project.Status.PRESALE, Project.Status.ACTIVE]:
                raise ValidationError(f"Проект {proj.title} недоступен для покупки.")
            if proj.available_shares < shares:
                raise NotEnoughShares(f"Недостаточно долей в {proj.title}. Доступно: {proj.available_shares}")
                
            cost = proj.price_per_share * Decimal(shares)
            total_price += cost
            
            cart_details.append({
                "item_type": "share",
                "item_id": proj_id,
                "quantity": shares,
                "price_per_share": str(proj.price_per_share),
                "cost": str(cost)
            })

        # 5. Валидация АКТИВОВ ЦЕЛИКОМ
        for item in asset_items:
            a_id = str(item['item_id'])
            qty = item['quantity']
            asset = asset_map[a_id]
            
            if asset.status != Asset.Status.ACTIVE:
                raise ValidationError(f"Актив {asset.title} недоступен (статус: {asset.get_status_display()}).")
            if asset.is_unique and qty > 1:
                raise ValidationError(f"Актив {asset.title} уникален, можно купить только 1 шт.")

            cost = asset.price * Decimal(qty)
            total_price += cost
            
            cart_details.append({
                "item_type": "asset",
                "item_id": a_id,
                "quantity": qty,
                "price": str(asset.price),
                "cost": str(cost),
                "is_unique": asset.is_unique
            })

        # 6. Маршрутизация оплаты
        if payment_method == 'BALANCE':
            return cls._process_balance_checkout(user, project_map, asset_map, cart_details, total_price)
        elif payment_method == 'STRIPE':
            return cls._process_stripe_checkout(user, cart_details, total_price)
        elif payment_method == 'PAYPAL':
            return cls._process_paypal_checkout(user, cart_details, total_price)
        elif payment_method == 'PASSIMPAY':
            return cls._process_passimpay_checkout(user, cart_details, total_price)
        else:
            raise ValidationError("Неизвестный метод оплаты.")

    @classmethod
    def _process_balance_checkout(cls, user, project_map, asset_map, cart_details, total_price):
        """Мгновенное списание средств и начисление долей/активов"""
        
        tx = WalletService.process_purchase(
            wallet_id=user.wallet.id,
            amount=total_price,
            description=f"Оплата корзины ({len(cart_details)} позиций)"
        )
        tx.metadata = {"cart": cart_details}
        tx.save(update_fields=['metadata'])

        ownership_ids = []

        # Обновляем БД: выдаем купленное
        for item in cart_details:
            
            if item['item_type'] == 'share':
                # Выдача долей
                proj = project_map[item['item_id']]
                shares = item['quantity']
                
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
                
                ownership_ids.append(f"share_{ownership.id}")
                
            elif item['item_type'] == 'asset':
                # Выдача активов целиком
                asset = asset_map[item['item_id']]
                qty = item['quantity']

                # Если актив уникальный - снимаем с продажи
                if asset.is_unique:
                    asset.status = Asset.Status.SOLD
                    asset.save(update_fields=['status', 'updated_at'])

                # Создаем записи о владении активом (по одной на каждую единицу)
                for _ in range(qty):
                    asset_ownership = AssetOwnership.objects.create(
                        user=user,
                        asset=asset,
                        purchase_price=Decimal(item['price'])
                    )
                    ownership_ids.append(f"asset_{asset_ownership.id}")

        # Начисляем реферальный бонус с общей суммы корзины
        ReferralService.process_purchase_bonus(user=user, amount_spent=total_price)

        return {
            "status": "success",
            "message": "Корзина успешно оплачена",
            "ownership_ids": ownership_ids
        }

    # ... ниже остаются без изменений методы _process_stripe_checkout, 
    # _process_paypal_checkout и _process_triplea_checkout ...
    
    @classmethod
    def _process_stripe_checkout(cls, user, cart_details, total_price):
        # (Оставляешь свой старый код из этого метода)
        import stripe
        from django.conf import settings
        stripe.api_key = settings.STRIPE_SECRET_KEY

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
        # (Оставляешь свой старый код из этого метода)
        pending_tx = Transaction.objects.create(
            wallet=user.wallet,
            amount=total_price,
            type=Transaction.Type.PURCHASE,
            status=Transaction.Status.PENDING,
            description=f"PayPal Checkout ({len(cart_details)} позиций)",
            metadata={"cart": cart_details}
        )

        try:
            paypal_order = create_paypal_order(amount=total_price)
            order_id = paypal_order.get("id")
            
            return {
                "status": "pending_payment",
                "transaction_id": str(pending_tx.id),
                "order_id": order_id, 
                "payment_gateway": "paypal",
                "message": "Ожидается оплата через PayPal"
            }
        except Exception as e:
            pending_tx.status = Transaction.Status.FAILED
            pending_tx.description = "Ошибка при создании заказа в API PayPal"
            pending_tx.save(update_fields=['status', 'description'])
            raise ValidationError(f"Ошибка шлюза PayPal: {str(e)}")
    
    @classmethod
    def _process_passimpay_checkout(cls, user, cart_details, total_price):
        pending_tx = Transaction.objects.create(
            wallet=user.wallet,
            amount=total_price,
            type=Transaction.Type.PURCHASE,
            status=Transaction.Status.PENDING,
            description=f"Crypto Checkout ({len(cart_details)} позиций)",
            metadata={"cart": cart_details}
        )

        try:
            # Стучимся в наш passimpay.py
            payment_url = create_passimpay_invoice(transaction_id=pending_tx.id, amount_usd=total_price)
            
            if not payment_url:
                raise Exception("PassimPay не вернул ссылку на оплату")
            
            return {
                "status": "pending_payment",
                "transaction_id": str(pending_tx.id),
                "hosted_url": payment_url, 
                "payment_gateway": "passimpay", # <--- Указываем шлюз для фронта
                "message": "Ожидается оплата криптовалютой"
            }
        except Exception as e:
            raise ValidationError(f"Детали ошибки PassimPay: {str(e)}")