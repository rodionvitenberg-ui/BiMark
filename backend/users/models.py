import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
import random

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True, db_index=True)
    
    # Флаг для мягкого удаления (soft delete) вместо физического
    is_deleted = models.BooleanField(default=False)

    personal_referral_percent = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        help_text="Индивидуальный реферальный процент. Если пусто, используется базовый."
    )

    # Переопределяем логин по email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.email
    
class OTPCode(models.Model):
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'otp_codes'
        verbose_name = 'OTP Код'
        verbose_name_plural = 'OTP Коды'
        ordering = ['-created_at']

    def is_valid(self):
        """Код валиден, если он не использован и прошло меньше 10 минут"""
        return not self.is_used and (timezone.now() - self.created_at) < timedelta(minutes=10)

    @classmethod
    def generate_for_email(cls, email):
        """Генерирует новый 6-значный код для email"""
        code = str(random.randint(100000, 999999))
        return cls.objects.create(email=email, code=code)

    def __str__(self):
        return f"{self.email} - {self.code}"