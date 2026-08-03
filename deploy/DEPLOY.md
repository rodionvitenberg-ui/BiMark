# BiMark — деплой на Webdock (maintest.site/bimark)

Целевой URL (второй сайт рядом с gardenhouse):

| | |
|--|--|
| Сайт | `http(s)://maintest.site/bimark` → `/bimark/ru` |
| EN / ES | `/bimark/en`, `/bimark/es` |
| API | `/bimark/api/` |
| Admin | `/bimark/admin/` |
| Next | `127.0.0.1:3001` |
| Django | `127.0.0.1:8001` |
| Runtime | `/var/www/bimark` |

GardenHouse (`/gardenhouse`, :3000/:8000) **не трогаем**. nginx locations добавляются additively.

## Важно про Webdock и пользователя

- Профиль часто **`maintest`**, primary group часто **`sudo`**.
- Скрипты берут группу из ОС: `id -gn maintest`.
- Без PM2, без `output: "standalone"`.
- Сборка: **`next build --webpack`**.
- Locale routing: **thin `proxy.ts`**, не `next-intl` `createMiddleware`.
- Images: **custom loader** (`lib/image-loader.ts`) для basePath.

## Чистая установка

```bash
sudo mkdir -p /var/www
sudo git clone https://github.com/rodionvitenberg-ui/BiMark.git /var/www/bimark
cd /var/www/bimark

grep build frontend/package.json
# ожидаем: "build": "next build --webpack"
ls frontend/proxy.ts   # thin locale proxy

sudo bash deploy/install.sh
# sudo bash deploy/install.sh --skip-ufw
# sudo bash deploy/install.sh --with-ssl

# DNS уже есть → SSL (общий cert на domain):
sudo bash deploy/setup_ssl.sh
```

После install (HTTP): `http://maintest.site/bimark/ru`

## Обновление

```bash
sudo bash /var/www/bimark/deploy/deploy.sh
sudo bash /var/www/bimark/deploy/deploy.sh --skip-seed
```

## Диагностика

```bash
sudo bash /var/www/bimark/deploy/healthcheck.sh

sudo systemctl status bimark-backend bimark-frontend nginx --no-pager
sudo journalctl -u bimark-frontend -n 50 --no-pager
sudo journalctl -u bimark-backend  -n 50 --no-pager

curl -sI http://127.0.0.1:3001/bimark/ru
curl -sI http://127.0.0.1:3001/ru          # 404 = basePath OK
curl -s  http://127.0.0.1:8001/api/assets/ | head -c 200
curl -sI http://127.0.0.1/bimark/ru
# gardenhouse still alive:
curl -sI http://127.0.0.1/gardenhouse/ru
```

| URL | Ожидание |
|-----|----------|
| `:3001/bimark/ru` | 200 / 307 |
| `:3001/ru` | **404** |
| `:8001/api/assets/` | 200 |
| `:80/bimark/ru` | 200 / 307 |

Если locale hang: `sudo bash deploy/fix_frontend_webpack.sh`  
Изоляция Next: `sudo bash deploy/debug_frontend.sh`

## Env

- `backend/.env` — `SECRET_KEY`, `DATABASE_URL`, `FORCE_SCRIPT_NAME=/bimark`, …
- `frontend/.env.production` — `NEXT_PUBLIC_BASE_PATH=/bimark` (вшивается в **build**)

Шаблоны: `backend/.env.production.example`, `frontend/.env.production.example`.

## Superuser

```bash
sudo -u maintest /var/www/bimark/backend/venv/bin/python \
  /var/www/bimark/backend/manage.py createsuperuser
```

## Ключевые фиксы (из READ.md, применены к BiMark)

1. **next-intl** — thin `frontend/proxy.ts`, не createMiddleware  
2. **webpack** — `next build --webpack`  
3. **image loader** — `lib/image-loader.ts` + basePath  
4. **SSR API** — `API_URL=http://127.0.0.1:8001/api`  
5. **nginx strip** — `proxy_pass …/api/`  
6. **Webdock group** — `id -gn`  
7. **Порты** — 3001/8001, чтобы не бить gardenhouse  
