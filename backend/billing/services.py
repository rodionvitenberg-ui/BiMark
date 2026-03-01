from decimal import Decimal
from django.db import transaction, IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from .models import Wallet, Transaction
from .exceptions import InsufficientFunds, DuplicateTransaction

class WalletService:
    
    @classmethod
    @transaction.atomic
    def process_withdrawal_request(cls, wallet_id, amount: Decimal) -> Transaction:
        """
        Создает заявку на вывод средств. 
        Деньги 'замораживаются' (баланс уменьшается), статус PENDING.
        """
        if amount <= 0:
            raise ValueError("Сумма должна быть больше нуля.")

        # 1. БЛОКИРУЕМ КОШЕЛЕК. Все остальные транзакции для этого кошелька
        # будут ждать завершения этой транзакции БД.
        wallet = Wallet.objects.select_for_update().get(id=wallet_id)

        # 2. Проверяем баланс С УЧЕТОМ блокировки
        if wallet.balance < amount:
            raise InsufficientFunds(f"Недостаточно средств. Ваш баланс: {wallet.balance}")

        # 3. Создаем транзакцию (расход)
        tx = Transaction.objects.create(
            wallet=wallet,
            amount=amount,
            type=Transaction.Type.WITHDRAW,
            status=Transaction.Status.PENDING,
            description="Заявка на вывод средств"
        )
        return tx

    @classmethod
    @transaction.atomic
    def process_purchase(cls, wallet_id, amount: Decimal, description: str) -> Transaction:
        """
        Моментальное списание средств за покупку актива.
        """
        if amount <= 0:
            raise ValueError("Сумма должна быть больше нуля.")

        wallet = Wallet.objects.select_for_update().get(id=wallet_id)

        if wallet.balance < amount:
            raise InsufficientFunds("Недостаточно средств для покупки.")

        tx = Transaction.objects.create(
            wallet=wallet,
            amount=amount,
            type=Transaction.Type.PURCHASE,
            status=Transaction.Status.COMPLETED,
            description=description
        )
        return tx

    @classmethod
    @transaction.atomic
    def process_incoming_fiat_crypto(cls, wallet_id, amount: Decimal, reference_id: str, description: str = "") -> Transaction:
        """
        Обработка входящего платежа (Stripe / Crypto Webhook).
        Идемпотентная операция: защищена reference_id.
        """
        if amount <= 0:
            raise ValueError("Сумма пополнения должна быть больше нуля.")

        # Проверка на дубликат до блокировки (для скорости)
        if Transaction.objects.filter(reference_id=reference_id).exists():
            raise DuplicateTransaction(f"Транзакция {reference_id} уже обработана.")

        wallet = Wallet.objects.select_for_update().get(id=wallet_id)

        try:
            tx = Transaction.objects.create(
                wallet=wallet,
                amount=amount,
                type=Transaction.Type.DEPOSIT,
                status=Transaction.Status.COMPLETED,
                reference_id=reference_id,
                description=description
            )
            return tx
        except IntegrityError:
            # Если два параллельных вебхука проскочили первую проверку,
            # уникальный индекс в БД (unique=True на reference_id) выкинет IntegrityError
            raise DuplicateTransaction("Параллельная попытка создания дубликата.")
        
    @classmethod
    @transaction.atomic
    def process_referral_bonus(cls, wallet_id, amount: Decimal, description: str) -> Transaction:
        """
        Начисляет реферальный бонус на кошелек.
        """
        if amount <= 0:
            return None

        # Блокируем кошелек получателя бонуса
        wallet = Wallet.objects.select_for_update().get(id=wallet_id)

        tx = Transaction.objects.create(
            wallet=wallet,
            amount=amount,
            type=Transaction.Type.REFERRAL,
            status=Transaction.Status.COMPLETED,
            description=description
        )
        return tx