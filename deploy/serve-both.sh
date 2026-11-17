#!/usr/bin/env bash
# Serve the whole EinStein app (website + API) on a second address as well, e.g.
# app.einsteindienstleistung.de next to app.einsteindienstleistung.com. No forwarding:
# both work fully. Stripe sends customers back to the address they paid from.
#
#   sudo bash deploy/serve-both.sh <extra-domain> <admin-email>
#   sudo bash deploy/serve-both.sh app.einsteindienstleistung.de info@einsteindienstleistung.de
#
# Before: point the DNS A record of <extra-domain> at this server's IPv4 address.
set -eo pipefail

EXTRA="${1:?extra domain missing, e.g. app.einsteindienstleistung.de}"
ADMIN_EMAIL="${2:?admin e-mail missing (for Let's Encrypt)}"
APP_DIR="/var/www/einstein"
MAIN_SITE="/etc/nginx/sites-available/einstein"
EXTRA_SITE="/etc/nginx/sites-available/einstein-$EXTRA"
STAMP="$(date +%Y%m%d%H%M%S)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run with sudo."; exit 1
fi
if [ ! -f "$MAIN_SITE" ]; then
  echo "$MAIN_SITE not found - was the server set up with deploy/server-setup.sh?"; exit 1
fi

# 1. The certificate and the site only work once the DNS A record points here
SERVER_IPS="$(hostname -I 2>/dev/null || true) $(curl -s -4 --max-time 5 https://api.ipify.org 2>/dev/null || true)"
DNS_IP="$(getent ahostsv4 "$EXTRA" 2>/dev/null | awk 'NR==1{print $1}' || true)"
echo "This server: ${SERVER_IPS:-unknown}"
echo "$EXTRA → IPv4: ${DNS_IP:-none}"
if [ -z "$DNS_IP" ]; then
  echo "$EXTRA has no A record (IPv4) yet. At your domain provider add an A record for it"
  echo "pointing to this server's IPv4 address, wait a few minutes, then run this again."
  exit 1
fi
case " $SERVER_IPS " in
  *" $DNS_IP "*) ;;
  *) echo "$EXTRA points to $DNS_IP, which is not this server. Fix the A record, then run this again."; exit 1 ;;
esac

# Forwarding made by the older add-domain.sh / make-main-domain.sh is no longer wanted
rm -f "/etc/nginx/sites-enabled/einstein-alias-$EXTRA" "/etc/nginx/sites-available/einstein-alias-$EXTRA"
cp "$MAIN_SITE" "$MAIN_SITE.bak-$STAMP"
sed -i -E "s#return 301 https://[^;]*\\\$request_uri;#try_files \$uri /index.html;#g" "$MAIN_SITE"

# 2. A site for the extra address, the same as the main one (unless the main file already has it)
if grep -qE "server_name[^;]*\b${EXTRA//./\\.}\b" "$MAIN_SITE"; then
  echo "$EXTRA is already in $MAIN_SITE - using that."
else
  cat > "$EXTRA_SITE" <<EOF
server {
    listen 80;
    server_name $EXTRA;
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
  ln -sf "$EXTRA_SITE" "/etc/nginx/sites-enabled/einstein-$EXTRA"
fi
if ! nginx -t; then
  echo "nginx config test failed - restoring the previous config."
  cp "$MAIN_SITE.bak-$STAMP" "$MAIN_SITE"
  rm -f "/etc/nginx/sites-enabled/einstein-$EXTRA"
  nginx -t && systemctl reload nginx
  exit 1
fi
systemctl reload nginx
certbot --nginx -d "$EXTRA" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect --keep-until-expiring

# 3. Tell Laravel about the extra address (Stripe return pages), then rebuild
ENV_FILE="$APP_DIR/backend/.env"
cp "$ENV_FILE" "$ENV_FILE.bak-$STAMP"
if grep -q '^APP_EXTRA_URLS=' "$ENV_FILE"; then
  grep -q "https://$EXTRA" "$ENV_FILE" || sed -i "s#^APP_EXTRA_URLS=\(.*\)#APP_EXTRA_URLS=\1,https://$EXTRA#; s#^APP_EXTRA_URLS=,#APP_EXTRA_URLS=#" "$ENV_FILE"
else
  echo "APP_EXTRA_URLS=https://$EXTRA" >> "$ENV_FILE"
fi
bash "$APP_DIR/deploy/update.sh"

MAIN="$(grep '^APP_URL=' "$ENV_FILE" | cut -d/ -f3)"
echo
echo "Check:"
for d in "$MAIN" "$EXTRA"; do
  printf '%s  website: ' "$d"; curl -s -o /dev/null -w '%{http_code}' "https://$d/MyDocuments"
  printf '  api: '; curl -s "https://$d/api/health"; echo
done
echo "Done: the app runs on https://$MAIN and https://$EXTRA."
echo "Backups: $MAIN_SITE.bak-$STAMP and $ENV_FILE.bak-$STAMP"
