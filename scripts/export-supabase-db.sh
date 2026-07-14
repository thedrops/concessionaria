#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPORT_DIR="${EXPORT_DIR:-$ROOT_DIR/backups/supabase}"
ENV_FILE="${ENV_FILE:-}"
SCHEMA_NAME="${SCHEMA_NAME:-public}"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "Erro: pg_dump nao encontrado. Instale o cliente PostgreSQL antes de continuar." >&2
  echo "Ubuntu/Debian: sudo apt-get install postgresql-client" >&2
  exit 1
fi

if [ -n "$ENV_FILE" ]; then
  if [ ! -f "$ENV_FILE" ]; then
    echo "Erro: ENV_FILE informado, mas arquivo nao existe: $ENV_FILE" >&2
    exit 1
  fi

  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

SUPABASE_DATABASE_URL="${SUPABASE_DATABASE_URL:-${DATABASE_URL:-}}"

if [ -z "$SUPABASE_DATABASE_URL" ]; then
  echo "Erro: SUPABASE_DATABASE_URL nao configurada." >&2
  echo "Use:" >&2
  echo "  SUPABASE_DATABASE_URL='postgresql://postgres.xxx:SENHA@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require' $0" >&2
  echo "" >&2
  echo "Ou coloque SUPABASE_DATABASE_URL em um arquivo e execute:" >&2
  echo "  ENV_FILE=.env.supabase $0" >&2
  exit 1
fi

if [[ "$SUPABASE_DATABASE_URL" != *"sslmode="* ]]; then
  if [[ "$SUPABASE_DATABASE_URL" == *"?"* ]]; then
    SUPABASE_DATABASE_URL="${SUPABASE_DATABASE_URL}&sslmode=require"
  else
    SUPABASE_DATABASE_URL="${SUPABASE_DATABASE_URL}?sslmode=require"
  fi
fi

MASKED_DATABASE_URL="$(printf '%s' "$SUPABASE_DATABASE_URL" | sed -E 's#(postgresql://[^:]+:)[^@]+@#\1********@#')"

mkdir -p "$EXPORT_DIR"

TIMESTAMP="$(date +%Y-%m-%d-%H%M%S)"
OUTPUT_FILE="$EXPORT_DIR/supabase-${SCHEMA_NAME}-${TIMESTAMP}.dump"

echo "Exportando schema '$SCHEMA_NAME' do Supabase..."
echo "Conexao: $MASKED_DATABASE_URL"

if command -v pg_isready >/dev/null 2>&1; then
  if ! pg_isready --dbname="$SUPABASE_DATABASE_URL" >/dev/null 2>&1; then
    echo "Erro: nao foi possivel conectar ao banco do Supabase." >&2
    echo "Verifique usuario, senha, host, porta, allowlist/firewall e se a URL tem sslmode=require." >&2
    exit 1
  fi
fi

pg_dump "$SUPABASE_DATABASE_URL" \
  --schema="$SCHEMA_NAME" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --verbose \
  --file="$OUTPUT_FILE"

chmod 600 "$OUTPUT_FILE"

echo ""
echo "Dump criado:"
echo "  $OUTPUT_FILE"
echo ""
echo "Para restaurar no banco da VPS Hostinger:"
echo "  pg_restore --clean --if-exists --no-owner --no-privileges --dbname='postgresql://USUARIO:SENHA@HOST:5432/BANCO?schema=public' '$OUTPUT_FILE'"
echo ""
echo "Depois da restauracao, execute no projeto apontando para o novo banco:"
echo "  npx prisma migrate deploy"
