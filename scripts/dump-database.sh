#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups/db}"
RETENTION_DAYS="${RETENTION_DAYS:-5}"
ENV_FILE="${ENV_FILE:-}"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "Erro: pg_dump nao encontrado. Instale o cliente PostgreSQL antes de continuar." >&2
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
elif [ -z "${DATABASE_URL:-}" ]; then
  for candidate in "$ROOT_DIR/.env.production" "$ROOT_DIR/.env"; do
    if [ -f "$candidate" ]; then
      set -a
      # shellcheck disable=SC1090
      . "$candidate"
      set +a
      break
    fi
  done
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Erro: DATABASE_URL nao configurada." >&2
  echo "Use: DATABASE_URL='postgresql://user:pass@host:5432/db?schema=public' $0" >&2
  echo "Ou informe: ENV_FILE=/caminho/.env.production $0" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y-%m-%d-%H%M%S)"
OUTPUT_FILE="$BACKUP_DIR/concessionaria-db-$TIMESTAMP.sql.gz"

echo "Iniciando dump do banco..."
pg_dump "$DATABASE_URL" \
  --no-owner \
  --no-privileges \
  --format=plain \
  | gzip -9 > "$OUTPUT_FILE"

chmod 600 "$OUTPUT_FILE"

echo "Dump criado: $OUTPUT_FILE"

if [ "$RETENTION_DAYS" -gt 0 ]; then
  find "$BACKUP_DIR" \
    -type f \
    -name "concessionaria-db-*.sql.gz" \
    -mtime +"$RETENTION_DAYS" \
    -delete

  echo "Retencao aplicada: backups com mais de $RETENTION_DAYS dia(s) foram removidos."
fi
