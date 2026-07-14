#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/concessionaria/app}"

cd "$APP_DIR"

if [ ! -f ".env.production" ]; then
  echo "Erro: .env.production nao encontrado em $APP_DIR" >&2
  exit 1
fi

docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
