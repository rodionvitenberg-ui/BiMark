# catalog/tests.py
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from catalog.models import Project, Ownership
from catalog.services import PurchaseService, NotEnoughShares
from billing.models import Wallet, Transaction
from billing.services import WalletService
from billing.exceptions import InsufficientFunds

User = get_user_model()

class PurchaseServiceTransactionTest(TestCase):
    def setUp(self):
        """Подготовка данных перед каждым тестом"""
        self.user = User.objects.create_user(username='testuser', email='test@test.com', password='password')
        self.wallet = Wallet.objects.create(user=self.user)
        
        # Начисляем 1000 на баланс
        WalletService.process_incoming_fiat_crypto(
            wallet_id=self.wallet.id,
            amount=Decimal('1000.00'),
            reference_id='INIT_DEPOSIT',
            description='Initial'
        )
        
        # Создаем проект (10 долей по 100)
        self.project = Project.objects.create(
            title_en='Test Project',
            slug='test-project',
            price_per_share=Decimal('100.00'),
            total_shares=10,
            available_shares=10,
            status=Project.Status.PRESALE
        )

    def test_successful_purchase(self):
        """Тест 1: Успешная покупка 2 долей"""
        ownership, tx = PurchaseService.buy_shares(
            user=self.user,
            project_id=self.project.id,
            shares_to_buy=2
        )
        
        # Проверяем, что баланс уменьшился на 200 (1000 - 200 = 800)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal('800.00'))
        
        # Проверяем проект (осталось 8 долей)
        self.project.refresh_from_db()
        self.assertEqual(self.project.available_shares, 8)
        
        # Проверяем портфель
        self.assertEqual(ownership.shares_amount, 2)
        self.assertEqual(ownership.average_buy_price, Decimal('100.00'))
        
        # Проверяем транзакцию
        self.assertEqual(tx.amount, Decimal('200.00'))
        self.assertEqual(tx.type, Transaction.Type.PURCHASE)

    def test_insufficient_funds(self):
        """Тест 2: Попытка купить больше, чем есть денег на балансе"""
        # У юзера 1000$. Поднимем цену до 500$ за долю.
        # Покупка 3 долей обойдется в 1500$, что вызовет InsufficientFunds,
        # при этом 3 доли легко укладываются в доступные 10.
        self.project.price_per_share = Decimal('500.00')
        self.project.save()

        with self.assertRaises(InsufficientFunds):
            PurchaseService.buy_shares(
                user=self.user,
                project_id=self.project.id,
                shares_to_buy=3
            )
        
        # Убеждаемся, что баланс НЕ изменился, а доли НЕ списались
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal('1000.00'))
        
        self.project.refresh_from_db()
        self.assertEqual(self.project.available_shares, 10)

    def test_not_enough_shares(self):
        """Тест 3: Попытка купить долей больше, чем доступно в проекте"""
        # Сначала дадим юзеру кучу денег
        WalletService.process_incoming_fiat_crypto(
            wallet_id=self.wallet.id,
            amount=Decimal('5000.00'),
            reference_id='EXTRA_DEPOSIT',
            description='Extra'
        )
        
        # Пытаемся купить 15 долей, хотя всего доступно 10
        with self.assertRaises(NotEnoughShares):
            PurchaseService.buy_shares(
                user=self.user,
                project_id=self.project.id,
                shares_to_buy=15
            )

    def test_average_buy_price_calculation(self):
        """Тест 4: Пересчет средней цены при докупке (DCA - Dollar Cost Averaging)"""
        # Покупаем 2 доли по 100
        PurchaseService.buy_shares(self.user, self.project.id, 2)
        
        # Меняем цену проекта на 150 (имитация роста цены)
        self.project.price_per_share = Decimal('150.00')
        self.project.save()
        
        # Докупаем еще 2 доли (теперь уже по 150)
        ownership, _ = PurchaseService.buy_shares(self.user, self.project.id, 2)
        
        # Проверяем формулу: (2*100 + 2*150) / 4 = 125.00
        self.assertEqual(ownership.shares_amount, 4)
        self.assertEqual(ownership.average_buy_price, Decimal('125.00'))