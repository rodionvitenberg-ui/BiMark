from django.db import models

class SiteTranslation(models.Model):
    class Meta:
        managed = False
        verbose_name = 'Тексты сайта (JSON)'
        verbose_name_plural = 'Тексты сайта (JSON)'