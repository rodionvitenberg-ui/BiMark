import uuid
from django.db import models
from django.utils.text import slugify
from tinymce.models import HTMLField

class SiteTranslation(models.Model):
    class Meta:
        managed = False
        verbose_name = 'Тексты сайта (JSON)'
        verbose_name_plural = 'Тексты сайта (JSON)'

class Article(models.Model):
    class LocaleChoices(models.TextChoices):
        RU = 'ru', 'Russian'
        EN = 'en', 'English'
        ES = 'es', 'Spanish'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Заголовок статьи")
    slug = models.SlugField(unique=True, max_length=255, db_index=True, verbose_name="Slug (URL)")
    locale = models.CharField(max_length=10, choices=LocaleChoices.choices, default=LocaleChoices.EN, verbose_name="Язык статьи")
    
    # Новое поле для обложки статьи
    preview_image = models.ImageField(
        upload_to='blog/previews/', 
        blank=True, 
        null=True, 
        verbose_name="Обложка-превью статьи"
    )
    
    short_description = models.TextField(max_length=500, verbose_name="Краткое описание (для превью)")
    content = HTMLField(verbose_name="Тело статьи (Разметка)")
    is_published = models.BooleanField(default=True, verbose_name="Опубликовано")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        db_table = 'cms_articles'
        ordering = ['-created_at']
        verbose_name = "Статья для GEO/SEO"
        verbose_name_plural = "Статьи для GEO/SEO"

    def __str__(self):
        return f"[{self.locale.upper()}] {self.title}"