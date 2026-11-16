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
# Before: point the DNS A record of <new-domain> at this server's IP.
set -euo pipefail

NEW="${1:?new main domain missing, e.g. app.einsteindienstleistung.de}"
OLD="${2:?old domain missing, e.g. app.einsteindienstleistung.com}"
ADMIN_EMAIL="${3:?admin e-mail missing (for Let's Encrypt)}"
APP_DIR="/var/www/einstein"
OLD_SITE="/etc/nginx/sites-available/einstein"
NEW_SITE="/etc/nginx/sites-available/einstein-$NEW"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run with sudo."; exit 1
fi
if [ ! -f "$OLD_SITE" ]; then
  echo "$OLD_SITE not found - was the server set up with deploy/server-setup.sh?"; exit 1
fi

# 1. The certificate only works once the DNS record points here
SERVER_IP="$(curl -s -4 https://api.ipify.org || true)"
DNS_IP="$(getent ahostsv4 "$NEW" | awk 'NR==1{print $1}' || true)"
echo "Server IP: ${SERVER_IP:-unknown} · $NEW points to: ${DNS_IP:-nothing yet}"
if [ -n "$SERVER_IP" ] && [ "$DNS_IP" != "$SERVER_IP" ]; then
  echo "The DNS A record of $NEW does not point to this server yet."
  echo "Set it to $SERVER_IP at your domain provider, wait a few minutes, then run this again."
  exit 1
fi

# A forward made earlier with add-domain.sh for the same address would clash
rm -f "/etc/nginx/sites-enabled/einstein-alias-$NEW" "/etc/nginx/sites-available/einstein-alias-$NEW"

# 2. The new address: website + API (same as server-setup.sh)
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
if ! nginx -t; then
  echo "nginx config test failed - removing the new site again."
  rm -f "/etc/nginx/sites-enabled/einstein-$NEW"
  exit 1
fi
systemctl reload nginx
certbot --nginx -d "$NEW" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect

# 3. The old address: website pages forward to the new one, /api keeps working
cp "$OLD_SITE" "$OLD_SITE.bak-$(date +%Y%m%d%H%M%S)"
if grep -q 'try_files \$uri /index.html;' "$OLD_SITE"; then
  sed -i "s#try_files \$uri /index.html;#return 301 https://$NEW\$request_uri;#g" "$OLD_SITE"
fi
if ! nginx -t; then
  echo "nginx config test failed - restoring the old site."
  cp "$(ls -t "$OLD_SITE".bak-* | head -1)" "$OLD_SITE"
  nginx -t && systemctl reload nginx
  exit 1
fi
systemctl reload nginx

# 4. APP_URL → new address, then rebuild (update.sh builds the website for APP_URL)
ENV_FILE="$APP_DIR/backend/.env"
cp "$ENV_FILE" "$ENV_FILE.bak-$(date +%Y%m%d%H%M%S)"
sed -i "s#^APP_URL=.*#APP_URL=https://$NEW#" "$ENV_FILE"
bash "$APP_DIR/deploy/update.sh"

echo
echo "Check:"
curl -s "https://$NEW/api/health" || true; echo
curl -sI "https://$OLD/MyDocuments" | grep -iE "^(HTTP|location)" || true
curl -s "https://$OLD/api/health" || true; echo
echo "Done: https://$NEW is the main address; https://$OLD forwards, its /api keeps working."
