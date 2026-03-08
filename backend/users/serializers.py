from rest_framework import serializers
from django.contrib.auth import get_user_model
from billing.models import Wallet
from django.contrib.auth.password_validation import validate_password
from .models import OTPCode

User = get_user_model()

class CustomUserDetailsSerializer(serializers.ModelSerializer):
    """
    Сериализатор, который dj-rest-auth будет отдавать при успешном логине 
    или при запросе /api/auth/user/
    """
    balance = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'balance')
        read_only_fields = ('id', 'email', 'balance')

    def get_balance(self, obj):
        # Получаем или создаем кошелек прозрачно для пользователя
        wallet, _ = Wallet.objects.get_or_create(user=obj)
        return str(wallet.balance)  # Отдаем строкой для безопасности чисел на JS
    
class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # Если юзер с таким email уже есть, не даем зарегистрироваться снова
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует.")
        return value

class OTPRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    # --- НОВОЕ ПОЛЕ ДЛЯ РЕФЕРАЛКИ ---
    ref = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate(self, data):
        email = data.get('email')
        code = data.get('code')

        # Ищем последний сгенерированный код для этого email
        otp = OTPCode.objects.filter(email=email).first()

        if not otp or otp.code != code:
            raise serializers.ValidationError({"code": "Неверный код подтверждения."})
        
        if not otp.is_valid():
            raise serializers.ValidationError({"code": "Срок действия кода истек."})

        # Передаем объект otp дальше, чтобы пометить его как использованный
        data['otp_obj'] = otp 
        return data