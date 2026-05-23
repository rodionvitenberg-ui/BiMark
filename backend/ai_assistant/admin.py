from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from .models import AssistantConfig, AssistantQuickReply

from django.contrib import admin
from .models import AssistantConfig, AssistantQuickReply

@admin.register(AssistantConfig)
class AssistantConfigAdmin(admin.ModelAdmin):
    # Таблица синглтон, так что выводим основные тумблеры в список
    list_display = ('model_name', 'temperature', 'is_active', 'is_tg_bot_active')
    list_editable = ('is_active', 'is_tg_bot_active')

    # Группируем поля по вкладкам/секциям для Максима
    fieldsets = (
        ("Глобальный тумблер", {
            'fields': ('is_active',)
        }),
        ("Настройки Нейросети", {
            'fields': ('model_name', 'temperature'),
        }),
        ("Ключи авторизации API", {
            'fields': ('openai_api_key', 'deepseek_api_key', 'custom_proxy_url', 'custom_proxy_key'),
            'description': 'Заполняйте только те ключи, которые соответствуют выбранной модели.'
        }),
        ("Интеграция с Telegram-ботом", {
            'fields': ('tg_bot_token', 'is_tg_bot_active'),
            'description': 'Параметры для управления автономным ботом-скаутом в мессенджере.'
        }),
    )

    def has_add_permission(self, request):
        # Запрещаем создавать больше одной конфигурации, так как это синглтон
        if AssistantConfig.objects.exists():
            return False
        return super().has_add_permission(request)

    def changelist_view(self, request, extra_context=None):
        obj, created = AssistantConfig.objects.get_or_create(
            defaults={
                "system_prompt": "Ты — официальный ИИ-ассистент инвестиционной платформы BiMark. Твоя задача — консультировать пользователей по доступным проектам и активам..."
            }
        )
        
        # ИСПРАВЛЕНО: Заменили self.model_meta на self.model._meta
        opts = self.model._meta
        return redirect(reverse(f'admin:{opts.app_label}_{opts.model_name}_change', args=(obj.pk,)))

@admin.register(AssistantQuickReply)    
class AssistantQuickReplyAdmin(admin.ModelAdmin):
    list_display = ('text', 'path', 'locale', 'order')
    list_filter = ('locale', 'path')
    search_fields = ('text', 'path')

