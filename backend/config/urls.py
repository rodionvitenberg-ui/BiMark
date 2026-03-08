from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from billing.webhooks import StripeWebhookView

# Импорты из наших приложений
from catalog.views import ProjectViewSet, CheckoutView, PortfolioView, CategoryViewSet
from billing.views import WalletView, TransactionHistoryView, DepositView, WithdrawView # Добавили WithdrawView
from users.views import GoogleLogin, RequestOTPView, RegisterWithOTPView

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'categories', CategoryViewSet, basename='category')

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
    path('api/wallet/withdraw/', WithdrawView.as_view(), name='withdraw'), # Новый эндпоинт вывода
    
    # --- Webhooks ---
    path('api/webhooks/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),

    path('api/cms/', include('cms.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)