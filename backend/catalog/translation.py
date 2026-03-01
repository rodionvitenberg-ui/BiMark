from modeltranslation.translator import register, TranslationOptions
from catalog.models import Project

@register(Project)
class ProjectTranslationOptions(TranslationOptions):
    fields = ('title', 'description', 'category')
    # fallback_values = _('--перевод отсутствует--') # Можно настроить дефолтный текст