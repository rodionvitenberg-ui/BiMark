# BiMark — маркетплейс цифровых активов

E-commerce платформа для продажи цифровых активов: каталог, корзина, оплата, личный кабинет и реферальная система.

## Стек

- **Backend:** Django + DRF + SimpleJWT, PostgreSQL, Redis/Celery
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS, i18n (ru/en/es)
- **Платежи:** PayPal, Passimpay, TripleA (USDT)
- **AI-ассистент:** Telegram-бот

## Структура

- `backend/` — Django API (catalog, billing, users, referrals, cms, ai_assistant)
- `frontend/` — Next.js фронтенд
- `deploy/` — скрипты деплоя
- `create_db.sh` — инициализация базы

## Запуск (dev)

```bash
# backend
cd backend && pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py runserver

# frontend
cd frontend && npm install && npm run dev
```

## Основные команды сидирования

```bash
python manage.py seed_assets_data --noinput   # каталог ассетов
python manage.py seed_projects --noinput     # проекты
python manage.py seed_articles --noinput     # статьи CMS