from django.contrib import admin
from django.contrib import messages
from .models import Wallet, Transaction
from .models import Transaction, ProjectTransaction, AssetTransaction, PaymentSettings

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_user_email', 'get_balance', 'updated_at')
    search_fields = ('user__email',)
    readonly_fields = ('id', 'user') # Кошельки нельзя переназначать другим юзерам

    @admin.display(description='Пользователь')
    def get_user_email(self, obj):
        return obj.user.email

    @admin.display(description='Текущий баланс')
    def get_balance(self, obj):
        return obj.balance

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_user', 'amount', 'type', 'status', 'created_at')
    list_filter = ('type', 'status', 'created_at')
    search_fields = ('wallet__user__email', 'reference_id')
    readonly_fields = ('id', 'wallet', 'amount', 'type', 'reference_id', 'created_at')
    
    actions = ['approve_withdrawals', 'reject_withdrawals']

    @admin.display(description='Пользователь', ordering='wallet__user__email')
    def get_user(self, obj):
        return obj.wallet.user.email

    @admin.action(description='✅ Одобрить выбранные заявки на вывод')
    def approve_withdrawals(self, request, queryset):
        # Фильтруем только те транзакции, которые являются выводом и в статусе PENDING
        pending_withdrawals = queryset.filter(type=Transaction.Type.WITHDRAW, status=Transaction.Status.PENDING)
        updated_count = pending_withdrawals.update(status=Transaction.Status.COMPLETED)
        
        self.message_user(
            request, 
            f'Успешно одобрено заявок на вывод: {updated_count}.', 
            messages.SUCCESS
        )
    # Запрещаем удалять транзакции всем, кроме суперюзера (владельца)
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
        
    # Разрешаем изменять только статус и описание (чтобы менеджер случайно не поменял сумму!)
    def get_readonly_fields(self, request, obj=None):
        if obj and not request.user.is_superuser:
            # Если это менеджер, он не может менять сумму, тип и кошелек
            return ('wallet', 'type', 'amount', 'created_at')
        return ('created_at',)

    @admin.action(description='❌ Отклонить выбранные заявки на вывод')
    def reject_withdrawals(self, request, queryset):
        # Если менеджер отклоняет вывод, статус меняется на FAILED, 
        # и деньги автоматически "возвращаются" на баланс юзера 
        # (так как свойство balance перестанет вычитать эту транзакцию)
        pending_withdrawals = queryset.filter(type=Transaction.Type.WITHDRAW, status=Transaction.Status.PENDING)
        updated_count = pending_withdrawals.update(status=Transaction.Status.FAILED)
        
        self.message_user(
            request, 
            f'Отклонено заявок: {updated_count}. Средства снова доступны на балансах.', 
            messages.WARNING
        )
    
    def get_queryset(self, request):
        return super().get_queryset(request).exclude(
            type__in=['PURCHASE', 'PURCHASE_ASSET']
        )

@admin.register(PaymentSettings)
class PaymentSettingsAdmin(admin.ModelAdmin):
    # Убираем кнопку "Добавить", если настройка уже существует
    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)
    
@admin.register(ProjectTransaction)
class ProjectTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'wallet', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('wallet__user__email', 'id')

    def get_queryset(self, request):
        # ИСПРАВЛЕНО: используем type вместо transaction_type
        return super().get_queryset(request).filter(type='PURCHASE')

@admin.register(AssetTransaction)
class AssetTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'wallet', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('wallet__user__email', 'id')

    def get_queryset(self, request):
        # ИСПРАВЛЕНО: используем type вместо transaction_type
        return super().get_queryset(request).filter(type='PURCHASE_ASSET')