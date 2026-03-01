import os
from pathlib import Path
import environ
from django.utils.translation import gettext_lazy as _
from decimal import Decimal

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Инициализируем django-environ с дефолтными типами
env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, [])
)

# Читаем .env файл (если он существует)
env_file = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_file):
    environ.Env.read_env(env_file)

# --- SECURITY WARNING ---
SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env('ALLOWED_HOSTS')

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

# Настройки dj-rest-auth
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'auth-access-token',
    'JWT_AUTH_REFRESH_COOKIE': 'auth-refresh-token',
    'JWT_AUTH_HTTPONLY': False,
    'USER_DETAILS_SERIALIZER': 'users.serializers.CustomUserDetailsSerializer',
}

# Настройки allauth (кастомный юзер на email)
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_EMAIL_VERIFICATION = 'none' # Для MVP можно отклюстить, позже 'mandatory'

from datetime import timedelta
# Настройки SimpleJWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.middleware.security.SecurityMiddleware',
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
        'DIRS': [],
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
# Говорим Django использовать нашу кастомную модель
AUTH_USER_MODEL = 'users.User'

# --- INFRASTRUCTURE ---
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://127.0.0.1:6379/0')


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'

LANGUAGES = (
    ('ru', _('Russian')),
    ('en', _('English')),
    ('es', _('Spanish')),
)

USE_I18N = True
USE_L10N = True

# Язык по умолчанию, если перевод отсутствует
MODELTRANSLATION_DEFAULT_LANGUAGE = 'en'

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        # Включаем конфигурацию через настройки, минуя БД (SocialApp)
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
        # Важно для JWT: мы доверяем email от Google
        'OAUTH_PKCE_ENABLED': True,
    }
}

REFERRAL_PURCHASE_PERCENT = Decimal('5.0')  # 5% от покупки реферала
REFERRAL_DEPOSIT_PERCENT = Decimal('2.0')

JAZZMIN_SETTINGS = {
    "site_title": "YouTube Shop Admin",
    "site_header": "Управление платформой",
    "site_brand": "YouTube Shop",
    "welcome_sign": "Добро пожаловать в панель управления",
    "search_model": ["users.User", "catalog.Project"],
    "show_ui_builder": False, # Выключаем кастомизатор для продакшена
    "navigation_expanded": True,
    
    # Иконки для меню (FontAwesome 5)
    "icons": {
        "users.User": "fas fa-users",
        "catalog.Project": "fas fa-briefcase",
        "catalog.Ownership": "fas fa-wallet",
        "billing.Wallet": "fas fa-money-bill-wave",
        "billing.Transaction": "fas fa-exchange-alt",
        "referrals.Referral": "fas fa-link",
    },
}

JAZZMIN_UI_TWEAKS = {
    "theme": "darkly", # Приятная темная тема по умолчанию
}

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')