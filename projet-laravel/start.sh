#!/bin/bash

cat > .env << EOF
APP_NAME=Laravel
APP_ENV=production
APP_KEY=${APP_KEY}
APP_DEBUG=false
APP_URL=${APP_URL}
FRONTEND_URL=https://fma-six.vercel.app
DB_CONNECTION=pgsql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
SANCTUM_STATEFUL_DOMAINS=fma-six.vercel.app
SESSION_DOMAIN=fma-six.vercel.app
EOF

php artisan config:clear
php artisan serve --host=0.0.0.0 --port=10000