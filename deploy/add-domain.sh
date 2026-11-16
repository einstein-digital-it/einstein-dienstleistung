#!/usr/bin/env bash
# Second address for the EinStein app, e.g. app.einsteindienstleistung.de,
# that forwards (301) to the main address. One site, one login, one Stripe setup.
#
#   sudo bash deploy/add-domain.sh <extra-domain> <main-domain> <admin-email>
#   sudo bash deploy/add-domain.sh app.einsteindienstleistung.de app.einsteindienstleistung.com info@einsteindienstleistung.de
#
# Before: point the DNS A record of <extra-domain> at this server's IP.
set -euo pipefail

EXTRA="${1:?extra domain missing, e.g. app.einsteindienstleistung.de}"
MAIN="${2:?main domain missing, e.g. app.einsteindienstleistung.com}"
ADMIN_EMAIL="${3:?admin e-mail missing (for Let's Encrypt)}"
SITE="einstein-alias-$EXTRA"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run with sudo."; exit 1
fi

# The certificate only works once the DNS record points here
SERVER_IP="$(curl -s -4 https://api.ipify.org || true)"
DNS_IP="$(getent ahostsv4 "$EXTRA" | awk 'NR==1{print $1}' || true)"
echo "Server IP: ${SERVER_IP:-unknown} · $EXTRA points to: ${DNS_IP:-nothing yet}"
if [ -n "$SERVER_IP" ] && [ "$DNS_IP" != "$SERVER_IP" ]; then
  echo "The DNS A record of $EXTRA does not point to this server yet."
  echo "Set it to $SERVER_IP at your domain provider, wait a few minutes, then run this again."
  exit 1
fi

cat > "/etc/nginx/sites-available/$SITE" <<EOF
server {
    listen 80;
    server_name $EXTRA;
    location / {
        return 301 https://$MAIN\$request_uri;
    }
}
EOF
ln -sf "/etc/nginx/sites-available/$SITE" "/etc/nginx/sites-enabled/$SITE"
if ! nginx -t; then
  echo "nginx config test failed - removing it again so the other sites keep running."
  rm -f "/etc/nginx/sites-enabled/$SITE"
  exit 1
fi
systemctl reload nginx

# HTTPS for the extra address too (certbot adds the 443 block with the same redirect)
certbot --nginx -d "$EXTRA" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect

echo
echo "Check:"
curl -sI "https://$EXTRA/MyDocuments" | grep -iE "^(HTTP|location)" || true
echo "Done: https://$EXTRA now forwards to https://$MAIN"
