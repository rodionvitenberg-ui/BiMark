from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from decimal import Decimal
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
    
class DepositView(views.APIView):
    """
    Эндпоинт для пополнения баланса.
    Ожидает JSON: {"amount": 100}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount_str = request.data.get('amount')
        
        if not amount_str:
            return Response({"detail": "Сумма не указана."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = Decimal(str(amount_str))
            if amount <= 0:
                raise ValueError
        except (ValueError, TypeError, Decimal.InvalidOperation):
            return Response({"detail": "Некорректная сумма."}, status=status.HTTP_400_BAD_REQUEST)

        # Оборачиваем в транзакцию базы данных для безопасности
        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().get(user=request.user)
            
            # ПРОСТО СОЗДАЕМ ТРАНЗАКЦИЮ.
            # Баланс пересчитается автоматически благодаря @property в моделях!
            tx = Transaction.objects.create(
                wallet=wallet,
                type=Transaction.Type.DEPOSIT,
                amount=amount,
                status=Transaction.Status.COMPLETED,
                description="Пополнение баланса (тест)"
            )
            
            # Сохраняем только время обновления кошелька
            wallet.save(update_fields=['updated_at'])

        return Response({
            "detail": "Баланс успешно пополнен",
            "new_balance": wallet.balance, # Вызываем свойство, оно вернет пересчитанную сумму
            "transaction_id": tx.id
        }, status=status.HTTP_200_OK)