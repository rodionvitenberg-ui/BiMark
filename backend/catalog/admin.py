from django.contrib import admin
from modeltranslation.admin import TabbedTranslationAdmin
from .models import Project, Ownership, Category

@admin.register(Project)
class ProjectAdmin(TabbedTranslationAdmin):
    list_display = ('title', 'status', 'price_per_share', 'total_shares', 'available_shares')
    list_filter = ('status', 'created_at', 'category')
    search_fields = ('title', 'slug')
    autocomplete_fields = ('category',)
    
    fieldsets = (
        ('Основная информация', {
            # ДОБАВЛЕНО: 'category' и 'image'
            'fields': ('title', 'description', 'slug', 'category', 'image', 'status') 
        }),
        ('Финансы и доли', {
            'fields': ('price_per_share', 'total_shares', 'available_shares')
        }),
    )

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    # Эта магия будет автоматически писать slug (например, "it-startups"), пока ты вводишь название
    prepopulated_fields = {'slug': ('name',)} 
    search_fields = ('name',)

@admin.register(Ownership)
class OwnershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'shares_amount', 'average_buy_price', 'created_at')
    search_fields = ('user__email', 'project__title')