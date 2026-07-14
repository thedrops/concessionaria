#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/concessionaria}"

mkdir -p "$APP_ROOT/app"
mkdir -p "$APP_ROOT/postgres"
mkdir -p "$APP_ROOT/storage/uploads/cars"
mkdir -p "$APP_ROOT/storage/uploads/carousel"
mkdir -p "$APP_ROOT/backups/db"
mkdir -p "$APP_ROOT/backups/uploads"

chown -R "$USER:$USER" "$APP_ROOT"
chmod -R 750 "$APP_ROOT"
chmod -R 755 "$APP_ROOT/storage/uploads"

echo "Diretorios preparados em $APP_ROOT"
echo "Proximo passo: copiar o projeto para $APP_ROOT/app e criar $APP_ROOT/app/.env.production"
