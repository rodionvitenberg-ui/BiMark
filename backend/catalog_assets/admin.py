from django.contrib import admin
from modeltranslation.admin import TranslationAdmin, TranslationTabularInline
from .models import Asset, AssetCategory, AssetTag, MetricDefinition, AssetMetricValue, SoldUniqueAsset, AssetOwnership

class AssetMetricValueInline(TranslationTabularInline):
    """
    Инлайн-форма для заполнения Due Diligence характеристик прямо внутри Ассета.
    Позволяет на лету выбирать тип метрики и вносить мультиязычные значения.
    """
    model = AssetMetricValue
    extra = 1
    verbose_name = "Характеристика Due Diligence"
    verbose_name_plural = "Характеристики Due Diligence (Аудит)"


@admin.register(AssetCategory)
class AssetCategoryAdmin(TranslationAdmin):
    """Управление изолированными категориями уникальных проектов целиком"""
    list_display = ('name', 'slug', 'is_hidden')
    list_filter = ('is_hidden',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(AssetTag)
class AssetTagAdmin(TranslationAdmin):
    """Управление маркетинговыми и информационными тегами"""
    list_display = ('name', 'slug', 'color', 'show_on_card')
    list_filter = ('show_on_card',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(MetricDefinition)
class MetricDefinitionAdmin(TranslationAdmin):
    """Конструктор (справочник) строк для Due Diligence таблицы"""
    list_display = ('name', 'icon', 'show_on_card', 'order')
    list_editable = ('show_on_card', 'order')
    search_fields = ('name',)


@admin.register(Asset)
class AssetAdmin(TranslationAdmin):
    """
    Основная модель Актива.
    Вся оригинальная логика фильтрации и queryset полностью сохранена.
    """
    # Расширили список столбцов категорией
    list_display = ('title', 'category', 'price', 'is_unique', 'is_new', 'is_hidden', 'status', 'created_at')
    
    # Добавили фильтрацию по новым категориям
    list_filter = ('status', 'category', 'is_unique', 'is_new', 'is_hidden')
    search_fields = ('title',)
    
    # Горизонтальный виджет для удобного выбора тегов кликами (без зажатия Ctrl)
    filter_horizontal = ('tags',)
    
    # Инлайн таблицы аудита Due Diligence
    inlines = [AssetMetricValueInline]

    # Красивая группировка полей (fieldsets) под интерфейс Jazzmin
    fieldsets = (
        ("Основная информация лота", {
            'fields': ('title', 'category', 'short_description', 'description', 'price', 'image')
        }),
        ("Системные флаги витрины", {
            'fields': ('is_new', 'is_hidden', 'is_unique', 'status')
        }),
        ("Визуальные акценты и метки", {
            'fields': ('tags',),
            'description': 'Теги, помогающие выделить особенности актива на карточке или странице лота.'
        }),
    )

    def get_queryset(self, request):
        # Оригинальное исключение проданных уникальных активов сохранено в первозданном виде
        qs = super().get_queryset(request)
        return qs.exclude(is_unique=True, status=Asset.Status.SOLD)


@admin.register(SoldUniqueAsset)
class SoldUniqueAssetAdmin(TranslationAdmin):
    """Прокси-раздел для архивных проданных проектов в одни руки"""
    list_display = ('title', 'price', 'get_owner', 'updated_at')
    search_fields = ('title', 'owners__user__email')
    
    # Защищаем связные поля от случайного изменения постфактум
    readonly_fields = ('title', 'description', 'price', 'is_unique', 'status', 'image', 'category', 'tags')
    
    def has_add_permission(self, request):
        return False
        
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(is_unique=True, status=Asset.Status.SOLD)

    @admin.display(description='Владелец')
    def get_owner(self, obj):
        ownership = obj.owners.first()
        return ownership.user.email if ownership else "—"


@admin.register(AssetOwnership)
class AssetOwnershipAdmin(admin.ModelAdmin):
    """Журнал фактов купли-продажи бизнесов. Изменения не вносились для стабильности биллинга"""
    list_display = ('user', 'asset', 'purchase_price', 'purchased_at')
    list_filter = ('purchased_at',)
    search_fields = ('user__email', 'asset__title')