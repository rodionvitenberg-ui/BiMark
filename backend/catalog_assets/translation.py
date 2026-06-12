# catalog_assets/translation.py
from modeltranslation.translator import register, TranslationOptions
from .models import Asset, SoldUniqueAsset, AssetCategory, AssetTag, MetricDefinition, AssetMetricValue

@register(Asset)
class AssetTranslationOptions(TranslationOptions):
    # Оригинальные поля перевода ассета полностью сохранены
    fields = ('title', 'short_description', 'description', 'image') 

@register(SoldUniqueAsset)
class SoldUniqueAssetTranslationOptions(TranslationOptions):
    # Прокси-модель наследует поля родителя
    fields = ('title', 'short_description', 'description', 'image')

@register(AssetCategory)
class AssetCategoryTranslationOptions(TranslationOptions):
    """Локализация категорий уникальных проектов"""
    fields = ('name',)

@register(AssetTag)
class AssetTagTranslationOptions(TranslationOptions):
    """Локализация динамических тегов"""
    fields = ('name',)

@register(MetricDefinition)
class MetricDefinitionTranslationOptions(TranslationOptions):
    """Локализация названий параметров аудита Due Diligence"""
    fields = ('name',)

@register(AssetMetricValue)
class AssetMetricValueTranslationOptions(TranslationOptions):
    """Локализация конкретных текстовых значений метрик лота"""
    fields = ('value',)