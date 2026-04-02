from django.contrib import admin
from .models import Asset, SoldUniqueAsset, AssetOwnership

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'is_unique', 'status', 'created_at')
    list_filter = ('status', 'is_unique')
    search_fields = ('title',)
    
    def get_queryset(self, request):
        # В основной вкладке прячем проданные УНИКАЛЬНЫЕ активы, чтобы не засорять витрину
        qs = super().get_queryset(request)
        return qs.exclude(is_unique=True, status=Asset.Status.SOLD)

@admin.register(SoldUniqueAsset)
class SoldUniqueAssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'get_owner', 'updated_at')
    search_fields = ('title', 'owners__user__email')
    readonly_fields = ('title', 'description', 'price', 'is_unique', 'status', 'image')
    
    def has_add_permission(self, request):
        # Запрещаем создавать активы прямо из папки "Проданные"
        return False
        
    def get_queryset(self, request):
        # Показываем ТОЛЬКО уникальные и проданные активы
        qs = super().get_queryset(request)
        return qs.filter(is_unique=True, status=Asset.Status.SOLD)

    @admin.display(description='Владелец')
    def get_owner(self, obj):
        ownership = obj.owners.first()
        return ownership.user.email if ownership else "—"

@admin.register(AssetOwnership)
class AssetOwnershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'asset', 'purchase_price', 'purchased_at')
    list_filter = ('purchased_at',)
    search_fields = ('user__email', 'asset__title')
    readonly_fields = ('user', 'asset', 'purchase_price', 'purchased_at')
    
    # Запрещаем удалять записи о владении руками
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser