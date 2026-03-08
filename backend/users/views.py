from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from dj_rest_auth.utils import jwt_encode
from dj_rest_auth.jwt_auth import set_jwt_cookies
import uuid
from referrals.models import Referral

from .models import User, OTPCode
from .serializers import OTPRequestSerializer, OTPRegistrationSerializer

class GoogleLogin(SocialLoginView):
    """
    Эндпоинт для Google авторизации.
    Next.js должен отправить POST запрос сюда с телом:
    {"access_token": "токен_полученный_от_google"}
    """
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    
    # Callback URL здесь нужен формально для библиотеки, 
    # он должен совпадать с тем, что настроен в Google Cloud и Next.js.
    # В headless архитектуре реальный редирект происходит на клиенте.
    callback_url = 'http://localhost:3000/api/auth/callback/google'

class RequestOTPView(views.APIView):
    """Шаг 1: Запрос OTP кода на email"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = OTPCode.generate_for_email(email)

        # Отправляем письмо
        send_mail(
            subject='Ваш код подтверждения регистрации',
            message=f'Ваш 6-значный код: {otp.code}. Он действителен 10 минут.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({"detail": "Код отправлен на почту."}, status=status.HTTP_200_OK)

class RegisterWithOTPView(views.APIView):
    """Шаг 2 и 3: Проверка кода и установка пароля"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        
        # Помечаем код как использованный
        otp_obj = data['otp_obj']
        otp_obj.is_used = True
        otp_obj.save()

        # Генерируем уникальный username
        base_username = data['email'].split('@')[0]
        unique_username = f"{base_username}_{uuid.uuid4().hex[:8]}"

        # Создаем пользователя
        user = User.objects.create_user(
            username=unique_username,
            email=data['email'],
            password=data['password']
        )

        # --- НОВАЯ ЛОГИКА РЕФЕРАЛОВ ---
        # Пытаемся получить ref из валидированных данных сериализатора
        ref_id = data.get('ref')
        if ref_id:
            try:
                # Проверяем, существует ли пользователь с таким ID
                referrer = User.objects.get(id=ref_id)
                # Если да, создаем связь в базе
                Referral.objects.create(referrer=referrer, referred=user)
            except (User.DoesNotExist, ValueError):
                # Если ссылка битая или ID не является UUID - просто игнорируем
                pass 
        # --- КОНЕЦ НОВОЙ ЛОГИКИ ---

        # Генерируем токены для автоматического входа
        access_token, refresh_token = jwt_encode(user)
        
        response = Response({
            "detail": "Пользователь успешно зарегистрирован.",
            "user": {
                "id": user.id,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)

        # Безопасно устанавливаем httpOnly куки
        set_jwt_cookies(response, access_token, refresh_token)

        return response