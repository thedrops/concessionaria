#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/concessionaria/app}"
DUMP_FILE="${1:-}"

if [ -z "$DUMP_FILE" ]; then
  echo "Uso: $0 /caminho/para/supabase-public.dump" >&2
  exit 1
fi

if [ ! -f "$DUMP_FILE" ]; then
  echo "Erro: dump nao encontrado: $DUMP_FILE" >&2
  exit 1
fi

cd "$APP_DIR"

if [ ! -f ".env.production" ]; then
  echo "Erro: .env.production nao encontrado em $APP_DIR" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ".env.production"
set +a

cat "$DUMP_FILE" | docker compose -f docker-compose.prod.yml exec -T db \
  pg_restore --clean --if-exists --no-owner --no-privileges \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB"

docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

echo "Restore concluido."
