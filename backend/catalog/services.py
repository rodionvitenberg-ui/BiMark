from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from catalog.models import Project, Ownership
from billing.models import Wallet
from billing.services import WalletService
from billing.exceptions import InsufficientFunds
from referrals.services import ReferralService

class CatalogError(Exception):
    """Базовый класс ошибок каталога"""
    pass

class NotEnoughShares(CatalogError):
    """Недостаточно долей для покупки"""
    pass

class PurchaseService:
    
    @classmethod
    @transaction.atomic
    def buy_shares(cls, user, project_id: str, shares_to_buy: int):
        """
        Полный цикл покупки долей проекта.
        """
        if shares_to_buy <= 0:
            raise ValueError("Количество долей должно быть больше нуля.")

        # 1. БЛОКИРУЕМ ПРОЕКТ (select_for_update).
        # Никто другой не сможет купить доли этого проекта, пока транзакция не завершится.
        project = Project.objects.select_for_update().get(id=project_id)

        # 2. Проверки бизнес-логики
        if project.status != Project.Status.PRESALE:
            raise ValidationError("Проект недоступен для покупки (сбор средств закрыт).")

        if project.available_shares < shares_to_buy:
            raise NotEnoughShares(f"Недостаточно долей. Осталось доступно: {project.available_shares}")

        # Вычисляем итоговую стоимость
        total_price = project.price_per_share * Decimal(shares_to_buy)

        # 3. СПИСЫВАЕМ СРЕДСТВА
        # Получаем кошелек. (Предполагается, что кошелек создается автоматически при регистрации)
        wallet = Wallet.objects.get(user=user)
        
        description = f"Покупка {shares_to_buy} долей в проекте '{project.title}'"
        
        # Вызываем наш надежный сервис из billing. 
        # Он сам заблокирует кошелек и проверит баланс. Если денег нет - выкинет InsufficientFunds,
        # и ВСЯ эта транзакция (включая блокировку проекта) автоматически откатится.
        tx = WalletService.process_purchase(wallet.id, total_price, description)

        # 4. ОБНОВЛЯЕМ ПРОЕКТ (Списываем доступные доли)
        project.available_shares -= shares_to_buy
        
        # Автоматическое закрытие пресейла, если всё раскупили
        if project.available_shares == 0:
            project.status = Project.Status.ACTIVE 
            
        project.save(update_fields=['available_shares', 'status'])

        # 5. ОБНОВЛЯЕМ ПОРТФЕЛЬ ПОЛЬЗОВАТЕЛЯ (Ownership)
        ownership, created = Ownership.objects.get_or_create(
            user=user,
            project=project,
            defaults={
                'shares_amount': 0,
                'average_buy_price': Decimal('0.00')
            }
        )

        # Пересчитываем среднюю цену покупки (Average Buy Price)
        # Формула: (Текущая_стоимость_портфеля + Стоимость_новой_покупки) / Новое_количество_долей
        current_total_value = Decimal(ownership.shares_amount) * ownership.average_buy_price
        new_total_value = current_total_value + total_price
        
        ownership.shares_amount += shares_to_buy
        ownership.average_buy_price = new_total_value / Decimal(ownership.shares_amount)
        
        ownership.save(update_fields=['shares_amount', 'average_buy_price'])

        # TODO: Интеграция с referrals. Вызов начисления % пригласившему юзеру.
        # ReferralService.process_purchase_bonus(user, total_price)

        ReferralService.process_purchase_bonus(
            user=user, 
            purchase_amount=total_price, 
            project_title=project.title
        )

        return ownership, tx