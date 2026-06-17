#!/usr/bin/env bash
set -euo pipefail

DOMAIN="chikatech.com"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root."
  exit 1
fi

apt-get update
apt-get install -y certbot python3-certbot-nginx

certbot --nginx \
  --non-interactive \
  --agree-tos \
  --redirect \
  --register-unsafely-without-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

systemctl reload nginx
certbot renew --dry-run

echo "HTTPS is enabled for $DOMAIN and www.$DOMAIN."
