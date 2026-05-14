#!/usr/bin/env bash
# Container entrypoint: run database migrations, then start uvicorn.
# Failing fast on a migration error is intentional — better to refuse to boot
# than to serve traffic against a stale schema.
set -euo pipefail

echo "[entrypoint] Running Alembic migrations against ${DATABASE_URL%@*}@…"
alembic upgrade head

echo "[entrypoint] Starting uvicorn on port ${PORT:-8000}"
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --proxy-headers \
  --forwarded-allow-ips='*'
