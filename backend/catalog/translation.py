from modeltranslation.translator import register, TranslationOptions
from catalog.models import Project, Category, Token

@register(Category)
class CategoryTranslationOptions(TranslationOptions):
    fields = ('name',) # Переводим название категории

@register(Project)
class ProjectTranslationOptions(TranslationOptions):
    fields = ('title', 'description', 'short_description', 'image')

@register(Token)
class TokenTranslationOptions(TranslationOptions):
    # Указываем строго те же поля, что и у оригинальной модели Project
    fields = ('title', 'description', 'short_description')