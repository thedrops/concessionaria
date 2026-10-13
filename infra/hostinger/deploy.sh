#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/concessionaria/app}"

cd "$APP_DIR"

if [ ! -f ".env.production" ]; then
  echo "Erro: .env.production nao encontrado em $APP_DIR" >&2
  exit 1
fi

if ! grep -qE '^DATABASE_URL=.+$' .env.production; then
  echo "Erro: DATABASE_URL ausente em $APP_DIR/.env.production" >&2
  exit 1
fi

docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

for attempt in $(seq 1 30); do
  if docker compose -f docker-compose.prod.yml exec -T app \
    node -e 'fetch("http://127.0.0.1:3000/", { signal: AbortSignal.timeout(5000) }).then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))' \
    >/dev/null 2>&1; then
    docker compose -f docker-compose.prod.yml ps
    exit 0
  fi
  sleep 3
done

echo "Aplicacao nao respondeu com sucesso apos o deploy." >&2
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=80 app caddy >&2
exit 1
