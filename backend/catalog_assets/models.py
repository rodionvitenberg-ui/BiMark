import uuid
from django.db import models
from django.conf import settings

class Asset(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Черновик'
        ACTIVE = 'ACTIVE', 'В продаже'
        SOLD = 'SOLD', 'Продано'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Цена ($)")
    image = models.ImageField(upload_to='assets_images/', blank=True, null=True, verbose_name="Изображение")
    
    is_unique = models.BooleanField(
        default=False, 
        verbose_name="Уникальный актив",
        help_text="Если включено, актив продается в одни руки и после покупки получает статус 'Продано'."
    )
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.DRAFT, 
        verbose_name="Статус",
        db_index=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assets'
        ordering = ['-created_at']
        verbose_name = "Актив (Проект целиком)"
        verbose_name_plural = "Активы (Проекты целиком)"

    def __str__(self):
        return f"{self.title} (${self.price})"

# Магия: Прокси-модель для отдельного раздела в админке
class SoldUniqueAsset(Asset):
    class Meta:
        proxy = True # Указываем Django не создавать отдельную таблицу в БД
        verbose_name = "Проданный уникальный актив"
        verbose_name_plural = "Проданные уникальные активы"

class AssetOwnership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='asset_ownerships'
    )
    asset = models.ForeignKey(
        Asset, 
        on_delete=models.PROTECT, 
        related_name='owners'
    )
    purchase_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        verbose_name="Цена покупки"
    )
    purchased_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'asset_ownerships'
        ordering = ['-purchased_at']
        verbose_name = "Владение активом"
        verbose_name_plural = "Владения активами"

    def __str__(self):
        return f"{self.user.email} -> {self.asset.title}"