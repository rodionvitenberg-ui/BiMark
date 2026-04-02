# catalog_assets/translation.py
from modeltranslation.translator import register, TranslationOptions
from .models import Asset, SoldUniqueAsset

@register(Asset)
class AssetTranslationOptions(TranslationOptions):
    # Те же поля, что и в Project
    fields = ('title', 'description', 'image') 

@register(SoldUniqueAsset)
class SoldUniqueAssetTranslationOptions(TranslationOptions):
    # Прокси-модель наследует поля родителя
    fields = ('title', 'description', 'image')