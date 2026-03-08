from modeltranslation.translator import register, TranslationOptions
from catalog.models import Project, Category

@register(Category)
class CategoryTranslationOptions(TranslationOptions):
    fields = ('name',) # Переводим название категории

@register(Project)
class ProjectTranslationOptions(TranslationOptions):
    fields = ('title', 'description') # Убрали 'category', так как переводим саму категорию выше