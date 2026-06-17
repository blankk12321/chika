#!/usr/bin/env bash
set -euo pipefail

DOMAIN="chikatech.com"
APP_DIR="/var/www/act-site"
APP_USER="www-data"
PORT="3000"
FEISHU_WEBHOOK_URL=""
FEISHU_WEBHOOK_SECRET=""

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root."
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl gnupg nginx unzip

if ! command -v node >/dev/null 2>&1 || ! node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 18 ? 0 : 1)"; then
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update
  apt-get install -y nodejs
fi

mkdir -p "$APP_DIR"
unzip -o /tmp/act-site.zip -d "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

cat > "$APP_DIR/.env" <<ENV
PORT=$PORT
FEISHU_WEBHOOK_URL=$FEISHU_WEBHOOK_URL
FEISHU_WEBHOOK_SECRET=$FEISHU_WEBHOOK_SECRET
ENV
chmod 600 "$APP_DIR/.env"
chown "$APP_USER:$APP_USER" "$APP_DIR/.env"

cat > /etc/systemd/system/act-site.service <<SERVICE
[Unit]
Description=ACT independent website
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
EnvironmentFile=$APP_DIR/.env
ExecStart=/usr/bin/node $APP_DIR/server.js
Restart=always
RestartSec=5
User=$APP_USER
Group=$APP_USER

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable --now act-site

cat > /etc/nginx/sites-available/act-site <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/act-site /etc/nginx/sites-enabled/act-site
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

curl -fsS "http://127.0.0.1:$PORT/healthz"
echo
echo "HTTP is ready for $DOMAIN and www.$DOMAIN."
