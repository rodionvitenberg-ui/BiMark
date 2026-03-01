from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from billing.models import Wallet, Transaction
from billing.serializers import WalletSerializer, TransactionSerializer

class WalletView(views.APIView):
    """
    Текущий баланс и данные кошелька.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)

class TransactionHistoryView(views.APIView):
    """
    История транзакций пользователя.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Оптимизация: делаем join кошелька, чтобы не дергать БД на каждую транзакцию
        transactions = Transaction.objects.filter(wallet__user=request.user)[:50] 
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)