from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings

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