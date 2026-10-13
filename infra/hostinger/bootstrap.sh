#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/concessionaria}"
DEPLOY_USER="${DEPLOY_USER:-${SUDO_USER:-$(id -un)}}"

if [ "$DEPLOY_USER" = "root" ] || ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  echo "Defina DEPLOY_USER com o usuario SSH usado pelo GitHub Actions." >&2
  exit 1
fi

DEPLOY_GROUP="$(id -gn "$DEPLOY_USER")"

mkdir -p "$APP_ROOT/app"
mkdir -p "$APP_ROOT/postgres"
mkdir -p "$APP_ROOT/storage/uploads/cars"
mkdir -p "$APP_ROOT/storage/uploads/carousel"
mkdir -p "$APP_ROOT/backups/db"
mkdir -p "$APP_ROOT/backups/uploads"

# Apenas o codigo pertence ao usuario de deploy; os volumes de dados mantem seus donos.
chown "$DEPLOY_USER:$DEPLOY_GROUP" "$APP_ROOT"
chown -R "$DEPLOY_USER:$DEPLOY_GROUP" "$APP_ROOT/app"
chmod 750 "$APP_ROOT"
chmod -R u+rwX "$APP_ROOT/app"
chmod -R 755 "$APP_ROOT/storage/uploads"

echo "Diretorios preparados em $APP_ROOT"
echo "Proximo passo: copiar o projeto para $APP_ROOT/app e criar $APP_ROOT/app/.env.production"
