#!/usr/bin/env bash
#
# fix_nginx_bimark.sh — inject /bimark locations into maintest.site nginx
# ======================================================================
# Needed when Next on :3001 is OK but https://maintest.site/bimark → 404.
# Typical cause: certbot SSL server{} never got bimark locations
# (or only HTTP block / host-header-less curl to 127.0.0.1).
#
#   sudo bash /var/www/bimark/deploy/fix_nginx_bimark.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

require_root
resolve_app_identity

LOCATIONS_SRC="${APP_DIR}/deploy/nginx/bimark.locations.conf"
[ -f "${LOCATIONS_SRC}" ] || die "missing ${LOCATIONS_SRC}"

SNIPPET_DIR="/etc/nginx/snippets"
SNIPPET="${SNIPPET_DIR}/bimark.conf"
CONF="/etc/nginx/sites-available/${DOMAIN}.conf"

mkdir -p "${SNIPPET_DIR}"
render_bimark_locations "${LOCATIONS_SRC}" > "${SNIPPET}"
chmod 644 "${SNIPPET}"
ok "wrote ${SNIPPET}"

if [ ! -f "${CONF}" ]; then
    log "No ${CONF} — creating minimal shell + SSL-ready HTTP"
    sed -e "s|__APP_DIR__|${APP_DIR}|g" "${APP_DIR}/deploy/nginx/maintest.site.conf" > "${CONF}"
fi

# Ensure include is present in every server{} that serves this domain on 443
# OR already has gardenhouse/bimark app locations (not pure ACME).
# Using a marker comment so re-runs are idempotent.
python3 - <<'PY' "${CONF}"
import re, sys
from pathlib import Path

conf_path = Path(sys.argv[1])
text = conf_path.read_text()
include_line = "    include /etc/nginx/snippets/bimark.conf;  # BiMark /bimark"
marker = "include /etc/nginx/snippets/bimark.conf"

if marker in text:
    print("include already present — snippet refresh only")
    sys.exit(0)

# Split into top-level server blocks (brace-counting)
parts = []
i = 0
n = len(text)
while i < n:
    m = re.search(r'\bserver\s*\{', text[i:])
    if not m:
        parts.append(("text", text[i:]))
        break
    start = i + m.start()
    parts.append(("text", text[i:start]))
    # find matching close brace
    j = i + m.end() - 1  # points at '{'
    depth = 0
    k = j
    while k < n:
        if text[k] == '{':
            depth += 1
        elif text[k] == '}':
            depth -= 1
            if depth == 0:
                k += 1
                break
        k += 1
    block = text[start:k]
    parts.append(("server", block))
    i = k

out = []
injected = 0
for kind, chunk in parts:
    if kind != "server":
        out.append(chunk)
        continue
    lower = chunk.lower()
    # Skip pure redirect-only HTTP blocks that have no real app locations?
    # Still inject into 443 and into any block that already has gardenhouse.
    is_ssl = "listen 443" in lower or "listen [::]:443" in lower or "ssl_certificate" in lower
    has_garden = "gardenhouse" in lower or "/bimark" in lower
    has_proxy = "proxy_pass" in lower
    # Prefer SSL servers and servers that already reverse-proxy apps
    if not (is_ssl or has_garden or has_proxy):
        out.append(chunk)
        continue
    # Insert include after opening `server {` line
    new_chunk, nsub = re.subn(
        r'(server\s*\{)',
        r'\1\n' + include_line + "\n",
        chunk,
        count=1,
    )
    if nsub:
        injected += 1
        out.append(new_chunk)
    else:
        out.append(chunk)

result = "".join(out)
if injected == 0:
    # Fallback: insert before the last closing brace of the file
    print("WARN: no matching server{} — fallback insert before last }")
    idx = result.rfind("}")
    if idx < 0:
        raise SystemExit(f"cannot parse {conf_path}")
    result = result[:idx] + "\n" + include_line + "\n" + result[idx:]
    injected = 1

conf_path.write_text(result)
print(f"injected include into {injected} server block(s)")
PY

ln -sfn "${CONF}" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx
ok "nginx reloaded"

echo
echo "----- probes (Host: ${DOMAIN}) -----"
for url in \
    "http://127.0.0.1${BASE_PATH}/ru" \
    "https://127.0.0.1${BASE_PATH}/ru" \
    "https://${DOMAIN}${BASE_PATH}/ru"
do
    if [[ "${url}" == https://127* ]]; then
        code="$(curl -skS -o /dev/null -w '%{http_code}' --max-time 10 -H "Host: ${DOMAIN}" "${url}" 2>/dev/null || echo ERR)"
    elif [[ "${url}" == http://127* ]]; then
        code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 -H "Host: ${DOMAIN}" "${url}" 2>/dev/null || echo ERR)"
    else
        code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "${url}" 2>/dev/null || echo ERR)"
    fi
    echo "  ${code}  ${url}"
done

echo
echo "=== nginx bimark FIX OK ==="
echo "  Open: https://${DOMAIN}${BASE_PATH}/ru"
echo "  Note: curl http://127.0.0.1/bimark without Host header hits default vhost → often 404."
echo "  Use:  curl -sI -H 'Host: ${DOMAIN}' https://127.0.0.1${BASE_PATH}/ru -k"
