#!/usr/bin/env bash
#
# install.sh — FULL first-time install of BiMark on Ubuntu (Webdock-ready)
# ========================================================================
#
# Target: https://maintest.site/bimark (alongside gardenhouse on same host)
#   Next.js  → 127.0.0.1:3001
#   Django   → 127.0.0.1:8001
#   App dir  → /var/www/bimark
#
# Usage:
#   sudo bash deploy/install.sh
#   sudo bash deploy/install.sh --skip-ufw
#   sudo bash deploy/install.sh --with-ssl
#   sudo APP_USER=maintest bash deploy/install.sh
#
# Later updates:  sudo bash deploy/deploy.sh
# SSL only:       sudo bash deploy/setup_ssl.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

SKIP_UFW=false
WITH_SSL=false
SKIP_SEED=false
for arg in "$@"; do
    case "${arg}" in
        --skip-ufw)   SKIP_UFW=true ;;
        --with-ssl)   WITH_SSL=true ;;
        --skip-seed)  SKIP_SEED=true ;;
        -h|--help)
            sed -n '2,25p' "$0"
            exit 0
            ;;
        *)
            die "unknown argument: ${arg}"
            ;;
    esac
done

require_root
resolve_app_identity

export DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------------------
log "[1/10] System packages"
# ---------------------------------------------------------------------------
apt-get update -y
apt-get install -y \
    nginx \
    postgresql \
    postgresql-contrib \
    git \
    curl \
    ca-certificates \
    gnupg \
    python3 \
    python3-venv \
    python3-pip \
    python3-dev \
    build-essential \
    libpq-dev \
    certbot \
    python3-certbot-nginx \
    rsync \
    ufw

ok "apt packages installed"

# ---------------------------------------------------------------------------
log "[2/10] Node.js 22"
# ---------------------------------------------------------------------------
if ! command_exists node || ! node --version 2>/dev/null | grep -qE '^v22\.'; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi
ok "Node $(node --version)  npm $(npm --version)"

# ---------------------------------------------------------------------------
log "[3/10] Firewall (optional)"
# ---------------------------------------------------------------------------
if [ "${SKIP_UFW}" = true ]; then
    warn "UFW skipped (--skip-ufw). Open TCP 80/443 in Webdock panel if needed."
else
    ufw allow OpenSSH >/dev/null 2>&1 || true
    ufw allow "Nginx Full" >/dev/null 2>&1 || true
    if ! ufw status 2>/dev/null | grep -qi "Status: active"; then
        ufw --force enable >/dev/null 2>&1 || warn "ufw enable failed (ok if hoster firewall is used)"
    fi
    ufw status verbose | head -20 || true
fi

# ---------------------------------------------------------------------------
log "[4/10] Application directory + code"
# ---------------------------------------------------------------------------
THIS_REPO="$(cd "${SCRIPT_DIR}/.." && pwd)"
ensure_app_dir

if [ -d "${APP_DIR}/.git" ]; then
    log "Updating existing git repo at ${APP_DIR}"
    sudo -u "${APP_USER}" git -C "${APP_DIR}" fetch origin || true
    sudo -u "${APP_USER}" git -C "${APP_DIR}" checkout "${REPO_BRANCH}" || true
    sudo -u "${APP_USER}" git -C "${APP_DIR}" pull --ff-only origin "${REPO_BRANCH}" \
        || warn "git pull failed — using code already on disk"
elif [ "${THIS_REPO}" = "${APP_DIR}" ]; then
    ok "Running from ${APP_DIR} (already the app dir)"
elif [ -f "${THIS_REPO}/frontend/package.json" ] && [ -f "${THIS_REPO}/backend/manage.py" ]; then
    log "Syncing code from ${THIS_REPO} → ${APP_DIR}"
    rsync -a \
        --exclude '.git' \
        --exclude 'backend/venv' \
        --exclude 'frontend/node_modules' \
        --exclude 'frontend/.next' \
        --exclude 'backend/__pycache__' \
        --exclude '**/__pycache__' \
        --exclude 'backend/db.sqlite3' \
        "${THIS_REPO}/" "${APP_DIR}/"
    if [ ! -d "${APP_DIR}/.git" ]; then
        if git -C "${THIS_REPO}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
            if [ -n "${REPO_URL}" ]; then
                rm -rf "${APP_DIR}.gittmp" 2>/dev/null || true
                if git clone --branch "${REPO_BRANCH}" "${REPO_URL}" "${APP_DIR}.gittmp" 2>/dev/null; then
                    mv "${APP_DIR}.gittmp/.git" "${APP_DIR}/.git"
                    rm -rf "${APP_DIR}.gittmp"
                    ok "attached .git from ${REPO_URL}"
                else
                    warn "could not clone ${REPO_URL} — updates via deploy.sh may need manual copy"
                fi
            fi
        fi
    fi
else
    log "Cloning ${REPO_URL} → ${APP_DIR}"
    if [ -z "$(ls -A "${APP_DIR}" 2>/dev/null || true)" ]; then
        git clone --branch "${REPO_BRANCH}" "${REPO_URL}" "${APP_DIR}"
    else
        die "${APP_DIR} is not empty and is not a git repo. Clear it or place the project there."
    fi
fi

app_chown "${APP_DIR}"
ok "code ready at ${APP_DIR}"

# ---------------------------------------------------------------------------
log "[5/10] PostgreSQL database"
# ---------------------------------------------------------------------------
systemctl enable postgresql
systemctl start postgresql

BACKEND_ENV="${APP_DIR}/backend/.env"
mkdir -p "${APP_DIR}/backend"
DB_PASSWORD=""
if [ -f "${BACKEND_ENV}" ]; then
    # Prefer explicit DB_PASSWORD; else try parse from DATABASE_URL
    DB_PASSWORD="$(read_env_key "${BACKEND_ENV}" DB_PASSWORD)"
    if [ -z "${DB_PASSWORD}" ]; then
        DB_URL="$(read_env_key "${BACKEND_ENV}" DATABASE_URL)"
        # postgres://user:pass@host:port/db
        if [[ "${DB_URL}" =~ postgres(ql)?://[^:]+:([^@]+)@ ]]; then
            DB_PASSWORD="${BASH_REMATCH[2]}"
        fi
    fi
fi
if [ -z "${DB_PASSWORD}" ] || [ "${DB_PASSWORD}" = "change-me-generated-by-deploy-script" ] || [ "${DB_PASSWORD}" = "CHANGE_ME" ] || [ "${DB_PASSWORD}" = "change-me" ]; then
    DB_PASSWORD="$(openssl rand -hex 24)"
    ok "generated new DB password"
else
    ok "reusing DB password from existing backend/.env"
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
    sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
    ok "database ${DB_NAME} created"
else
    sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};" || true
    ok "database ${DB_NAME} already exists"
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" <<SQL
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER SCHEMA public OWNER TO ${DB_USER};
SQL
ok "PostgreSQL role ${DB_USER} + DB ${DB_NAME} ready"

# ---------------------------------------------------------------------------
log "[6/10] Backend .env + Python venv"
# ---------------------------------------------------------------------------
if [ ! -f "${BACKEND_ENV}" ]; then
    if [ -f "${APP_DIR}/backend/.env.production.example" ]; then
        cp "${APP_DIR}/backend/.env.production.example" "${BACKEND_ENV}"
    else
        touch "${BACKEND_ENV}"
    fi
fi

SECRET_KEY="$(read_env_key "${BACKEND_ENV}" SECRET_KEY)"
if [ -z "${SECRET_KEY}" ] || [[ "${SECRET_KEY}" == change-me* ]]; then
    SECRET_KEY="$(openssl rand -hex 48)"
fi

DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}"

ensure_env_key "${BACKEND_ENV}" "SECRET_KEY" "${SECRET_KEY}"
ensure_env_key "${BACKEND_ENV}" "DEBUG" "False"
ensure_env_key "${BACKEND_ENV}" "SECURE_SSL_REDIRECT" "False"
ensure_env_key "${BACKEND_ENV}" "ALLOWED_HOSTS" "${DOMAIN},www.${DOMAIN},${SERVER_IP},127.0.0.1,localhost"
ensure_env_key "${BACKEND_ENV}" "FORCE_SCRIPT_NAME" "${BASE_PATH}"
ensure_env_key "${BACKEND_ENV}" "CSRF_TRUSTED_ORIGINS" "https://${DOMAIN},http://${DOMAIN}"
ensure_env_key "${BACKEND_ENV}" "CORS_ALLOWED_ORIGINS" "https://${DOMAIN},http://${DOMAIN}"
ensure_env_key "${BACKEND_ENV}" "DATABASE_URL" "${DATABASE_URL}"
ensure_env_key "${BACKEND_ENV}" "DB_NAME" "${DB_NAME}"
ensure_env_key "${BACKEND_ENV}" "DB_USER" "${DB_USER}"
ensure_env_key "${BACKEND_ENV}" "DB_PASSWORD" "${DB_PASSWORD}"
chmod 600 "${BACKEND_ENV}"
app_chown "${BACKEND_ENV}"

# Re-sync role password AFTER .env is final
sudo -u postgres psql -v ON_ERROR_STOP=1 \
    -c "ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';" >/dev/null
ok "backend/.env written + PostgreSQL password re-synced"

sudo -u "${APP_USER}" python3 -m venv "${APP_DIR}/backend/venv"
sudo -u "${APP_USER}" "${APP_DIR}/backend/venv/bin/pip" install --upgrade pip
sudo -u "${APP_USER}" "${APP_DIR}/backend/venv/bin/pip" install -r "${APP_DIR}/backend/requirements.txt"
ok "Python venv + requirements"

PYTHON_BIN="${APP_DIR}/backend/venv/bin/python"
sudo -u "${APP_USER}" env PATH="${APP_DIR}/backend/venv/bin:$PATH" \
    "${PYTHON_BIN}" "${APP_DIR}/backend/manage.py" migrate --noinput
sudo -u "${APP_USER}" env PATH="${APP_DIR}/backend/venv/bin:$PATH" \
    "${PYTHON_BIN}" "${APP_DIR}/backend/manage.py" collectstatic --noinput

mkdir -p "${APP_DIR}/backend/media" "${APP_DIR}/backend/staticfiles"
app_chown "${APP_DIR}/backend/media"
app_chown "${APP_DIR}/backend/staticfiles"

if [ "${SKIP_SEED}" != true ]; then
    for cmd in seed_db seed_projects seed_assets_data seed_articles; do
        sudo -u "${APP_USER}" env PATH="${APP_DIR}/backend/venv/bin:$PATH" \
            "${PYTHON_BIN}" "${APP_DIR}/backend/manage.py" "${cmd}" \
            || warn "${cmd} failed (non-fatal)"
    done
fi
ok "Django migrated + collectstatic"

# ---------------------------------------------------------------------------
log "[7/10] Frontend .env.production + build"
# ---------------------------------------------------------------------------
FRONTEND_ENV="${APP_DIR}/frontend/.env.production"
if [ ! -f "${FRONTEND_ENV}" ]; then
    if [ -f "${APP_DIR}/frontend/.env.production.example" ]; then
        cp "${APP_DIR}/frontend/.env.production.example" "${FRONTEND_ENV}"
    else
        touch "${FRONTEND_ENV}"
    fi
fi
ensure_env_key "${FRONTEND_ENV}" "NEXT_PUBLIC_SITE_URL" "https://${DOMAIN}${BASE_PATH}"
ensure_env_key "${FRONTEND_ENV}" "NEXT_PUBLIC_BASE_PATH" "${BASE_PATH}"
ensure_env_key "${FRONTEND_ENV}" "NEXT_PUBLIC_API_URL" "${BASE_PATH}/api"
ensure_env_key "${FRONTEND_ENV}" "API_URL" "http://127.0.0.1:${BE_PORT}/api"
app_chown "${FRONTEND_ENV}"
ok "frontend/.env.production (basePath=${BASE_PATH})"

has_standalone_output() {
    local f
    for f in \
        "${APP_DIR}/frontend/next.config.ts" \
        "${APP_DIR}/frontend/next.config.js" \
        "${APP_DIR}/frontend/next.config.mjs"
    do
        [ -f "${f}" ] || continue
        if sed 's|//.*||g' "${f}" | grep -qE '^[[:space:]]*output:[[:space:]]*["'\'']standalone["'\'']'; then
            return 0
        fi
    done
    return 1
}
if has_standalone_output; then
    die "frontend next.config still has output:\"standalone\".
  Remove that config key — this project uses \`next start\`, not standalone server.js."
fi

PKG_JSON="${APP_DIR}/frontend/package.json"
if ! grep -q 'next build --webpack' "${PKG_JSON}" 2>/dev/null; then
    warn "patching package.json build → next build --webpack"
    sudo -u "${APP_USER}" python3 - <<PY
import json
from pathlib import Path
p = Path("${PKG_JSON}")
d = json.loads(p.read_text())
d.setdefault("scripts", {})["build"] = "next build --webpack"
p.write_text(json.dumps(d, indent=2) + "\n")
print(d["scripts"]["build"])
PY
fi
ok "frontend build script: $(grep -E '"build"' "${PKG_JSON}" || true)"

# Guard: must not have both middleware.ts and proxy.ts
if [ -f "${APP_DIR}/frontend/middleware.ts" ] && [ -f "${APP_DIR}/frontend/proxy.ts" ]; then
    die "both middleware.ts and proxy.ts present — remove middleware.ts (Next 16 uses proxy only)"
fi
if [ -f "${APP_DIR}/frontend/middleware.ts" ] && grep -q 'createMiddleware' "${APP_DIR}/frontend/middleware.ts"; then
    die "middleware.ts still uses next-intl createMiddleware — replace with thin proxy.ts (see READ.md §5.2)"
fi

sudo -u "${APP_USER}" bash -c "cd ${APP_DIR}/frontend && npm install"
sudo -u "${APP_USER}" bash -c "cd ${APP_DIR}/frontend && rm -rf .next"
BUILD_LOG="$(mktemp /tmp/bimark-next-build.XXXXXX.log)"
log "Building frontend: npx next build --webpack  (log: ${BUILD_LOG})"
if ! sudo -u "${APP_USER}" env NODE_ENV=production \
    bash -c "cd ${APP_DIR}/frontend && npx next build --webpack" \
    >"${BUILD_LOG}" 2>&1; then
    tail -80 "${BUILD_LOG}" || true
    die "next build --webpack failed (see ${BUILD_LOG})"
fi
if grep -q '(webpack)' "${BUILD_LOG}"; then
    ok "confirmed webpack: $(grep -E 'Next\.js|webpack|Turbopack' "${BUILD_LOG}" | head -3 | tr '\n' '; ')"
elif grep -qi 'turbopack' "${BUILD_LOG}" && ! grep -qi 'webpack' "${BUILD_LOG}"; then
    tail -40 "${BUILD_LOG}" || true
    die "build used Turbopack — abort (would hang on ${BASE_PATH}/ru). Use next build --webpack."
else
    warn "webpack banner not found; log head:"
    head -25 "${BUILD_LOG}" || true
fi

if [ ! -d "${APP_DIR}/frontend/.next" ]; then
    die "next build did not produce ${APP_DIR}/frontend/.next"
fi
if [ -f "${APP_DIR}/frontend/.next/required-server-files.json" ]; then
    if ! grep -q "\"basePath\": \"${BASE_PATH}\"" "${APP_DIR}/frontend/.next/required-server-files.json" 2>/dev/null; then
        warn "basePath ${BASE_PATH} not found in build metadata — check .env.production and rebuild"
    else
        ok "build has basePath=${BASE_PATH}"
    fi
fi
ok "Next.js built (webpack)"

# ---------------------------------------------------------------------------
log "[8/10] systemd services"
# ---------------------------------------------------------------------------
# Free only OUR ports — do not kill gardenhouse on 3000/8000
fuser -k "${FE_PORT}/tcp" 2>/dev/null || true
fuser -k "${BE_PORT}/tcp" 2>/dev/null || true
sleep 1

install_unit_from_template \
    "${APP_DIR}/deploy/systemd/bimark-backend.service.template" \
    "/etc/systemd/system/${BACKEND_UNIT}.service"
install_unit_from_template \
    "${APP_DIR}/deploy/systemd/bimark-frontend.service.template" \
    "/etc/systemd/system/${FRONTEND_UNIT}.service"

systemctl daemon-reload
systemctl enable "${BACKEND_UNIT}.service" "${FRONTEND_UNIT}.service"
systemctl restart "${BACKEND_UNIT}.service"
systemctl restart "${FRONTEND_UNIT}.service"
sleep 2

if ! systemctl is-active --quiet "${BACKEND_UNIT}"; then
    journalctl -u "${BACKEND_UNIT}" -n 40 --no-pager || true
    die "${BACKEND_UNIT} failed to start"
fi
if ! systemctl is-active --quiet "${FRONTEND_UNIT}"; then
    journalctl -u "${FRONTEND_UNIT}" -n 40 --no-pager || true
    die "${FRONTEND_UNIT} failed to start"
fi
ok "backend + frontend systemd active (User=${APP_USER} Group=${APP_GROUP})"

# ---------------------------------------------------------------------------
log "[9/10] nginx (additive /bimark — preserve gardenhouse)"
# ---------------------------------------------------------------------------
ensure_bimark_nginx \
    "${APP_DIR}/deploy/nginx/bimark.locations.conf" \
    "${APP_DIR}/deploy/nginx/maintest.site.conf"

# ---------------------------------------------------------------------------
log "[10/10] Smoke tests"
# ---------------------------------------------------------------------------
sleep 3
FAIL=0
probe() {
    local url="$1"
    local expect="$2"
    local timeout="${3:-15}"
    local code
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time "${timeout}" "${url}" 2>/dev/null || echo ERR)"
    if echo "${code}" | grep -qE "^(${expect})\$"; then
        ok "${code}  ${url}"
    else
        warn "${code}  ${url}  (expected ${expect})"
        FAIL=1
    fi
}

probe "http://127.0.0.1:${BE_PORT}/api/assets/" "200" 10
probe "http://127.0.0.1:${FE_PORT}${BASE_PATH}/ru" "200|301|302|307|308" 25
probe "http://127.0.0.1:${FE_PORT}${BASE_PATH}" "200|301|302|307|308" 10
# 404 here is GOOD — basePath is active
probe "http://127.0.0.1:${FE_PORT}/ru" "404" 5
probe "http://127.0.0.1${BASE_PATH}/ru" "200|301|302|307|308" 25
probe "http://127.0.0.1${BASE_PATH}" "200|301|302|307|308" 10

echo
if [ "${FAIL}" -ne 0 ]; then
    warn "Some probes failed."
    warn "If :${FE_PORT}${BASE_PATH}/ru fails but :${FE_PORT}${BASE_PATH} is 308 — problem is Next, NOT nginx."
    echo "    sudo journalctl -u ${FRONTEND_UNIT} -n 50 --no-pager"
    echo "    sudo bash ${APP_DIR}/deploy/debug_frontend.sh"
    echo "    ss -tlnp | grep -E ':80|:${FE_PORT}|:${BE_PORT}'"
    [ "${FAIL}" -eq 0 ] || exit 1
fi

if [ "${WITH_SSL}" = true ]; then
    log "Running setup_ssl.sh (--with-ssl)"
    bash "${APP_DIR}/deploy/setup_ssl.sh" || warn "SSL setup failed — run later: sudo bash ${APP_DIR}/deploy/setup_ssl.sh"
fi

echo
echo "=============================================="
echo "  INSTALL OK — BiMark"
echo "=============================================="
echo "  User/group : ${APP_USER}:${APP_GROUP}"
echo "  App dir    : ${APP_DIR}"
echo "  Site (HTTP): http://${DOMAIN}${BASE_PATH}"
echo "  Locale RU  : http://${DOMAIN}${BASE_PATH}/ru"
echo "  Locale EN  : http://${DOMAIN}${BASE_PATH}/en"
echo "  Locale ES  : http://${DOMAIN}${BASE_PATH}/es"
echo "  API        : http://${DOMAIN}${BASE_PATH}/api/"
echo "  Admin      : http://${DOMAIN}${BASE_PATH}/admin/"
echo "  Ports      : Next ${FE_PORT}  Django ${BE_PORT}"
echo
echo "  Services:"
echo "    systemctl status ${BACKEND_UNIT} ${FRONTEND_UNIT} nginx"
echo
echo "  Next steps:"
echo "    1. Open http://${DOMAIN}${BASE_PATH} in browser (HTTP until SSL)"
echo "    2. DNS A record ${DOMAIN} → this server (if not already)"
echo "    3. sudo bash ${APP_DIR}/deploy/setup_ssl.sh  (if SSL not yet)"
echo "    4. Optional superuser:"
echo "       sudo -u ${APP_USER} ${PYTHON_BIN} ${APP_DIR}/backend/manage.py createsuperuser"
echo "    5. Later updates: sudo bash ${APP_DIR}/deploy/deploy.sh"
echo "    6. gardenhouse on :3000/:8000 must stay untouched"
echo "=============================================="
