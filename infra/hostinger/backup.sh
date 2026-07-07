#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/concessionaria/app}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/concessionaria/backups}"
UPLOADS_DIR="${UPLOADS_DIR_HOST:-/opt/concessionaria/storage/uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-5}"

cd "$APP_DIR"

if [ ! -f ".env.production" ]; then
  echo "Erro: .env.production nao encontrado em $APP_DIR" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ".env.production"
set +a

mkdir -p "$BACKUP_ROOT/db" "$BACKUP_ROOT/uploads"

TIMESTAMP="$(date +%Y-%m-%d-%H%M%S)"
DB_BACKUP="$BACKUP_ROOT/db/concessionaria-db-$TIMESTAMP.sql.gz"
UPLOADS_BACKUP="$BACKUP_ROOT/uploads/concessionaria-uploads-$TIMESTAMP.tar.gz"

echo "Gerando backup do banco..."
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges \
  | gzip -9 > "$DB_BACKUP"

chmod 600 "$DB_BACKUP"
echo "Backup do banco criado: $DB_BACKUP"

echo "Gerando backup dos uploads..."
tar -czf "$UPLOADS_BACKUP" -C "$UPLOADS_DIR" .
chmod 600 "$UPLOADS_BACKUP"
echo "Backup dos uploads criado: $UPLOADS_BACKUP"

find "$BACKUP_ROOT/db" -type f -name "concessionaria-db-*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_ROOT/uploads" -type f -name "concessionaria-uploads-*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo "Retencao aplicada: $RETENTION_DAYS dia(s)."
