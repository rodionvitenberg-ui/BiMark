#!/usr/bin/env bash
#
# deploy.sh — update already-installed BiMark (pull, build, restart)
# ==================================================================
# Prerequisites: install.sh has been run once.
#
#   sudo bash /var/www/bimark/deploy/deploy.sh
#   sudo bash deploy/deploy.sh --skip-seed
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

SKIP_SEED=false
for arg in "$@"; do
    case "${arg}" in
        --skip-seed) SKIP_SEED=true ;;
        -h|--help)
            sed -n '2,12p' "$0"
            exit 0
            ;;
        *) die "unknown argument: ${arg}" ;;
    esac
done

require_root
resolve_app_identity

if [ ! -d "${APP_DIR}/backend" ] || [ ! -d "${APP_DIR}/frontend" ]; then
    die "${APP_DIR} does not look installed. Run: sudo bash deploy/install.sh"
fi

PYTHON_BIN="${APP_DIR}/backend/venv/bin/python"
PIP_BIN="${APP_DIR}/backend/venv/bin/pip"

# ---------------------------------------------------------------------------
log "[1/7] Update code"
# ---------------------------------------------------------------------------
if [ -d "${APP_DIR}/.git" ]; then
    sudo -u "${APP_USER}" git -C "${APP_DIR}" fetch origin
    sudo -u "${APP_USER}" git -C "${APP_DIR}" checkout "${REPO_BRANCH}"
    sudo -u "${APP_USER}" git -C "${APP_DIR}" pull --ff-only origin "${REPO_BRANCH}" \
        || warn "git pull --ff-only failed (local commits?). Continuing with disk code."
else
    warn "no .git in ${APP_DIR} — skipped pull (sync code manually)"
fi
app_chown "${APP_DIR}"

# ---------------------------------------------------------------------------
log "[2/7] Backend dependencies + .env guards"
# ---------------------------------------------------------------------------
BACKEND_ENV="${APP_DIR}/backend/.env"
if [ ! -f "${BACKEND_ENV}" ]; then
    die "missing ${BACKEND_ENV} — run install.sh first"
fi
ensure_env_key "${BACKEND_ENV}" "SECURE_SSL_REDIRECT" "False"
ensure_env_key "${BACKEND_ENV}" "FORCE_SCRIPT_NAME" "${BASE_PATH}"
ensure_env_key "${BACKEND_ENV}" "DEBUG" "False"
chmod 600 "${BACKEND_ENV}"
app_chown "${BACKEND_ENV}"

if [ ! -x "${PYTHON_BIN}" ]; then
    sudo -u "${APP_USER}" python3 -m venv "${APP_DIR}/backend/venv"
fi
sudo -u "${APP_USER}" "${PIP_BIN}" install --upgrade pip
sudo -u "${APP_USER}" "${PIP_BIN}" install -r "${APP_DIR}/backend/requirements.txt"

# ---------------------------------------------------------------------------
log "[3/7] Django migrate + collectstatic"
# ---------------------------------------------------------------------------
sudo -u "${APP_USER}" env PATH="${APP_DIR}/backend/venv/bin:$PATH" \
    "${PYTHON_BIN}" "${APP_DIR}/backend/manage.py" migrate --noinput
sudo -u "${APP_USER}" env PATH="${APP_DIR}/backend/venv/bin:$PATH" \
    "${PYTHON_BIN}" "${APP_DIR}/backend/manage.py" collectstatic --noinput

if [ "${SKIP_SEED}" != true ]; then
    for cmd in seed_db seed_projects seed_assets_data seed_articles; do
        sudo -u "${APP_USER}" env PATH="${APP_DIR}/backend/venv/bin:$PATH" \
            "${PYTHON_BIN}" "${APP_DIR}/backend/manage.py" "${cmd}" \
            || warn "${cmd} skipped/failed"
    done
fi

# ---------------------------------------------------------------------------
log "[4/7] Frontend env + build"
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

if [ -f "${APP_DIR}/frontend/next.config.ts" ] \
   && sed 's|//.*||g' "${APP_DIR}/frontend/next.config.ts" \
        | grep -qE '^[[:space:]]*output:[[:space:]]*["'\'']standalone["'\'']'; then
    die "next.config has output:standalone — remove that key before deploy"
fi

if [ -f "${APP_DIR}/frontend/middleware.ts" ] && [ -f "${APP_DIR}/frontend/proxy.ts" ]; then
    die "both middleware.ts and proxy.ts present — remove middleware.ts"
fi

PKG_JSON="${APP_DIR}/frontend/package.json"
if ! grep -q 'next build --webpack' "${PKG_JSON}"; then
    warn "package.json build script missing --webpack — patching in place"
    sudo -u "${APP_USER}" python3 - <<PY
import json
from pathlib import Path
p = Path("${PKG_JSON}")
data = json.loads(p.read_text())
data.setdefault("scripts", {})["build"] = "next build --webpack"
p.write_text(json.dumps(data, indent=2) + "\n")
print("patched build -> next build --webpack")
PY
fi
ok "frontend build script: $(grep -E '"build"' "${PKG_JSON}")"

sudo -u "${APP_USER}" bash -c "cd ${APP_DIR}/frontend && npm install"
sudo -u "${APP_USER}" bash -c "cd ${APP_DIR}/frontend && rm -rf .next"
BUILD_LOG="$(mktemp /tmp/bimark-next-build.XXXXXX.log)"
log "Building frontend with: npx next build --webpack  (log: ${BUILD_LOG})"
if ! sudo -u "${APP_USER}" env NODE_ENV=production \
    bash -c "cd ${APP_DIR}/frontend && npx next build --webpack" \
    >"${BUILD_LOG}" 2>&1; then
    tail -80 "${BUILD_LOG}" || true
    die "next build --webpack failed (see ${BUILD_LOG})"
fi
if grep -q '(webpack)' "${BUILD_LOG}"; then
    ok "confirmed webpack build"
elif grep -qi 'turbopack' "${BUILD_LOG}" && ! grep -q 'webpack' "${BUILD_LOG}"; then
    tail -40 "${BUILD_LOG}" || true
    die "build used Turbopack instead of webpack — aborting"
else
    warn "could not confirm webpack banner in log — showing head:"
    head -30 "${BUILD_LOG}" || true
fi
[ -d "${APP_DIR}/frontend/.next" ] || die "build failed — no .next"
ok "build artifacts present under .next"

# ---------------------------------------------------------------------------
log "[5/7] Refresh systemd units"
# ---------------------------------------------------------------------------
install_unit_from_template \
    "${APP_DIR}/deploy/systemd/bimark-backend.service.template" \
    "/etc/systemd/system/${BACKEND_UNIT}.service"
install_unit_from_template \
    "${APP_DIR}/deploy/systemd/bimark-frontend.service.template" \
    "/etc/systemd/system/${FRONTEND_UNIT}.service"
systemctl daemon-reload

# ---------------------------------------------------------------------------
log "[6/7] nginx (additive bimark block)"
# ---------------------------------------------------------------------------
ensure_bimark_nginx \
    "${APP_DIR}/deploy/nginx/bimark.locations.conf" \
    "${APP_DIR}/deploy/nginx/maintest.site.conf"

# ---------------------------------------------------------------------------
log "[7/7] Restart services + probe"
# ---------------------------------------------------------------------------
fuser -k "${FE_PORT}/tcp" 2>/dev/null || true
sleep 1

systemctl restart "${BACKEND_UNIT}"
systemctl restart "${FRONTEND_UNIT}"

systemctl is-active --quiet "${BACKEND_UNIT}" || die "backend inactive"
systemctl is-active --quiet "${FRONTEND_UNIT}" || {
    journalctl -u "${FRONTEND_UNIT}" -n 40 --no-pager || true
    die "frontend inactive"
}

for i in 1 2 3 4 5 6 7 8 9 10; do
    if ss -tln | grep -q "127.0.0.1:${FE_PORT}"; then
        break
    fi
    sleep 1
done

CODE="ERR"
for i in 1 2 3 4 5 6; do
    CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "http://127.0.0.1:${FE_PORT}${BASE_PATH}/ru" 2>/dev/null || echo ERR)"
    echo "    probe frontend try ${i}: HTTP ${CODE}"
    if echo "${CODE}" | grep -qE '^(200|301|302|307|308)$'; then
        break
    fi
    sleep 2
done

if ! echo "${CODE}" | grep -qE '^(200|301|302|307|308)$'; then
    journalctl -u "${FRONTEND_UNIT}" -n 40 --no-pager || true
    die "frontend probe failed (${CODE}). Check thin proxy.ts + webpack build."
fi

API="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "http://127.0.0.1:${BE_PORT}/api/assets/" 2>/dev/null || echo ERR)"
echo "    probe API:      HTTP ${API}"

NGX="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "http://127.0.0.1${BASE_PATH}/ru" 2>/dev/null || echo ERR)"
echo "    probe nginx:    HTTP ${NGX}"

echo
echo "=== Deploy OK ==="
echo "  App dir    : ${APP_DIR}"
echo "  http://${DOMAIN}${BASE_PATH}/ru"
echo "  User:Group = ${APP_USER}:${APP_GROUP}"
echo "  Ports      : FE ${FE_PORT}  BE ${BE_PORT}"
