from rest_framework import serializers
from billing.models import Wallet, Transaction

class TransactionSerializer(serializers.ModelSerializer):
    # Мапим поле type из базы данных в transaction_type для фронтенда
    transaction_type = serializers.CharField(source='type')

    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'transaction_type', 'status', 'description', 'created_at']
        read_only_fields = fields

class WalletSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'updated_at']