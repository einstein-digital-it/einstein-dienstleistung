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

# Laravel scheduler (daily document reminders), runs as www-data; safe to repeat
CRON_LINE="* * * * * cd $APP_DIR/backend && php artisan schedule:run >> /dev/null 2>&1"
( crontab -u www-data -l 2>/dev/null | grep -v 'artisan schedule:run' || true; echo "$CRON_LINE" ) | crontab -u www-data -

echo "==> Frontend"
cd "$APP_DIR/front_end"
DOMAIN="$(grep '^APP_URL=' "$APP_DIR/backend/.env" | cut -d/ -f3)"
npm ci --no-audit --no-fund
VITE_BACKEND_API_URL="https://$DOMAIN/api" npm run build

systemctl reload php8.3-fpm nginx
echo "==> Done: https://$DOMAIN"
