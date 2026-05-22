from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from .models import AssistantConfig

@admin.register(AssistantConfig)
class AssistantConfigAdmin(admin.ModelAdmin):
    list_display = ('model_name', 'temperature', 'is_active', 'updated_at')
    
    fieldsets = (
        ("Основное состояние", {
            'fields': ('is_active', 'model_name', 'temperature')
        }),
        ("Системные инструкции", {
            'fields': ('system_prompt',),
        }),
        ("Интеграция OpenAI", {
            'fields': ('openai_api_key',),
            'description': "Заполните, если выбрана модель семейства GPT."
        }),
        ("Интеграция DeepSeek", {
            'fields': ('deepseek_api_key',),
            'description': "Заполните, если выбрана модель семейства DeepSeek."
        }),
        ("Кастомный прокси", {
            'fields': ('custom_proxy_url', 'custom_proxy_key'),
            'description': "Используется только при выборе режима 'Кастомный Прокси'."
        }),
    )

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj, created = AssistantConfig.objects.get_or_create(
            defaults={
                "system_prompt": "Ты — официальный ИИ-ассистент инвестиционной платформы BiMark. Твоя задача — консультировать пользователей по доступным проектам и активам..."
            }
        )
        
        # ИСПРАВЛЕНО: Заменили self.model_meta на self.model._meta
        opts = self.model._meta
        return redirect(reverse(f'admin:{opts.app_label}_{opts.model_name}_change', args=(obj.pk,)))