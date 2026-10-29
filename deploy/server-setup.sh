#!/usr/bin/env bash
# EinStein — one-time server setup for a fresh Ubuntu 24.04 VPS (Strato, Hetzner, ...).
# Installs: firewall, fail2ban, Nginx, PHP 8.3, Node, Laravel backend, React frontend, HTTPS.
#
# Usage (as root, on the server):
#   bash server-setup.sh api.example.de admin@example.de
#
# Before running: the domain's DNS "A" record must already point to this server's IP.

set -euo pipefail

DOMAIN="${1:-}"
ADMIN_EMAIL="${2:-}"
REPO="git@github.com:einstein-digital-it/einstein-dienstleistung.git"
BRANCH="${BRANCH:-release/android}"   # branch with the latest changes; switch to main once merged
APP_DIR="/var/www/einstein"

if [[ -z "$DOMAIN" || -z "$ADMIN_EMAIL" ]]; then
  echo "Usage: bash server-setup.sh <domain> <admin-email>"
  exit 1
fi

step() { echo; echo "==> $*"; }

# ---------------------------------------------------------------- 1. System + security
step "Updating system"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y ufw fail2ban unattended-upgrades git curl unzip sqlite3 \
  nginx certbot python3-certbot-nginx \
  php8.3-fpm php8.3-cli php8.3-sqlite3 php8.3-mbstring php8.3-xml php8.3-curl \
  php8.3-zip php8.3-bcmath php8.3-intl composer

# Node: keep an existing install (e.g. NodeSource, which already ships npm)
if ! command -v node >/dev/null 2>&1; then
  apt-get install -y nodejs npm
fi
if ! command -v npm >/dev/null 2>&1; then
  apt-get install -y npm
fi

step "Firewall: allow only SSH + web"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
systemctl enable --now fail2ban

step "SSH: key login only (if a key is installed)"
if [[ -s /root/.ssh/authorized_keys ]]; then
  cat > /etc/ssh/sshd_config.d/99-einstein.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF
  systemctl reload ssh || systemctl reload sshd
  echo "Password login disabled."
else
  echo "WARNING: no SSH key in /root/.ssh/authorized_keys — password login left ON."
fi

# ---------------------------------------------------------------- 2. Get the code
step "GitHub deploy key"
mkdir -p /root/.ssh && chmod 700 /root/.ssh
if [[ ! -f /root/.ssh/einstein_deploy ]]; then
  ssh-keygen -t ed25519 -N "" -C "einstein-server" -f /root/.ssh/einstein_deploy >/dev/null
fi
echo
echo "------------------------------------------------------------------"
echo "Add this key on GitHub:"
echo "  Repo > Settings > Deploy keys > Add deploy key (read-only)"
echo
cat /root/.ssh/einstein_deploy.pub
echo "------------------------------------------------------------------"
read -rp "Press Enter after you added the key on GitHub... "

export GIT_SSH_COMMAND="ssh -i /root/.ssh/einstein_deploy -o StrictHostKeyChecking=accept-new"
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" pull --ff-only
else
  git clone --depth 1 -b "$BRANCH" "$REPO" "$APP_DIR"
fi

# ---------------------------------------------------------------- 3. Laravel backend
step "Backend (Laravel)"
cd "$APP_DIR/backend"
composer install --no-dev --optimize-autoloader --no-interaction

if [[ ! -f .env ]]; then
  cp .env.example .env
  sed -i \
    -e "s|^APP_ENV=.*|APP_ENV=production|" \
    -e "s|^APP_DEBUG=.*|APP_DEBUG=false|" \
    -e "s|^APP_URL=.*|APP_URL=https://$DOMAIN|" \
    -e "s|^LOG_LEVEL=.*|LOG_LEVEL=warning|" \
    .env
  php artisan key:generate --force
fi

# MCP endpoint for Claude: create a random secret once
if ! grep -q '^MCP_SECRET=.\+' .env; then
  sed -i '/^MCP_SECRET=/d' .env
  echo "MCP_SECRET=$(openssl rand -hex 24)" >> .env
fi
MCP_SECRET="$(grep '^MCP_SECRET=' .env | cut -d= -f2)"

touch database/database.sqlite
php artisan migrate --force
php artisan storage:link || true

# Admin account with a random password (the demo seeder uses "password" — never run it in production)
ADMIN_PW="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-16)"
php artisan tinker --execute="
\$u = App\Models\User::firstOrNew(['email' => '$ADMIN_EMAIL']);
\$u->name = \$u->name ?: 'Admin';
\$u->password = Illuminate\Support\Facades\Hash::make('$ADMIN_PW');
\$u->role = 'admin';
\$u->save();
"

php artisan config:cache
php artisan route:cache
chown -R www-data:www-data storage bootstrap/cache database
chmod -R ug+rw storage bootstrap/cache database

# ---------------------------------------------------------------- 4. React frontend
step "Frontend (React)"
cd "$APP_DIR/front_end"
npm ci --no-audit --no-fund
VITE_BACKEND_API_URL="https://$DOMAIN/api" npm run build

# ---------------------------------------------------------------- 5. Nginx + HTTPS
step "Nginx"
cat > /etc/nginx/sites-available/einstein <<EOF
server {
    listen 80;
    server_name $DOMAIN;
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
ln -sf /etc/nginx/sites-available/einstein /etc/nginx/sites-enabled/einstein
# Other sites may live on this server: leave their configs (and "default") alone.
if ! nginx -t; then
  echo "nginx config test failed - removing the EinStein site again so the other sites keep running."
  rm -f /etc/nginx/sites-enabled/einstein
  exit 1
fi
systemctl reload nginx

step "HTTPS certificate (Let's Encrypt)"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect

# ---------------------------------------------------------------- Done
step "Check"
curl -s "https://$DOMAIN/api/health" || true
echo
echo "=================================================================="
echo " DONE"
echo " Website : https://$DOMAIN"
echo " API     : https://$DOMAIN/api   <- put this in the app"
echo " Admin   : $ADMIN_EMAIL"
echo " Password: $ADMIN_PW   (save it now — it is not stored anywhere)"
echo
echo " Claude connector (MCP) — add in Claude: Settings > Connectors > Add custom connector"
echo "   https://$DOMAIN/api/mcp/$MCP_SECRET"
echo "   Keep this link private: anyone with it can manage the site."
echo "=================================================================="
