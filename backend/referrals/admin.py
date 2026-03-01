from django.contrib import admin
from .models import Referral

@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_referrer', 'get_referred', 'created_at')
    search_fields = ('referrer__email', 'referred__email')
    readonly_fields = ('created_at',)

    @admin.display(description='Кто пригласил (Рефовод)')
    def get_referrer(self, obj):
        return obj.referrer.email

    @admin.display(description='Кого пригласили (Реферал)')
    def get_referred(self, obj):
        return obj.referred.email