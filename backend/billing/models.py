import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.db.models import Sum

class Wallet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='wallet'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'
        verbose_name = 'Кошелек'
        verbose_name_plural = 'Кошельки'

    @property
    def balance(self) -> Decimal:
        # Считаем приходы
        deposits = self.transactions.filter(
            status=Transaction.Status.COMPLETED,
            type__in=[Transaction.Type.DEPOSIT, Transaction.Type.REFERRAL]
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Считаем расходы (Добавили PURCHASE_ASSET)
        withdrawals = self.transactions.filter(
            status=Transaction.Status.COMPLETED,
            type__in=[Transaction.Type.WITHDRAW, Transaction.Type.PURCHASE, Transaction.Type.PURCHASE_ASSET]
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        return deposits - withdrawals

    def __str__(self):
        return f"Wallet {self.id} | User: {self.user.email}"


class Transaction(models.Model):
    class Type(models.TextChoices):
        DEPOSIT = 'DEPOSIT', 'Пополнение'
        WITHDRAW = 'WITHDRAW', 'Вывод'
        PURCHASE = 'PURCHASE', 'Покупка долей'
        PURCHASE_ASSET = 'PURCHASE_ASSET', 'Покупка проекта целиком' # <-- Новый тип
        REFERRAL = 'REFERRAL', 'Реферальный бонус'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'В обработке'
        COMPLETED = 'COMPLETED', 'Успешно'
        FAILED = 'FAILED', 'Отклонено / Ошибка'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(
        Wallet, 
        on_delete=models.PROTECT, 
        related_name='transactions'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=20, choices=Type.choices, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    reference_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} | {self.amount} | {self.status}"