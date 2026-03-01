import uuid
from django.db import models
from django.conf import settings

class Referral(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Тот, чья ссылка (кто пригласил)
    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='referrals_made'
    )
    
    # Тот, кто зарегистрировался по ссылке (приглашенный)
    # OneToOneField гарантирует, что юзера нельзя сделать чьим-то рефералом дважды
    referred = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='referred_by'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'referrals'
        verbose_name = 'Реферал'
        verbose_name_plural = 'Рефералы'
        # В Django 6.0 используем condition вместо check
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(referrer=models.F('referred')),
                name='referrer_is_not_referred'
            )
        ]

    def __str__(self):
        return f"{self.referrer.email} пригласил {self.referred.email}"