from rest_framework import serializers
from django.contrib.auth import get_user_model
from billing.models import Wallet

User = get_user_model()

class CustomUserDetailsSerializer(serializers.ModelSerializer):
    """
    Сериализатор, который dj-rest-auth будет отдавать при успешном логине 
    или при запросе /api/auth/user/
    """
    balance = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'balance')
        read_only_fields = ('id', 'email', 'balance')

    def get_balance(self, obj):
        # Получаем или создаем кошелек прозрачно для пользователя
        wallet, _ = Wallet.objects.get_or_create(user=obj)
        return str(wallet.balance)  # Отдаем строкой для безопасности чисел на JS