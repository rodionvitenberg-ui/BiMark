# READ.md — отчёт о деплое GardenHouse на maintest.site/gardenhouse

Документ для передачи другому разработчику: **что сделали**, **что ломалось**, **как сейчас поднимать** и **как залить второй сайт** на тот же сервер (например `maintest.site/bimark`).

Репозиторий: монорепо `gardenhouse` (Django + Next.js).  
Боевой путь на сервере: **`/var/www/gardenhouse`**.  
Публичный URL: **`https://maintest.site/gardenhouse`** (локали `ru` / `en`).

Скрипты: каталог **`deploy/`**.  
Краткая эксплуатация: `README.md`, детали: `deploy/DEPLOY.md`.  
Этот файл — **история граблей + практический playbook**, а не замена `DEPLOY.md`.

---

## 1. Цель, которую решали

Посадить приложение **не на корень домена и не на поддомен**, а на **sub-path**:

| Что | URL |
|-----|-----|
| Сайт (default locale) | `https://maintest.site/gardenhouse` → `/gardenhouse/ru` |
| English | `https://maintest.site/gardenhouse/en/...` |
| API | `https://maintest.site/gardenhouse/api/` |
| Django admin | `https://maintest.site/gardenhouse/admin/` |
| Media | `https://maintest.site/gardenhouse/media/` |

Стек:

- **Frontend:** Next.js 16 (App Router), next-intl (ru/en), Tailwind  
- **Backend:** Django 6 + DRF + Gunicorn + PostgreSQL  
- **Прокси:** nginx  
- **Хостинг:** Webdock (Ubuntu), пользователь **`maintest`**, primary group часто **`sudo`** (не `maintest`)  
- **Деплой:** только скрипты (без обязательного ручного SSH-тюнинга), systemd

---

## 2. Итоговая архитектура

```
Интернет
   │
   ▼
nginx :80 / :443          ← единственный публичный процесс
   ├── /gardenhouse/api/      → 127.0.0.1:8000/api/     (prefix strip)
   ├── /gardenhouse/admin/    → 127.0.0.1:8000/admin/
   ├── /gardenhouse/static/   → backend/staticfiles/
   ├── /gardenhouse/media/    → backend/media/
   └── /gardenhouse/*         → 127.0.0.1:3000          (Next, basePath)
```

| Компонент | Как крутится | Порт |
|-----------|--------------|------|
| Django (Gunicorn) | `gardenhouse-backend.service` | 127.0.0.1:**8000** |
| Next.js | `gardenhouse-frontend.service` | 127.0.0.1:**3000** |
| PostgreSQL | system | 5432 (localhost) |
| nginx | system | 80, 443 |

**Важно:** Next и Gunicorn **не** торчат наружу. Снаружи только nginx.

---

## 3. Файлы деплоя (отдать кодеру вместе с этим READ.md)

```
deploy/
├── install.sh              # первичная установка «с нуля»
├── deploy.sh               # обновление кода / rebuild / restart
├── setup_ssl.sh            # Let's Encrypt (после DNS)
├── healthcheck.sh          # диагностика
├── fix_frontend_webpack.sh # аварийный rebuild webpack
├── debug_frontend.sh       # next start вручную на :3001
├── lib/common.sh           # user/group, chown, unit templates
├── nginx/maintest.site.conf
├── systemd/
│   ├── gardenhouse-backend.service.template
│   └── gardenhouse-frontend.service.template
└── DEPLOY.md               # пошаговая инструкция
```

Шаблоны env:

- `frontend/.env.production.example`
- `backend/.env.production.example`

---

## 4. Как поднять этот проект (канон)

### 4.1. На сервере (Webdock), пользователь с sudo

```bash
sudo mkdir -p /var/www
sudo git clone <REPO_URL> /var/www/gardenhouse
cd /var/www/gardenhouse

# Обязательно до install:
grep build frontend/package.json
# ожидаем: "build": "next build --webpack"

sudo bash deploy/install.sh
# если firewall уже в панели Webdock:
# sudo bash deploy/install.sh --skip-ufw

# когда DNS A maintest.site → IP сервера:
sudo bash deploy/setup_ssl.sh
```

Обновления:

```bash
sudo bash /var/www/gardenhouse/deploy/deploy.sh
```

### 4.2. Проверки после установки

```bash
curl -sI http://127.0.0.1:8000/api/products/          # 200
curl -sI http://127.0.0.1:3000/gardenhouse/ru         # 200
curl -sI http://127.0.0.1:3000/ru                     # 404  ← так и должно (basePath)
curl -sI http://127.0.0.1/gardenhouse/ru              # 200 (через nginx)
curl -sI https://maintest.site/gardenhouse/ru         # 200 (после SSL)
```

### 4.3. Runtime-путь

- **Только** `/var/www/gardenhouse`  
- Не путать с `~/gardenhouse` — systemd смотрит в `/var/www`  
- Next всегда из каталога **`frontend/`** (`WorkingDirectory=.../frontend`)

---

## 5. Хроника приключений: грабли и фиксы

Ниже — в порядке «боли», с которой реально столкнулись.

### 5.1. Sub-path — это налог на весь стек

**Суть.** `basePath` только во фронте недостаточен.

| Слой | Что настроили |
|------|----------------|
| Next | `basePath: process.env.NEXT_PUBLIC_BASE_PATH` |
| Frontend env | `NEXT_PUBLIC_BASE_PATH=/gardenhouse`, `NEXT_PUBLIC_API_URL=/gardenhouse/api`, `NEXT_PUBLIC_SITE_URL=https://maintest.site/gardenhouse` |
| Django | `DJANGO_FORCE_SCRIPT_NAME=/gardenhouse` |
| Django media/static | URL с префиксом `/gardenhouse/media/`, `/gardenhouse/static/` |
| nginx | location'ы + **strip** префикса для API/admin |

**`NEXT_PUBLIC_*` вшиваются на `next build`.** Смена basePath = обязательная пересборка.

---

### 5.2. next-intl `createMiddleware` + basePath = hang (главный убийца)

**Симптом.**

- Next пишет `✓ Ready`
- `/gardenhouse` → 308  
- `/ru` → 404 (basePath на месте)  
- `/gardenhouse/ru` (и `/en`, `/shop`, …) → **timeout, 0 bytes**  
- nginx «ломается» тем же, потому что проксирует в мёртвый ответ Next  

**Доказательство на сервере (SSH):**  
переименовали `.next/server/middleware.js` → сразу **200 за ~16 ms** на всех locale-страницах.

**Причина.** `next-intl` `createMiddleware()` + `basePath=/gardenhouse` в production на VPS зависал на locale-путях (rewrite/basePath). Не nginx, не «просто systemd».

**Фикс (актуальный код):**  
`frontend/src/proxy.ts` — **тонкий** locale-proxy **без** `createMiddleware`:

- сегмент `ru` | `en` → `NextResponse.next()` + cookie `NEXT_LOCALE`
- иначе → redirect на `/ru` + остаток path  

next-intl **оставлен** для:

- `messages` (en.json / ru.json)  
- `Link` / `useRouter` / `useTranslations` из `@/i18n/navigation`  
- `routing.ts`  

**Важно для Next 16:** файл называется **`proxy.ts`** (middleware переименован в Proxy).  
**Нельзя** одновременно держать `middleware.ts` и `proxy.ts` — build падает с ошибкой «use proxy only».

---

### 5.3. Turbopack vs webpack

**Симптом.** Сборка «успешна», сервер Ready, locale hang (частично пересекалось с middleware).

**Фикс.**

```json
"build": "next build --webpack"
```

В `install.sh` / `deploy.sh`:

- `rm -rf .next` перед build  
- явный `npx next build --webpack`  
- в логе должна быть строка: `▲ Next.js … (webpack)`  

Turbopack prod на Next 16.2 для этой схемы (basePath + app router) оказался ненадёжен.

---

### 5.4. `output: "standalone"` vs `next start`

**Симптом.**  
`next start` + `output: "standalone"` → warning / неверный entrypoint; скрипты звали `next start`, а standalone ждёт `node .next/standalone/server.js`.

**Фикс.** Standalone **не используем**. Только классический `next start` после полного build.

Ложный fail install: grep ловил слово `standalone` **в комментарии** next.config.  
Проверка должна смотреть только код, не `//` комментарии.

---

### 5.5. SSR и API: relative URL + пароль Postgres

**Симптомы.**

- `User-Agent: node` бьёт в Django `/api/journal/`  
- `password authentication failed for user "gardenhouse_user"`  
- 500 на API во время server-side fetch  

**Причины.**

1. Server Components / `generateMetadata` использовали `NEXT_PUBLIC_API_URL=/gardenhouse/api` (relative) → Node ходил «не туда» (в себя на :3000 или кривой host).  
2. После переустановок `.env` и роль PostgreSQL расходились по паролю.

**Фикс.**

- `frontend/src/lib/server-api-url.ts` → на сервере всегда `http://127.0.0.1:8000/api`  
- axios: browser = `NEXT_PUBLIC_API_URL`, server = absolute loopback + timeout  
- install: после записи `backend/.env` — `ALTER ROLE ... PASSWORD` ещё раз  

**Правило:**

| Кто | API base |
|-----|----------|
| Браузер | `/gardenhouse/api` (same-origin, nginx) |
| Next SSR / metadata / sitemap | `http://127.0.0.1:8000/api` |

---

### 5.6. next/image + basePath → 400 на логотипах

**Симптом.**

```
GET .../gardenhouse/_next/image?url=%2Flogo.png&w=640&q=75  → 400
"The requested resource isn't a valid image."
```

Видео и картинки с полными URL (media/API) — ок.  
Статика `https://…/gardenhouse/logo.png` — 200.

**Причина.** Оптимизатор запрашивал `/logo.png` (404 HTML), а файл доступен как `/gardenhouse/logo.png`.

**Фикс.**  
`frontend/src/lib/image-loader.ts` + в `next.config.ts`:

```ts
images: {
  loader: "custom",
  loaderFile: "./src/lib/image-loader.ts",
  remotePatterns: [ /* django, unsplash, maintest.site */ ],
}
```

Локальные `/logo.png` → отдаются как **`/gardenhouse/logo.png`** (прямая статика, без on-the-fly resize).  
Remote URL — без изменений.

**Нельзя** просто «прокинуть custom loader обратно в `/_next/image`» — при `loader: "custom"` встроенный optimizer ведёт себя иначе (получали 404 HTML на endpoint).

---

### 5.7. Webdock: user / group

**Симптом.** `chown maintest:maintest` / `Group=maintest` → invalid group.

**Фикс.** В `deploy/lib/common.sh`:

```bash
APP_GROUP="$(id -gn "$APP_USER")"   # часто: sudo
chown -R "${APP_USER}:${APP_GROUP}" ...
```

Unit-файлы из `.template` с подстановкой `__APP_USER__` / `__APP_GROUP__`.

---

### 5.8. Два клона кода

**Симптом.** Правки в `~/gardenhouse`, а крутится `/var/www/gardenhouse`.  
`next start` из корня монорепо → `Cannot find module '.../gardenhouse/node_modules/next'`.

**Фикс.** Канон: **`/var/www/gardenhouse`**, команды Next только из **`frontend/`**:

```bash
cd /var/www/gardenhouse/frontend
node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3000
```

---

### 5.9. HTTP vs HTTPS

**Симптом.** `ERR_CONNECTION_REFUSED` в браузере при живом HTTP.

**Причина.** Браузер идёт на **https://**, а **:443** ещё не слушается (certbot не запускали).  
Снаружи `http://maintest.site/gardenhouse/ru` уже отдавал 200.

**Фикс.** После DNS: `sudo bash deploy/setup_ssl.sh`.  
До SSL открывать явно **`http://`**.

---

### 5.10. PM2, зомби next-server, EADDRINUSE

**Симптомы.** Пустой `pm2 status` (другой user / PATH), зомби `next-server`, порт 3000 занят, после kill — нормальный старт.

**Фикс.** PM2 не используем. Только systemd.  
При отладке: kill по PID порта (`ss` / `fuser`), не путать с «пустым PM2».

---

### 5.11. public/ в .gitignore

**Симптом.** В коммит уезжал репозиторий **без** логотипов/видео.

**Фикс.** Не игнорировать `frontend/public/`. Ассеты должны быть в git (или отдельный pipeline заливки).

---

### 5.12. Smoke-тесты install

**Симптом.** «Install OK», сайт мёртв.

**Фикс.** В конце `install.sh` / `deploy.sh` — обязательные probe; fail при hang locale.  
`/ru` → **404** считается **успехом** (доказательство basePath).

---

## 6. Ключевые места в коде (карта)

| Файл | Роль |
|------|------|
| `frontend/next.config.ts` | `basePath`, custom image loader, **без** standalone |
| `frontend/src/proxy.ts` | thin locale proxy (не next-intl createMiddleware) |
| `frontend/src/lib/image-loader.ts` | public/ пути с basePath |
| `frontend/src/lib/asset.ts` | raw `<video>` / poster и т.п. |
| `frontend/src/lib/server-api-url.ts` | absolute API для SSR |
| `frontend/src/lib/api.ts` | axios: browser vs server baseURL |
| `frontend/src/i18n/*` | routing, navigation, messages |
| `frontend/.env.production.example` | шаблон prod env |
| `backend/core/settings.py` | FORCE_SCRIPT_NAME, MEDIA/STATIC prefix |
| `deploy/nginx/maintest.site.conf` | reverse proxy + strip |
| `deploy/lib/common.sh` | Webdock user/group |

---

## 7. Переменные окружения (prod)

### Frontend (`frontend/.env.production`)

```env
NEXT_PUBLIC_SITE_URL=https://maintest.site/gardenhouse
NEXT_PUBLIC_BASE_PATH=/gardenhouse
NEXT_PUBLIC_API_URL=/gardenhouse/api
API_URL=http://127.0.0.1:8000/api
```

### Backend (`backend/.env`)

Критично:

```env
DJANGO_DEBUG=False
DJANGO_SECURE_SSL_REDIRECT=False
DJANGO_FORCE_SCRIPT_NAME=/gardenhouse
DJANGO_ALLOWED_HOSTS=maintest.site,www.maintest.site,...
DJANGO_CSRF_TRUSTED_ORIGINS=https://maintest.site,http://maintest.site
DB_* = gardenhouse_db / gardenhouse_user / <password>
CORS_ALLOWED_ORIGINS=https://maintest.site,http://maintest.site
```

Пароль БД в `.env` и в PostgreSQL (`ALTER ROLE`) **должны совпадать**.

---

## 8. Эксплуатация

```bash
# логи
sudo journalctl -u gardenhouse-frontend -f --no-pager
sudo journalctl -u gardenhouse-backend  -f --no-pager

# рестарт
sudo systemctl restart gardenhouse-backend gardenhouse-frontend
sudo systemctl reload nginx

# диагностика
sudo bash /var/www/gardenhouse/deploy/healthcheck.sh
```

**status=143** после `Stopping` = SIGTERM (штатный stop), не обязательно «Next упал».

---

## 9. Как залить ВТОРОЙ сайт на тот же сервер (`maintest.site/bimark`)

Да: **тот же класс работы**, если снова Next + i18n + **sub-path**.

### 9.1. Что повторится почти наверняка

| Тема | Действие |
|------|----------|
| basePath | `/bimark` |
| env NEXT_PUBLIC_* | до build |
| nginx | **отдельные** `location ^~ /bimark/...` (не ломать gardenhouse) |
| Next port | например **3001** (gardenhouse занял 3000) |
| systemd | `bimark-frontend.service`, `bimark-backend.service` (если есть API) |
| Django FORCE_SCRIPT_NAME | `/bimark` (если Django) |
| API strip | `proxy_pass http://127.0.0.1:PORT/api/` |
| thin locale proxy | **не** копировать createMiddleware вслепую — сразу thin proxy или e2e curl locale |
| image-loader / assetUrl | с `NEXT_PUBLIC_BASE_PATH=/bimark` |
| SSR API | `http://127.0.0.1:<django_port>/api` |
| build | `next build --webpack` пока не доказано иное |
| SSL | один cert на `maintest.site`, locations рядом |

### 9.2. Шаблон nginx (идея)

```nginx
# API bimark (пример)
location ^~ /bimark/api/ {
    proxy_pass http://127.0.0.1:8001/api/;
    # headers Host, X-Forwarded-* ...
}

location ^~ /bimark {
    proxy_pass http://127.0.0.1:3001;
    # headers + websocket если нужно
}
```

GardenHouse blocks (`/gardenhouse`) **не трогать**.

### 9.3. Чеклист для нового app (скопировать и пройти)

1. [ ] Репо склонирован в `/var/www/<app>`  
2. [ ] `NEXT_PUBLIC_BASE_PATH=/<path>` и build с этим env  
3. [ ] В логе build: `(webpack)`  
4. [ ] Locale proxy **без** next-intl createMiddleware (или проверен curl `/path/ru` = 200)  
5. [ ] Image loader / public assets с basePath  
6. [ ] SSR API = loopback absolute  
7. [ ] nginx locations + strip для API  
8. [ ] systemd User=реальный user, Group=`id -gn`  
9. [ ] Smoke: locale 200, bare path 404/redirect, API 200  
10. [ ] HTTPS (общий cert)  
11. [ ] Порты не пересекаются с gardenhouse (3000/8000)  

### 9.4. Когда проще не sub-path

**Поддомен** `bimark.maintest.site` → часто **без basePath**, меньше грабель (middleware, image, assets).  
Sub-path удобен для «много демо на одном тесте», но каждый app платит налог.

---

## 10. Что отдать второму кодеру (пакет)

1. Этот **`READ.md`**  
2. Каталог **`deploy/`** (и актуальный `main` с thin proxy + image-loader)  
3. **`README.md`** + **`deploy/DEPLOY.md`**  
4. Доступы: SSH (user `maintest` + sudo), DNS, Webdock firewall (80/443)  
5. Понимание: **не** править `~/project`, пока unit смотрит в `/var/www/...`  

---

## 11. Краткая «легенда» одним абзацем

Мы подняли Django + Next.js 16 + next-intl на общем домене в sub-path `/gardenhouse`.  
Долго казалось, что виноваты nginx, Turbopack, SSL или «не тот start».  
По SSH выяснилось: **production hang locale-страниц** — `next-intl createMiddleware` + `basePath`; **логотипы 400** — image optimizer без basePath; **connection refused** — браузер на https при отсутствии :443; **API 500 от node** — relative API URL на SSR + рассинхрон пароля Postgres; **Webdock** — group `sudo`.  
Сейчас: webpack build, thin `proxy.ts`, custom image loader, loopback API на сервере, nginx strip, systemd, install/deploy scripts с smoke-тестами.

---

## 12. Контакты по проверке «сайт жив»

```bash
# с сервера
curl -sI https://maintest.site/gardenhouse/ru | head -5

# сервисы
systemctl is-active gardenhouse-frontend gardenhouse-backend nginx
```

Ожидание: **HTTP 200** (или 3xx на корень `/gardenhouse`), Next и Gunicorn **active**.

---

*Документ составлен по результатам деплоя GardenHouse (Father's Garden) на Webdock / maintest.site.  
Имя файла намеренно: **READ.md** (не README.md).*

---

## Appendix A — BiMark mapping (этот репозиторий)

Документ выше описывает деплой GardenHouse. **Этот репозиторий — BiMark** (`maintest.site/bimark`).

| GardenHouse | BiMark |
|-------------|--------|
| `/var/www/gardenhouse` | `/var/www/bimark` |
| `basePath=/gardenhouse` | `basePath=/bimark` |
| Next :3000 | Next **:3001** |
| Django :8000 | Django **:8001** |
| `gardenhouse-*.service` | `bimark-*.service` |
| `core.wsgi` | **`config.wsgi`** |
| locales ru/en | **ru / en / es** |
| `createMiddleware` | **thin `frontend/proxy.ts`** |
| custom image loader | **`frontend/lib/image-loader.ts`** |
| nginx overwrite | **additive** `# BEGIN bimark` block |

Канон: `deploy/DEPLOY.md`, `sudo bash deploy/install.sh`.

