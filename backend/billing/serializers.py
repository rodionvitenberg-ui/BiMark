from rest_framework import serializers
from billing.models import Wallet, Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'status', 'description', 'created_at']
        read_only_fields = fields

class WalletSerializer(serializers.ModelSerializer):
    # Явно указываем balance, так как это @property, а не поле БД
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'updated_at']