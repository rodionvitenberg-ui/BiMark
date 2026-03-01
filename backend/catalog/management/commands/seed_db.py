# catalog/management/commands/seed_db.py
import uuid
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from catalog.models import Project
from billing.services import WalletService
from billing.models import Wallet

User = get_user_model()

class Command(BaseCommand):
    help = 'Наполняет базу тестовыми данными (Пользователи, Проекты, Баланс)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Удаление старых данных (опционально)...')
        # Для чистоты эксперимента можно очистить таблицы, но в реальном проекте будь с этим осторожен!
        # Project.objects.all().delete()
        # User.objects.exclude(is_superuser=True).delete()

        self.stdout.write('Создание тестового пользователя...')
        user, created = User.objects.get_or_create(
            email='investor@youtube-shop.com',
            defaults={'username': 'investor'}
        )
        if created:
            user.set_password('testpassword123')
            user.save()

        # Создаем кошелек и начисляем $10,000 тестовых денег через наш надежный сервис
        wallet, _ = Wallet.objects.get_or_create(user=user)
        if wallet.balance == 0:
            WalletService.process_incoming_fiat_crypto(
                wallet_id=wallet.id,
                amount=Decimal('10000.00'),
                reference_id=f"SEED_DEPOSIT_{uuid.uuid4()}",
                description="Стартовый тестовый капитал"
            )

        self.stdout.write('Создание тестовых проектов...')
        project1, _ = Project.objects.get_or_create(
            slug='crypto-channel-100k',
            defaults={
                'title_ru': 'Крипто Канал 100k',
                'title_en': 'Crypto Channel 100k',
                'title_es': 'Canal Cripto 100k',
                'description_ru': 'Отличный актив с пассивным доходом.',
                'description_en': 'Great asset with passive income.',
                'description_es': 'Gran activo con ingresos pasivos.',
                'price_per_share': Decimal('150.00'),
                'total_shares': 100,
                'available_shares': 100,
                'status': Project.Status.PRESALE
            }
        )

        self.stdout.write(self.style.SUCCESS(f'Успешно! Юзер: {user.email}, Пароль: testpassword123, Баланс: $10,000'))