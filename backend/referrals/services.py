from decimal import Decimal
from django.conf import settings
from .models import Referral
from billing.models import Wallet
from billing.services import WalletService

class ReferralService:
    
    @classmethod
    def process_purchase_bonus(cls, user, purchase_amount: Decimal, project_title: str):
        """
        Высчитывает и начисляет бонус пригласившему (если он есть) при покупке доли.
        """
        try:
            # Ищем, кто пригласил этого пользователя
            referral = Referral.objects.select_related('referrer').get(referred=user)
            referrer = referral.referrer
        except Referral.DoesNotExist:
            return None  # Пользователь пришел сам, без ссылки

        # Считаем бонус (Сумма * Процент / 100)
        percent = getattr(settings, 'REFERRAL_PURCHASE_PERCENT', Decimal('5.0'))
        bonus_amount = (purchase_amount * percent / Decimal('100')).quantize(Decimal('0.01'))

        if bonus_amount > 0:
            # Получаем кошелек пригласившего
            wallet, _ = Wallet.objects.get_or_create(user=referrer)
            
            description = f"Реферальный бонус ({percent}%) за покупку в проекте '{project_title}' пользователем {user.email}"
            
            # Начисляем деньги через надежный сервис
            return WalletService.process_referral_bonus(
                wallet_id=wallet.id, 
                amount=bonus_amount, 
                description=description
            )
        return None