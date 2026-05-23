import uuid
from django.db import models

class AssistantConfig(models.Model):
    class ModelChoices(models.TextChoices):
        # OpenAI
        GPT_4O = 'gpt-4o', 'OpenAI GPT-4o'
        GPT_4O_MINI = 'gpt-4o-mini', 'OpenAI GPT-4o-Mini'
        # DeepSeek
        DEEPSEEK_CHAT = 'deepseek-chat', 'DeepSeek Chat (V3)'
        DEEPSEEK_REASONER = 'deepseek-reasoner', 'DeepSeek Reasoner (R1)'
        # Кастомный вариант
        CUSTOM_PROXY = 'custom-proxy', 'Кастомный OpenAI-совместимый Прокси'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    is_active = models.BooleanField(
        default=True, 
        verbose_name="Ассистент активен",
        help_text="Если отключено, виджет чата не будет отображаться на фронтенде."
    )
    
    model_name = models.CharField(
        max_length=50, 
        choices=ModelChoices.choices, 
        default=ModelChoices.GPT_4O_MINI,
        verbose_name="Используемая модель"
    )
    
    temperature = models.FloatField(
        default=0.3,
        verbose_name="Температура (Креативность)",
        help_text="Рекомендуется 0.1 - 0.4 для точных финансовых консультаций. Для deepseek-reasoner этот параметр игнорируется API."
    )
    
    system_prompt = models.TextField(
        verbose_name="Системный промт (Инструкции для ИИ)",
        help_text="Здесь задаются Tone of Voice, ограничения и базовая информация о BiMark."
    )

    # Настройки авторизации провайдеров
    openai_api_key = models.CharField(
        max_length=255, blank=True, null=True,
        verbose_name="API Ключ OpenAI",
        help_text="Оставьте пустым, если используете только DeepSeek."
    )
    
    deepseek_api_key = models.CharField(
        max_length=255, blank=True, null=True,
        verbose_name="API Ключ DeepSeek",
        help_text="Ключ от платформы api.deepseek.com"
    )

    custom_proxy_url = models.URLField(
        blank=True, null=True,
        verbose_name="Кастомный Base URL (для прокси)",
        help_text="Заполняется только при выборе 'Кастомный Прокси'."
    )
    custom_proxy_key = models.CharField(
        max_length=255, blank=True, null=True,
        verbose_name="API Ключ кастомного прокси"
    )
    
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата изменения")

    class Meta:
        verbose_name = "Конфигурация ИИ Ассистента"
        verbose_name_plural = "Конфигурация ИИ Ассистента"

    def __str__(self):
        return f"Настройки ИИ ({self.get_model_name_display()})"

    def save(self, *args, **kwargs):
        if not self.pk and AssistantConfig.objects.exists():
            self.pk = AssistantConfig.objects.first().pk
        super().save(*args, **kwargs)

class AssistantQuickReply(models.Model):
    class LocaleChoices(models.TextChoices):
        RU = 'ru', 'Russian'
        EN = 'en', 'English'
        ES = 'es', 'Spanish'

    path = models.CharField(
        max_length=255, 
        default="/", 
        verbose_name="Путь страницы (URL)",
        help_text="Например: '/' для главной, '/token' для страницы токена."
    )
    locale = models.CharField(
        max_length=10, 
        choices=LocaleChoices.choices, 
        default=LocaleChoices.EN,
        verbose_name="Язык интерфейса"
    )
    text = models.CharField(
        max_length=255, 
        verbose_name="Текст быстрой подсказки"
    )
    order = models.PositiveIntegerField(
        default=0, 
        verbose_name="Порядок сортировки",
        help_text="Чем меньше число, тем левее/выше будет кнопка на сайте."
    )

    class Meta:
        db_table = 'assistant_quick_replies'
        ordering = ['order', 'id']
        verbose_name = "Быстрая подсказка сайта"
        verbose_name_plural = "Быстрые подсказки сайта"

    def __str__(self):
        return f"[{self.locale.upper()}] {self.path} — {self.text}"