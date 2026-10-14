#!/usr/bin/env bash
# EinStein — pull the latest code from GitHub and rebuild. Run as root on the server:
#   bash /var/www/einstein/deploy/update.sh
set -euo pipefail
APP_DIR="/var/www/einstein"
export GIT_SSH_COMMAND="ssh -i /root/.ssh/einstein_deploy -o StrictHostKeyChecking=accept-new"

echo "==> Pulling latest code"
git -C "$APP_DIR" pull --ff-only

echo "==> Backend"
cd "$APP_DIR/backend"
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan config:cache
php artisan route:cache
chown -R www-data:www-data storage bootstrap/cache database

echo "==> Frontend"
cd "$APP_DIR/front_end"
DOMAIN="$(grep '^APP_URL=' "$APP_DIR/backend/.env" | cut -d/ -f3)"
npm ci --no-audit --no-fund
VITE_BACKEND_API_URL="https://$DOMAIN/api" npm run build

systemctl reload php8.3-fpm nginx
echo "==> Done: https://$DOMAIN"
