import uuid
from django.db import models
from django.conf import settings
from .utils import process_image_to_webp
from tinymce.models import HTMLField

class AssetCategory(models.Model):
    """
    Отдельная изолированная модель категорий для уникальных активов (проектов целиком).
    Исключает пересечение с краудфандинговыми категориями долей.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Название категории")
    slug = models.SlugField(unique=True, db_index=True, verbose_name="Слаг (для URL)")
    image = models.ImageField(upload_to='assets_categories/', null=True, blank=True, verbose_name="Изображение")
    is_hidden = models.BooleanField(
        default=False, 
        verbose_name="Скрыть из каталога",
        help_text="Если включено, категория не будет выводиться в общем списке на витрине."
    )

    class Meta:
        db_table = 'asset_categories'
        verbose_name = 'Категория актива'
        verbose_name_plural = 'Категории активов'

    def save(self, *args, **kwargs):
        # 1. Сначала оптимизируем картинку в памяти, если она была загружена
        if self.image:
            process_image_to_webp(self.image, max_width=800, quality=85) # Для категорий можно чуть меньше ширину
        
        # 2. Вызываем стандартное сохранение Django в базу
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class AssetTag(models.Model):
    """
    Динамические теги для ассетов (например: 'Высокий ROI', 'Срочно', 'Верифицирован').
    Позволяют гибко размечать характер и особенности бизнеса без хардкода.
    """
    name = models.CharField(max_length=50, verbose_name="Название тега")
    slug = models.SlugField(max_length=60, unique=True, blank=True, null=True, verbose_name="Слаг (для фильтров)")
    color = models.CharField(max_length=7, default="#3B82F6", verbose_name="Цвет плашки (HEX)", help_text="Например: #3B82F6")
    show_on_card = models.BooleanField(
        default=True, 
        verbose_name="Показывать на карточке",
        help_text="Если выключено, тег отобразится только на детальной странице ассета."
    )

    class Meta:
        db_table = 'asset_tags'
        verbose_name = "Тег актива"
        verbose_name_plural = "Теги активов"

    def __str__(self):
        return self.name


class MetricDefinition(models.Model):
    """
    Справочник характеристик для Due Diligence (например: 'Расходы на трафик', 'Окупаемость').
    Максим создает саму сущность характеристики один раз здесь.
    """
    name = models.CharField(max_length=100, verbose_name="Название характеристики")
    icon = models.CharField(
        max_length=50, 
        blank=True, 
        verbose_name="Иконка (Lucide)", 
        help_text="Название иконки для фронтенда, например: 'Users', 'TrendingUp', 'Activity'."
    )
    show_on_card = models.BooleanField(
        default=True, 
        verbose_name="Показывать на карточке",
        help_text="Определяет, выводить ли эту характеристику на плитке в общем каталоге."
    )
    order = models.PositiveIntegerField(
        default=0, 
        verbose_name="Порядок сортировки",
        help_text="Чем меньше число, тем выше строчка отобразится в таблице аудита."
    )

    class Meta:
        db_table = 'asset_metric_definitions'
        ordering = ['order', 'id']
        verbose_name = "Определение характеристики (DD)"
        verbose_name_plural = "Определения характеристик (DD)"

    def __str__(self):
        return self.name


class Asset(models.Model):
    """
    Модель самого актива (Проекта целиком).
    Вся оригинальная структура полей полностью сохранена для обратной совместимости.
    """
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Черновик'
        ACTIVE = 'ACTIVE', 'В продаже'
        SOLD = 'SOLD', 'Продано'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Название")
    short_description = models.CharField(
        max_length=500, 
        blank=True, 
        verbose_name="Краткое описание",
        help_text="Буквально 1-2 предложения для красивого отображения на плитке в каталоге."
    )
    description = HTMLField(verbose_name="Описание")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Цена ($)")
    image = models.ImageField(upload_to='assets_images/', blank=True, null=True, verbose_name="Изображение")
    
    is_new = models.BooleanField(
        default=True, 
        verbose_name="Новый актив",
        help_text="Если включено, актив отображается с пометкой 'Новый' на витрине."
    )
    is_hidden = models.BooleanField(
        default=False, 
        verbose_name="Скрыть из каталога",
        help_text="Если включено, проект не будет виден в общем каталоге, но будет доступен по прямой ссылке."
    )
    is_unique = models.BooleanField(
        default=False, 
        verbose_name="Уникальный актив",
        help_text="Если включено, актив продается в одни руки и после покупки получает статус 'Продано'."
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, verbose_name="Статус")
    
    # --- НОВЫЕ СВЯЗИ И ХАРАКТЕРИСТИКИ ---
    category = models.ForeignKey(
        AssetCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assets', 
        verbose_name="Категория"
    )
    tags = models.ManyToManyField(
        AssetTag, 
        blank=True, 
        related_name='assets', 
        verbose_name="Теги актива"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assets'
        ordering = ['-created_at']
        verbose_name = "Актив (Проект целиком)"
        verbose_name_plural = "Активы (Проекты целиком)"

    def save(self, *args, **kwargs):
        # 1. Перед отправкой в базу жмем картинку ассета до 1200px по ширине
        if self.image:
            process_image_to_webp(self.image, max_width=1200, quality=80)
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} (${self.price})"


class AssetMetricValue(models.Model):
    """
    Таблица значений аудита (Due Diligence).
    Связывает конкретный Asset с определением из MetricDefinition и хранит значение.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asset = models.ForeignKey(
        Asset, 
        on_delete=models.CASCADE, 
        related_name='metric_values', 
        verbose_name="Актив"
    )
    metric = models.ForeignKey(
        MetricDefinition, 
        on_delete=models.CASCADE, 
        related_name='values', 
        verbose_name="Характеристика"
    )
    value = models.CharField(
        max_length=255, 
        verbose_name="Значение",
        help_text="Например: '$350/мес', '2 человека', 'Органика (95%)'."
    )

    class Meta:
        db_table = 'asset_metric_values'
        unique_together = ('asset', 'metric')
        verbose_name = "Значение характеристики лота"
        verbose_name_plural = "Значения характеристик лота"

    def __str__(self):
        return f"{self.asset.title} — {self.metric.name}: {self.value}"


# --- ОРИГИНАЛЬНЫЕ ПРОКСИ И КЛАССЫ ВЛАДЕНИЯ (БЕЗ ИЗМЕНЕНИЙ) ---

class SoldUniqueAsset(Asset):
    """Прокси-модель для отдельного раздела в админке"""
    class Meta:
        proxy = True
        verbose_name = "Проданный уникальный актив"
        verbose_name_plural = "Проданные уникальные активы"


class AssetOwnership(models.Model):
    """Модель хранения логов и фактов владения купленой единицей цифрового бизнеса"""
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