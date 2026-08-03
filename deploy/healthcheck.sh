#!/usr/bin/env bash
#
# healthcheck.sh — paste this output when debugging BiMark
#   sudo bash /var/www/bimark/deploy/healthcheck.sh
#

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

require_root
resolve_app_identity

PUBLIC_IP="$(curl -4 -fsSL --max-time 5 ifconfig.me 2>/dev/null || echo unknown)"
DNS_IP="$(getent ahostsv4 "${DOMAIN}" 2>/dev/null | awk '{print $1}' | head -1 || true)"

echo "======== healthcheck $(date -Is) ========"
echo "user:group  ${APP_USER}:${APP_GROUP}"
echo "APP_DIR     ${APP_DIR}"
echo "BASE_PATH   ${BASE_PATH}  FE:${FE_PORT} BE:${BE_PORT}"
echo "public IP   ${PUBLIC_IP}"
echo "DNS ${DOMAIN} ${DNS_IP:-UNRESOLVED}"
echo
echo "----- ports -----"
ss -tlnp | grep -E ":80 |:443 |:${FE_PORT} |:${BE_PORT} |:3000 |:8000 " || echo "(none)"
echo
echo "----- systemd -----"
systemctl is-active nginx "${BACKEND_UNIT}" "${FRONTEND_UNIT}" 2>&1 || true
echo
echo "----- unit files (User/Group) -----"
grep -E '^(User|Group|ExecStart)=' /etc/systemd/system/bimark-*.service 2>/dev/null || true
echo
echo "----- frontend env -----"
grep -E '^(NEXT_PUBLIC_|API_URL)' "${APP_DIR}/frontend/.env.production" 2>/dev/null || echo "no .env.production"
echo
echo "----- next.config standalone output? -----"
if [ -f "${APP_DIR}/frontend/next.config.ts" ] \
   && sed 's|//.*||g' "${APP_DIR}/frontend/next.config.ts" \
        | grep -qE '^[[:space:]]*output:[[:space:]]*["'\'']standalone["'\'']'; then
    echo "FAIL: real output standalone is set"
else
    echo "(no standalone output key — good)"
fi
echo "----- proxy.ts vs middleware.ts -----"
[ -f "${APP_DIR}/frontend/proxy.ts" ] && echo "proxy.ts: present" || echo "proxy.ts: MISSING"
[ -f "${APP_DIR}/frontend/middleware.ts" ] && echo "middleware.ts: PRESENT (should remove if createMiddleware)" || echo "middleware.ts: absent (good)"
echo
echo "----- probes -----"
for url in \
    "http://127.0.0.1:${BE_PORT}/api/assets/" \
    "http://127.0.0.1:${FE_PORT}${BASE_PATH}/ru" \
    "http://127.0.0.1:${FE_PORT}/ru" \
    "http://127.0.0.1${BASE_PATH}/ru" \
    "http://127.0.0.1${BASE_PATH}"
do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 8 "${url}" 2>/dev/null || echo ERR)"
    echo "  ${code}  ${url}"
done
echo
echo "----- recent frontend logs -----"
journalctl -u "${FRONTEND_UNIT}" -n 25 --no-pager 2>/dev/null || true
echo
echo "----- recent backend logs -----"
journalctl -u "${BACKEND_UNIT}" -n 15 --no-pager 2>/dev/null || true
echo "======== end ========"
