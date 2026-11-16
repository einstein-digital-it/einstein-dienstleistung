#!/usr/bin/env bash
# Make another address the main one, e.g. app.einsteindienstleistung.de instead of .com.
#   - the new address serves the website and the API
#   - the old address forwards website pages (301) to the new one, but keeps serving /api,
#     so installed apps and the Stripe webhook keep working
#   - APP_URL in backend/.env becomes the new address (Stripe return pages, links in mails)
#
#   sudo bash deploy/make-main-domain.sh <new-domain> <old-domain> <admin-email>
#   sudo bash deploy/make-main-domain.sh app.einsteindienstleistung.de app.einsteindienstleistung.com info@einsteindienstleistung.de
#
# Before: point the DNS A record of <new-domain> at this server's IPv4 address.
set -eo pipefail

NEW="${1:?new main domain missing, e.g. app.einsteindienstleistung.de}"
OLD="${2:?old domain missing, e.g. app.einsteindienstleistung.com}"
ADMIN_EMAIL="${3:?admin e-mail missing (for Let's Encrypt)}"
APP_DIR="/var/www/einstein"
OLD_SITE="/etc/nginx/sites-available/einstein"
NEW_SITE="/etc/nginx/sites-available/einstein-$NEW"
STAMP="$(date +%Y%m%d%H%M%S)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run with sudo."; exit 1
fi
if [ ! -f "$OLD_SITE" ]; then
  echo "$OLD_SITE not found - was the server set up with deploy/server-setup.sh?"; exit 1
fi

# 1. The certificate and the site only work once the DNS A record points here
SERVER_IPS="$(hostname -I 2>/dev/null || true) $(curl -s -4 --max-time 5 https://api.ipify.org 2>/dev/null || true)"
DNS_IP="$(getent ahostsv4 "$NEW" 2>/dev/null | awk 'NR==1{print $1}' || true)"
DNS_IP6="$(getent ahostsv6 "$NEW" 2>/dev/null | awk 'NR==1{print $1}' || true)"
echo "This server: ${SERVER_IPS:-unknown}"
echo "$NEW → IPv4: ${DNS_IP:-none}   IPv6: ${DNS_IP6:-none}"
if [ -z "$DNS_IP" ]; then
  echo "$NEW has no A record (IPv4) yet. At your domain provider add an A record for it"
  echo "pointing to this server's IPv4 address, wait a few minutes, then run this again."
  exit 1
fi
case " $SERVER_IPS " in
  *" $DNS_IP "*) ;;
  *) echo "$NEW points to $DNS_IP, which is not this server. Fix the A record, then run this again."; exit 1 ;;
esac

# A forward made earlier with add-domain.sh for the same address would clash
rm -f "/etc/nginx/sites-enabled/einstein-alias-$NEW" "/etc/nginx/sites-available/einstein-alias-$NEW"

restore_and_exit() {
  echo "nginx config test failed - restoring the previous config."
  cp "$OLD_SITE.bak-$STAMP" "$OLD_SITE"
  rm -f "/etc/nginx/sites-enabled/einstein-$NEW"
  nginx -t && systemctl reload nginx
  exit 1
}
cp "$OLD_SITE" "$OLD_SITE.bak-$STAMP"

# 2. The new address: website + API
if grep -qE "server_name[^;]*\b${NEW//./\\.}\b" "$OLD_SITE"; then
  echo "$NEW is already in $OLD_SITE - using that."
else
  cat > "$NEW_SITE" <<EOF
server {
    listen 80;
    server_name $NEW;
    client_max_body_size 25M;

    # React website
    root $APP_DIR/front_end/dist;
    index index.html;
    location / {
        try_files \$uri /index.html;
    }

    # Laravel API (used by the website and the mobile app)
    location ~ ^/(api|up|storage)(/|\$) {
        root $APP_DIR/backend/public;
        try_files \$uri /index.php?\$query_string;
    }
    location = /index.php {
        root $APP_DIR/backend/public;
        include snippets/fastcgi-php.conf;
        fastcgi_param SCRIPT_FILENAME $APP_DIR/backend/public/index.php;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    location ~ /\.(?!well-known) { deny all; }
}
EOF
  ln -sf "$NEW_SITE" "/etc/nginx/sites-enabled/einstein-$NEW"
  nginx -t || restore_and_exit
  systemctl reload nginx
fi
# A certificate for the new address (keeps an existing one)
certbot --nginx -d "$NEW" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect --keep-until-expiring

# 3. The old address: website pages forward to the new one, /api keeps working.
#    Only inside the server blocks of the old address.
awk -v old="$OLD" -v new="$NEW" '
  /^[[:space:]]*server[[:space:]]*\{/ { name = "" }
  /server_name/ { name = $0 }
  {
    if (index(name, old) > 0 && $0 ~ /try_files \$uri \/index\.html;/) {
      sub(/try_files \$uri \/index\.html;/, "return 301 https://" new "$request_uri;")
    }
    print
  }' "$OLD_SITE.bak-$STAMP" > "$OLD_SITE"
nginx -t || restore_and_exit
systemctl reload nginx

# 4. APP_URL → new address, then rebuild (update.sh builds the website for APP_URL)
ENV_FILE="$APP_DIR/backend/.env"
cp "$ENV_FILE" "$ENV_FILE.bak-$STAMP"
sed -i "s#^APP_URL=.*#APP_URL=https://$NEW#" "$ENV_FILE"
bash "$APP_DIR/deploy/update.sh"

echo
echo "Check:"
curl -s "https://$NEW/api/health" || true; echo
curl -sI "https://$OLD/MyDocuments" | grep -iE "^(HTTP|location)" || true
curl -s "https://$OLD/api/health" || true; echo
echo "Done: https://$NEW is the main address; https://$OLD forwards, its /api keeps working."
echo "Backups: $OLD_SITE.bak-$STAMP and $ENV_FILE.bak-$STAMP"
