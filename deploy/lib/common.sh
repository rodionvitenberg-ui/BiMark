#!/usr/bin/env bash
# deploy/lib/common.sh — shared helpers for BiMark deploy scripts
# Source:  source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

# shellcheck disable=SC2034

# ---------------------------------------------------------------------------
# Defaults (override via env before sourcing)
# ---------------------------------------------------------------------------
: "${APP_NAME:=bimark}"
: "${APP_USER:=maintest}"
# APP_GROUP resolved at runtime from OS (often `sudo` on Webdock)
: "${APP_DIR:=/var/www/${APP_NAME}}"
: "${DOMAIN:=maintest.site}"
: "${SERVER_IP:=193.181.216.124}"
: "${REPO_URL:=https://github.com/rodionvitenberg-ui/BiMark.git}"
: "${REPO_BRANCH:=main}"
: "${DB_NAME:=bimark_db}"
: "${DB_USER:=bimark_user}"
: "${BASE_PATH:=/bimark}"
: "${FE_PORT:=3001}"
: "${BE_PORT:=8001}"
# Coexistence: gardenhouse uses 3000/8000 — do not collide
: "${BACKEND_UNIT:=${APP_NAME}-backend}"
: "${FRONTEND_UNIT:=${APP_NAME}-frontend}"

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
log()  { echo "==> $*"; }
ok()   { echo "    OK  $*"; }
warn() { echo "    !!  $*"; }
die()  { echo "ERROR: $*" >&2; exit 1; }

require_root() {
    if [ "$(id -u)" -ne 0 ]; then
        die "run as root:  sudo bash $0 $*"
    fi
}

resolve_app_identity() {
    if ! id "${APP_USER}" >/dev/null 2>&1; then
        die "user '${APP_USER}' does not exist.
  On Webdock create the profile first, or set APP_USER to your login:
    sudo APP_USER=myuser bash $0"
    fi
    APP_GROUP="$(id -gn "${APP_USER}")"
    APP_HOME="$(getent passwd "${APP_USER}" | cut -d: -f6)"
    if [ -z "${APP_HOME}" ] || [ ! -d "${APP_HOME}" ]; then
        warn "home for ${APP_USER} missing — using /home/${APP_USER}"
        APP_HOME="/home/${APP_USER}"
        mkdir -p "${APP_HOME}"
        chown "${APP_USER}:${APP_GROUP}" "${APP_HOME}"
    fi
    export APP_USER APP_GROUP APP_HOME APP_DIR DOMAIN BASE_PATH FE_PORT BE_PORT
    log "Identity: user=${APP_USER} group=${APP_GROUP} home=${APP_HOME}"
    log "App dir:  ${APP_DIR}  basePath=${BASE_PATH}  FE:${FE_PORT} BE:${BE_PORT}"
}

app_chown() {
    local target="$1"
    chown -R "${APP_USER}:${APP_GROUP}" "${target}"
}

ensure_app_dir() {
    mkdir -p "${APP_DIR}"
    app_chown "${APP_DIR}"
}

install_unit_from_template() {
    local template="$1"
    local dest="$2"
    if [ ! -f "${template}" ]; then
        die "unit template missing: ${template}"
    fi
    sed \
        -e "s|__APP_USER__|${APP_USER}|g" \
        -e "s|__APP_GROUP__|${APP_GROUP}|g" \
        -e "s|__APP_DIR__|${APP_DIR}|g" \
        -e "s|__FE_PORT__|${FE_PORT}|g" \
        -e "s|__BE_PORT__|${BE_PORT}|g" \
        -e "s|__APP_NAME__|${APP_NAME}|g" \
        "${template}" > "${dest}"
    ok "installed ${dest} (User=${APP_USER} Group=${APP_GROUP})"
}

ensure_env_key() {
    local file="$1" key="$2" value="$3"
    if [ ! -f "${file}" ]; then
        printf '%s=%s\n' "${key}" "${value}" > "${file}"
        return
    fi
    if grep -q "^${key}=" "${file}"; then
        sed -i "s|^${key}=.*|${key}=${value}|" "${file}"
    else
        printf '%s=%s\n' "${key}" "${value}" >> "${file}"
    fi
}

read_env_key() {
    local file="$1" key="$2"
    grep -E "^${key}=" "${file}" 2>/dev/null | head -n1 | cut -d= -f2- || true
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Render bimark location blocks with APP_DIR / ports substituted
render_bimark_locations() {
    local src="${1:-}"
    if [ -z "${src}" ] || [ ! -f "${src}" ]; then
        src="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/nginx/bimark.locations.conf"
    fi
    sed \
        -e "s|__APP_DIR__|${APP_DIR}|g" \
        -e "s|__FE_PORT__|${FE_PORT}|g" \
        -e "s|__BE_PORT__|${BE_PORT}|g" \
        -e "s|__BASE_PATH__|${BASE_PATH}|g" \
        "${src}"
}

# Insert or replace # BEGIN bimark … # END bimark inside an nginx server conf.
# Does NOT wipe gardenhouse locations.
upsert_bimark_nginx_block() {
    local conf_file="$1"
    local locations_src="$2"
    local block_file tmp
    block_file="$(mktemp)"
    tmp="$(mktemp)"

    if [ ! -f "${conf_file}" ]; then
        die "nginx conf missing: ${conf_file}"
    fi

    render_bimark_locations "${locations_src}" > "${block_file}"

    if grep -q "# BEGIN bimark" "${conf_file}"; then
        # Replace existing marked block (file-based — safe for multiline)
        awk -v bf="${block_file}" '
            BEGIN { inblock=0 }
            /# BEGIN bimark/ {
                print "    # BEGIN bimark"
                while ((getline line < bf) > 0) print line
                close(bf)
                inblock=1
                next
            }
            /# END bimark/ {
                print "    # END bimark"
                inblock=0
                next
            }
            !inblock { print }
        ' "${conf_file}" > "${tmp}"
    else
        # Insert before the last closing brace of the file
        awk -v bf="${block_file}" '
            { lines[NR]=$0 }
            END {
                last=0
                for (i=NR; i>=1; i--) {
                    if (lines[i] ~ /^[[:space:]]*}[[:space:]]*$/) { last=i; break }
                }
                if (last==0) last=NR+1
                for (i=1; i<=NR; i++) {
                    if (i==last) {
                        print ""
                        print "    # BEGIN bimark"
                        while ((getline line < bf) > 0) print line
                        close(bf)
                        print "    # END bimark"
                        print ""
                    }
                    print lines[i]
                }
            }
        ' "${conf_file}" > "${tmp}"
    fi
    mv "${tmp}" "${conf_file}"
    rm -f "${block_file}"
    ok "upserted bimark locations into ${conf_file}"
}

# Ensure domain nginx conf exists and contains bimark locations.
# Prefer existing conf (gardenhouse); only create minimal shell if missing.
ensure_bimark_nginx() {
    local locations_src="$1"
    local nginx_shell="$2"
    local nginx_avail="/etc/nginx/sites-available/${DOMAIN}.conf"
    local nginx_enabled="/etc/nginx/sites-enabled/${DOMAIN}.conf"

    mkdir -p /var/www/certbot

    if [ ! -f "${nginx_avail}" ]; then
        log "No ${nginx_avail} — creating minimal server shell"
        sed -e "s|__APP_DIR__|${APP_DIR}|g" "${nginx_shell}" > "${nginx_avail}"
    fi

    if grep -q "managed by Certbot" "${nginx_avail}"; then
        warn "${nginx_avail} is certbot-managed — upserting locations only (TLS blocks kept)"
    fi

    upsert_bimark_nginx_block "${nginx_avail}" "${locations_src}"
    ln -sfn "${nginx_avail}" "${nginx_enabled}"
    # Keep gardenhouse / other sites; only drop default site
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl reload nginx || systemctl restart nginx
    ok "nginx ready for ${BASE_PATH}"
}
