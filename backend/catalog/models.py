import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

class Category(models.Model):
    """Категории проектов (например: YouTube, Telegram, IT-Стартапы)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, db_index=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    is_hidden = models.BooleanField(
        default=False, 
        verbose_name="Скрыть из каталога",
        help_text="Если включено, категория не будет выводиться в общем списке на фронтенде."
    )
    
    # Если используешь modeltranslation, поля name_ru, name_en добавятся автоматически
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name

class Project(models.Model):
    """Модель самого актива (YouTube канал, соцсеть и т.д.)"""
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Черновик'
        PRESALE = 'PRESALE', 'Сбор средств (Пресейл)'
        ACTIVE = 'ACTIVE', 'Сбор закрыт / Активен'
        SOLD = 'SOLD', 'Продан полностью (Экзит)'
        
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='projects')
    image = models.ImageField(upload_to='projects/', null=True, blank=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, db_index=True)
    description = models.TextField()
    short_description = models.TextField(
        max_length=500, 
        blank=True, 
        verbose_name="Краткое описание",
        help_text="Выводится на карточках в карусели на главной странице"
    )
    is_hidden = models.BooleanField(
        default=False, 
        verbose_name="Скрыть из каталога",
        help_text="Если включено, проект не будет виден в общем каталоге, но будет доступен по прямой ссылке (например, для токена BMK)."
    )
    is_new = models.BooleanField(
        default=True, 
        verbose_name="Новинка",
        help_text="Показывать проект в специальном блоке новинок на фронтенде."
    )
    is_token = models.BooleanField(
        default=False,
        verbose_name="Это токен",
        help_text="Если включено, актив будет считаться токеном и управляться в отдельном разделе админки."
    )
    
    # Финансовая математика проекта
    price_per_share = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Цена за одну долю"
    )
    total_shares = models.PositiveIntegerField(
        help_text="Сколько всего долей выпущено"
    )
    available_shares = models.PositiveIntegerField(
        help_text="Сколько долей осталось для покупки"
    )
    
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.DRAFT, 
        db_index=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'

    def __str__(self):
        return f"{self.title} | {self.available_shares}/{self.total_shares} долей"


class Ownership(models.Model):
    """
    Таблица владения (Портфель пользователя).
    Связывает User и Project по принципу Many-to-Many.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='portfolio'
    )
    project = models.ForeignKey(
        Project, 
        on_delete=models.PROTECT, 
        related_name='owners'
    )
    
    # Количество купленных долей. 
    # Если доли можно дробить (например, купить 0.5 доли), нужно менять на DecimalField.
    # Но для классических бизнес-долей обычно используют целые числа.
    shares_amount = models.PositiveIntegerField(default=0)
    
    # Сохраняем среднюю цену покупки. Это критически важно для Личного Кабинета!
    # Если цена доли меняется со временем, юзер должен видеть свою личную доходность (ROI), 
    # исходя из того, по какой цене покупал именно он.
    average_buy_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=Decimal('0.00')
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ownerships'
        # Один пользователь = одна запись портфеля для конкретного проекта. 
        # При докупке мы просто обновляем shares_amount и пересчитываем average_buy_price.
        unique_together = ('user', 'project')
        verbose_name = 'Владение долей'
        verbose_name_plural = 'Владения долями'

    def __str__(self):
        return f"{self.user.email} -> {self.project.title} ({self.shares_amount} шт.)"
    pass

class Token(Project):
    """Прокси-модель для вывода токенов в отдельный раздел админки"""
    class Meta:
        proxy = True # Важно! Новая таблица в БД создана НЕ БУДЕТ
        verbose_name = 'Токен'
        verbose_name_plural = 'Токены'

class TokenOwnership(Ownership):
    """Прокси-модель для разделения портфелей юзеров"""
    class Meta:
        proxy = True
        verbose_name = 'Владение токеном'
        verbose_name_plural = 'Владения токенами'