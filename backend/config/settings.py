import os
from pathlib import Path
import environ
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Инициализируем django-environ с дефолтными типами
env = environ.Env(
    DEBUG=(bool, True),
    ALLOWED_HOSTS=(list, []),
    SECURE_SSL_REDIRECT=(bool, False),
    CSRF_TRUSTED_ORIGINS=(list, []),
    CORS_ALLOWED_ORIGINS=(list, []),
)

# Читаем .env файл (если он существует)
env_file = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_file):
    environ.Env.read_env(env_file)

# --- SECURITY WARNING ---
SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env('ALLOWED_HOSTS')

# Sub-path deploy (e.g. /bimark on maintest.site). Empty = root domain.
FORCE_SCRIPT_NAME = env('FORCE_SCRIPT_NAME', default='') or None
if FORCE_SCRIPT_NAME:
    FORCE_SCRIPT_NAME = FORCE_SCRIPT_NAME.rstrip('/') or None
    USE_X_FORWARDED_HOST = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# SSL redirect is handled by nginx/certbot; keep Django off by default.
SECURE_SSL_REDIRECT = env('SECURE_SSL_REDIRECT')

_csrf = env('CSRF_TRUSTED_ORIGINS')
CSRF_TRUSTED_ORIGINS = _csrf if _csrf else [
    'https://bimark.org',
    'https://www.bimark.org',
    'https://maintest.site',
    'http://maintest.site',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# --- APPS ---
INSTALLED_APPS = [
    'modeltranslation',
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',  # Обязательно для allauth

    # Third-party
    'rest_framework',
    'rest_framework.authtoken',  # Требуется для dj-rest-auth
    'corsheaders',
    'anymail',
    'tinymce',
    
    # Auth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'dj_rest_auth.registration',

    # Local Apps
    'users',
    'billing',
    'catalog',
    'referrals',
    'cms',
    'catalog_assets',
    'ai_assistant',
]

SITE_ID = 1

# Настройки DRF
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'dj_rest_auth.jwt_auth.JWTCookieAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# Настройки dj-rest-auth (cookie path=/ is fine for sub-path same-origin)
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'auth-access-token',
    'JWT_AUTH_REFRESH_COOKIE': 'auth-refresh-token',
    'JWT_AUTH_HTTPONLY': False,
    'USER_DETAILS_SERIALIZER': 'users.serializers.CustomUserDetailsSerializer',
}

# Настройки allauth (кастомный юзер на email)
ACCOUNT_USER_MODEL_USERNAME_FIELD = 'username'  # Указываем, что поле в БД все-таки есть
ACCOUNT_USERNAME_REQUIRED = False               # Но мы не требуем его от пользователя
ACCOUNT_EMAIL_REQUIRED = True                   # Email обязателен
ACCOUNT_AUTHENTICATION_METHOD = 'email'         # Логин по email (для старых версий allauth)
ACCOUNT_LOGIN_METHODS = {'email'}               # Логин по email (для новых версий allauth)
ACCOUNT_EMAIL_VERIFICATION = 'none'

# Настройки SimpleJWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


DATABASES = {
    'default': env.db('DATABASE_URL')
}

# --- CUSTOM USER ---
AUTH_USER_MODEL = 'users.User'

# --- INFRASTRUCTURE ---
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://127.0.0.1:6379/0')

_cors_default = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://www.bimark.org",
    "https://bimark.org",
    "https://maintest.site",
    "http://maintest.site",
]
_cors_env = env('CORS_ALLOWED_ORIGINS')
CORS_ALLOWED_ORIGINS = _cors_env if _cors_env else _cors_default
CORS_ALLOW_CREDENTIALS = True


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
USE_L10N = True

LANGUAGES = (
    ('ru', _('Russian')),
    ('en', _('English')),
    ('es', _('Spanish')),
)

MODELTRANSLATION_DEFAULT_LANGUAGE = 'en'

# Static / media — prefix when deployed under sub-path (nginx serves with /bimark/...)
_script = FORCE_SCRIPT_NAME or ''
STATIC_URL = f'{_script}/static/' if _script else '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = f'{_script}/media/' if _script else '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': env('GOOGLE_CLIENT_ID', default=''),
            'secret': env('GOOGLE_CLIENT_SECRET', default=''),
            'key': ''
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'OAUTH_PKCE_ENABLED': True,
    }
}

REFERRAL_PURCHASE_PERCENT = Decimal('5.0')
REFERRAL_DEPOSIT_PERCENT = Decimal('2.0')

JAZZMIN_SETTINGS = {
    "site_title": "BiMark Admin",
    "site_header": "Управление платформой",
    "site_brand": "BiMark",
    "welcome_sign": "Добро пожаловать в панель управления",
    "search_model": ["users.User", "catalog.Project"],
    "show_ui_builder": False,
    "navigation_expanded": True,
    "icons": {
        "users.User": "fas fa-users",
        "catalog.Project": "fas fa-briefcase",
        "catalog.Ownership": "fas fa-wallet",
        "billing.Wallet": "fas fa-money-bill-wave",
        "billing.Transaction": "fas fa-exchange-alt",
        "referrals.Referral": "fas fa-link",
        "billing.ProjectTransaction": "fas fa-chart-pie",
        "billing.AssetTransaction": "fas fa-gem",
    },
}

JAZZMIN_UI_TWEAKS = {
    "theme": "flatly",
}

EMAIL_BACKEND = "anymail.backends.resend.EmailBackend"
ANYMAIL = {
    "RESEND_API_KEY": env('RESEND_API_KEY', default=''),
}
DEFAULT_FROM_EMAIL = "BiMark Support <support@bimark.org>"

PASSIMPAY_PLATFORM_ID = env('PASSIMPAY_PLATFORM_ID', default='')
PASSIMPAY_API_KEY = env('PASSIMPAY_API_KEY', default='')

STRIPE_PUBLIC_KEY = env('STRIPE_PUBLIC_KEY', default='pk_test_...')
STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY', default='sk_test_...')
STRIPE_WEBHOOK_SECRET = env('STRIPE_WEBHOOK_SECRET', default='whsec_...')

PAYPAL_CLIENT_ID = env('PAYPAL_CLIENT_ID', default='')
PAYPAL_CLIENT_SECRET = env('PAYPAL_CLIENT_SECRET', default='')
PAYPAL_MODE = env('PAYPAL_MODE', default='sandbox')

TRIPLEA_CLIENT_ID = env('TRIPLEA_CLIENT_ID', default='')
TRIPLEA_CLIENT_SECRET = env('TRIPLEA_CLIENT_SECRET', default='')
TRIPLEA_MERCHANT_KEY = env('TRIPLEA_MERCHANT_KEY', default='')
TRIPLEA_WEBHOOK_SECRET = env('TRIPLEA_WEBHOOK_SECRET', default='secret')
TRIPLEA_MODE = env('TRIPLEA_MODE', default='sandbox')

TINYMCE_DEFAULT_CONFIG = {
    "theme": "silver",
    "height": 400,
    "menubar": False,
    "plugins": "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount",
    "toolbar": "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
}
