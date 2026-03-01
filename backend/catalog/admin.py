from django.contrib import admin
from modeltranslation.admin import TabbedTranslationAdmin
from .models import Project, Ownership

@admin.register(Project)
class ProjectAdmin(TabbedTranslationAdmin):
    list_display = ('title', 'status', 'price_per_share', 'total_shares', 'available_shares')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'slug')
    
    # Поля, которые будут отображаться во вкладках для каждого языка
    # slug, price_per_share и остальные финансовые поля общие для всех
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'slug', 'status')
        }),
        ('Финансы и доли', {
            'fields': ('price_per_share', 'total_shares', 'available_shares')
        }),
    )

@admin.register(Ownership)
class OwnershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'shares_amount', 'average_buy_price', 'created_at')
    search_fields = ('user__email', 'project__title')