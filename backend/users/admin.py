from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Убираем username из поиска и отображения, так как мы перешли на email
    list_display = ('email', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('email',)
    ordering = ('-date_joined',)
    
    # Переопределяем поля формы в админке, убирая username
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Персональная информация', {'fields': ('email',)}),
        ('Реферальная система', {
            'fields': ('personal_referral_percent',),
            'description': 'Укажите процент (например, 10.00). Если оставить пустым, будет применяться стандартный процент системы.'
        }),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Форма создания юзера из админки
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password'),
        }),
    )