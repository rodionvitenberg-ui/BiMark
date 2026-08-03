#!/usr/bin/env bash
#
# fix_frontend_webpack.sh — one-shot repair when /bimark/ru hangs (000ERR)
# =======================================================================
# Root cause: Next 16.2 default Turbopack prod build hangs on
# /bimark/[locale]. Webpack build returns 200.
#
#   sudo bash /var/www/bimark/deploy/fix_frontend_webpack.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

require_root
resolve_app_identity

FE="${APP_DIR}/frontend"
[ -d "${FE}" ] || die "missing ${FE}"

log "1/6 Stop frontend"
systemctl stop "${FRONTEND_UNIT}" 2>/dev/null || true
fuser -k "${FE_PORT}/tcp" 2>/dev/null || true
sleep 1

log "2/6 Ensure package.json uses webpack + env"
sudo -u "${APP_USER}" python3 - <<PY
import json
from pathlib import Path
p = Path("${FE}/package.json")
d = json.loads(p.read_text())
d.setdefault("scripts", {})["build"] = "next build --webpack"
p.write_text(json.dumps(d, indent=2) + "\n")
print("build =", d["scripts"]["build"])
PY

FRONTEND_ENV="${FE}/.env.production"
if [ ! -f "${FRONTEND_ENV}" ]; then
    if [ -f "${FE}/.env.production.example" ]; then
        cp "${FE}/.env.production.example" "${FRONTEND_ENV}"
    else
        touch "${FRONTEND_ENV}"
    fi
fi
ensure_env_key "${FRONTEND_ENV}" "NEXT_PUBLIC_BASE_PATH" "${BASE_PATH}"
ensure_env_key "${FRONTEND_ENV}" "NEXT_PUBLIC_SITE_URL" "https://${DOMAIN}${BASE_PATH}"
ensure_env_key "${FRONTEND_ENV}" "NEXT_PUBLIC_API_URL" "${BASE_PATH}/api"
ensure_env_key "${FRONTEND_ENV}" "API_URL" "http://127.0.0.1:${BE_PORT}/api"
app_chown "${FRONTEND_ENV}"
ok "env BASE_PATH=$(grep BASE_PATH "${FRONTEND_ENV}")"

log "3/6 Clean .next + npm install"
sudo -u "${APP_USER}" bash -c "cd ${FE} && rm -rf .next && npm install"

log "4/6 next build --webpack"
BUILD_LOG="/tmp/bimark-webpack-build.log"
if ! sudo -u "${APP_USER}" env NODE_ENV=production \
    bash -c "cd ${FE} && npx next build --webpack" \
    2>&1 | tee "${BUILD_LOG}"; then
    die "build failed — see ${BUILD_LOG}"
fi

if ! grep -q '(webpack)' "${BUILD_LOG}"; then
    warn "Did not see '(webpack)' in build log"
    if grep -qi 'turbopack' "${BUILD_LOG}" && ! grep -qi 'webpack' "${BUILD_LOG}"; then
        die "This was a Turbopack build. Abort."
    fi
fi
ok "build finished"

log "5/6 Ensure systemd unit + start"
if [ -f "${APP_DIR}/deploy/systemd/bimark-frontend.service.template" ]; then
    install_unit_from_template \
        "${APP_DIR}/deploy/systemd/bimark-frontend.service.template" \
        "/etc/systemd/system/${FRONTEND_UNIT}.service"
    systemctl daemon-reload
fi
systemctl enable "${FRONTEND_UNIT}"
systemctl restart "${FRONTEND_UNIT}"
sleep 3
systemctl is-active --quiet "${FRONTEND_UNIT}" || {
    journalctl -u "${FRONTEND_UNIT}" -n 50 --no-pager || true
    die "service not active"
}
ok "service active"
ss -tlnp | grep "${FE_PORT}" || warn "nothing on :${FE_PORT}"

log "6/6 Probes"
for url in \
    "http://127.0.0.1:${FE_PORT}${BASE_PATH}" \
    "http://127.0.0.1:${FE_PORT}${BASE_PATH}/ru" \
    "http://127.0.0.1:${FE_PORT}/ru" \
    "http://127.0.0.1${BASE_PATH}/ru"
do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "${url}" 2>/dev/null || echo ERR)"
    echo "    ${code}  ${url}"
done

RU="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "http://127.0.0.1:${FE_PORT}${BASE_PATH}/ru" 2>/dev/null || echo ERR)"
if ! echo "${RU}" | grep -qE '^(200|301|302|307|308)$'; then
    journalctl -u "${FRONTEND_UNIT}" -n 30 --no-pager || true
    die "probe ${BASE_PATH}/ru = ${RU}"
fi

echo
echo "=== FIX OK ==="
echo "  Open: http://${DOMAIN}${BASE_PATH}"
