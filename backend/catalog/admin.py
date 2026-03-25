from django.contrib import admin
from modeltranslation.admin import TabbedTranslationAdmin
from .models import Project, Ownership, Category, Token, TokenOwnership

@admin.register(Project)
class ProjectAdmin(TabbedTranslationAdmin):
    list_display = ('title', 'status', 'price_per_share', 'total_shares', 'available_shares', 'is_hidden', 'is_new')
    list_filter = ('status', 'created_at', 'category', 'is_hidden', 'is_new')
    search_fields = ('title', 'slug')
    autocomplete_fields = ('category',)
    
    fieldsets = (
        ('Основная информация', {
            # ДОБАВЛЕНО: 'category' и 'image'
            'fields': ('title', 'short_description', 'description', 'slug', 'category', 'image', 'status', 'is_new', 'is_hidden') 
        }),
        ('Финансы и доли', {
            'fields': ('price_per_share', 'total_shares', 'available_shares')
        }),
    )

    def get_queryset(self, request):
        """Скрываем токены из раздела классических проектов"""
        qs = super().get_queryset(request)
        return qs.filter(is_token=False)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_hidden')
    # Эта магия будет автоматически писать slug (например, "it-startups"), пока ты вводишь название
    prepopulated_fields = {'slug': ('name',)} 
    search_fields = ('name',)

@admin.register(Ownership)
class OwnershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'shares_amount', 'average_buy_price', 'created_at')
    search_fields = ('user__email', 'project__title')
    def get_queryset(self, request):
        """Скрываем владения токенами из обычных портфелей"""
        qs = super().get_queryset(request)
        return qs.filter(project__is_token=False)
    
@admin.register(Token)
class TokenAdmin(TabbedTranslationAdmin):
    # Можешь настроить колонки специально под токены, убрав лишнее!
    list_display = ('title', 'status', 'price_per_share', 'total_shares', 'available_shares')
    search_fields = ('title', 'slug')
    # Скрываем поле is_token из формы, менеджеру оно не нужно
    exclude = ('is_token',) 
    
    def get_queryset(self, request):
        """Показываем ТОЛЬКО проекты-токены"""
        qs = super().get_queryset(request)
        return qs.filter(is_token=True)

    def save_model(self, request, obj, form, change):
        """Хак: если менеджер создает токен отсюда, автоматически ставим флаг"""
        obj.is_token = True
        super().save_model(request, obj, form, change)

@admin.register(TokenOwnership)
class TokenOwnershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'shares_amount', 'average_buy_price')
    search_fields = ('user__email', 'project__title')
    
    def get_queryset(self, request):
        """Показываем владения ТОЛЬКО токенами"""
        qs = super().get_queryset(request)
        return qs.filter(project__is_token=True)