from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from django.db import transaction
from rest_framework.views import APIView
from billing.passimpay import create_passimpay_invoice

from billing.models import Wallet, Transaction, PaymentSettings
from billing.serializers import WalletSerializer, TransactionSerializer
from billing.services import WalletService
from billing.exceptions import InsufficientFunds

class WalletView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)

class TransactionHistoryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(wallet__user=request.user).order_by('-created_at')[:50] 
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    
class DepositView(APIView):
    """
    Создание инвойса на пополнение криптой через PassimPay.
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

        wallet = Wallet.objects.get(user=request.user)
        
        # Создаем транзакцию
        tx = Transaction.objects.create(
            wallet=wallet,
            type=Transaction.Type.DEPOSIT,
            amount=amount,
            status=Transaction.Status.PENDING,
            description="Пополнение баланса (Криптовалюта)"
        )

        try:
            # Стучимся в PassimPay за ссылкой
            payment_url = create_passimpay_invoice(transaction_id=tx.id, amount_usd=amount)
            
            if not payment_url:
                raise Exception("PassimPay не вернул ссылку на оплату")
            
            return Response({
                "detail": "Ожидается оплата криптовалютой",
                "transaction_id": tx.id,
                "hosted_url": payment_url  # Отдаем ссылку фронтенду
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Если PassimPay упал, отменяем транзакцию
            tx.status = Transaction.Status.FAILED
            tx.description = f"Ошибка кассы: {str(e)}"
            tx.save(update_fields=['status', 'description'])
            return Response({"detail": f"Ошибка сервиса оплаты: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class WithdrawView(views.APIView):
    """
    Создание заявки на вывод средств.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount_str = request.data.get('amount')
        wallet_address = request.data.get('wallet_address') # Куда юзер хочет получить деньги
        
        if not amount_str or not wallet_address:
            return Response({"detail": "Укажите сумму и адрес кошелька."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = Decimal(str(amount_str))
        except (ValueError, TypeError, Decimal.InvalidOperation):
            return Response({"detail": "Некорректная сумма."}, status=status.HTTP_400_BAD_REQUEST)

        wallet = Wallet.objects.get(user=request.user)

        try:
            # Твой готовый метод из services.py безопасно спишет баланс и создаст PENDING транзакцию
            tx = WalletService.process_withdrawal_request(wallet_id=wallet.id, amount=amount)
            
            # Допишем реквизиты в описание, чтобы админ знал, куда переводить
            tx.description = f"Вывод на кошелек: {wallet_address}"
            tx.save(update_fields=['description'])

            return Response({
                "detail": "Заявка на вывод успешно создана.",
                "transaction_id": tx.id
            }, status=status.HTTP_200_OK)

        except InsufficientFunds as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class WalletView(APIView):
    def get(self, request):
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        settings = PaymentSettings.load() # Загружаем настройки из БД
        
        return Response({
            "id": wallet.id,
            "balance": str(wallet.balance),
            # Подкидываем кошелек компании в тот же запрос:
            "company_wallet": settings.company_crypto_wallet 
        })