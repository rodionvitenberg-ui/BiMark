from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from billing.webhooks import StripeWebhookView, PayPalCaptureView

# ИЗМЕНЕНИЕ 1: Добавляем TokenViewSet в импорт из catalog.views
from catalog.views import ProjectViewSet, CheckoutView, PortfolioView, CategoryViewSet, TokenViewSet
from billing.views import WalletView, TransactionHistoryView, DepositView, WithdrawView 
from users.views import GoogleLogin, RequestOTPView, RegisterWithOTPView, PasswordResetRequestView, PasswordResetConfirmView

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'categories', CategoryViewSet, basename='category')

# ИЗМЕНЕНИЕ 2: Регистрируем новый маршрут для токенов
router.register(r'tokens', TokenViewSet, basename='token')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- Базовая авторизация ---
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/otp/request/', RequestOTPView.as_view(), name='otp_request'),
    path('api/auth/otp/register/', RegisterWithOTPView.as_view(), name='otp_register'),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    # --- Каталог и Портфель ---
    path('api/', include(router.urls)),
    path('api/portfolio/', PortfolioView.as_view(), name='portfolio'),
    
    # НОВЫЙ ЭНДПОИНТ КОРЗИНЫ:
    path('api/catalog/checkout/', CheckoutView.as_view(), name='checkout'),
    
    # --- Биллинг ---
    path('api/wallet/', WalletView.as_view(), name='wallet'),
    path('api/wallet/transactions/', TransactionHistoryView.as_view(), name='transactions'),
    path('api/wallet/deposit/', DepositView.as_view(), name='deposit'),
    path('api/wallet/withdraw/', WithdrawView.as_view(), name='withdraw'), 
    
    # --- Webhooks ---
    path('api/webhooks/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('api/webhooks/paypal/capture/', PayPalCaptureView.as_view(), name='paypal-capture'),
    path('api/webhooks/triplea/', TripleAWebhookView.as_view(), name='triplea-webhook'),

    # Маршруты для восстановления пароля
    path('api/users/password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/users/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)