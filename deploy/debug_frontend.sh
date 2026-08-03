#!/usr/bin/env bash
#
# debug_frontend.sh — isolate hang on /bimark/ru (bypasses nginx + systemd)
# =========================================================================
#   sudo bash /var/www/bimark/deploy/debug_frontend.sh
#
# Runs `next start` in foreground on an alternate port as app user.
# In another SSH session:
#   curl -sI --max-time 15 http://127.0.0.1:3101/bimark/ru
#

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

require_root
resolve_app_identity
FE="${APP_DIR}/frontend"
DEBUG_PORT=$((FE_PORT + 100))

echo "======== FACTS ========"
echo "APP_DIR=$APP_DIR  user=$APP_USER group=$APP_GROUP"
echo "package.json build:"
grep -E '"build"' "${FE}/package.json" || true
echo "basePath in build:"
python3 - <<PY
import json
from pathlib import Path
p = Path("${FE}/.next/required-server-files.json")
if p.exists():
    print(json.load(open(p))["config"].get("basePath"))
else:
    print("NO .next — need build")
PY
echo "proxy vs middleware:"
ls -la "${FE}/proxy.ts" "${FE}/middleware.ts" 2>/dev/null || true
echo "proxy/middleware artifact:"
ls -la "${FE}/.next/server/middleware.js" "${FE}/.next/server/proxy.js" 2>/dev/null || echo "(none)"
echo "locale pages:"
find "${FE}/.next/server/app" -path '*locale*' -name 'page.js' 2>/dev/null | head -10 || true
echo
echo "Stopping systemd frontend (port ${FE_PORT}) for isolation..."
systemctl stop "${FRONTEND_UNIT}" 2>/dev/null || true
fuser -k "${FE_PORT}/tcp" 2>/dev/null || true
fuser -k "${DEBUG_PORT}/tcp" 2>/dev/null || true
sleep 1

echo
echo "======== starting next on :${DEBUG_PORT} ========"
echo "  curl -sI --max-time 15 http://127.0.0.1:${DEBUG_PORT}${BASE_PATH}/ru"
echo "  Ctrl+C to stop"
echo

cd "${FE}"
exec sudo -u "${APP_USER}" env NODE_ENV=production \
    /usr/bin/node node_modules/next/dist/bin/next start -H 127.0.0.1 -p "${DEBUG_PORT}"
