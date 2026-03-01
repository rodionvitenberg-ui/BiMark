from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Импорты из наших приложений
from catalog.views import ProjectViewSet, BuySharesView, PortfolioView
from billing.views import WalletView, TransactionHistoryView
from users.views import GoogleLogin  # <--- Тот самый недостающий импорт

# Роутер для ViewSets (автоматически создаст /api/projects/ и /api/projects/<slug>/)
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- Базовая авторизация (Email/Password) ---
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # --- Социальная авторизация ---
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    # --- Каталог и Портфель ---
    path('api/', include(router.urls)), # Включает все маршруты router
    path('api/projects/<uuid:project_id>/buy/', BuySharesView.as_view(), name='buy-shares'),
    path('api/portfolio/', PortfolioView.as_view(), name='portfolio'),
    
    # --- Биллинг ---
    path('api/wallet/', WalletView.as_view(), name='wallet'),
    path('api/wallet/transactions/', TransactionHistoryView.as_view(), name='transactions'),
]