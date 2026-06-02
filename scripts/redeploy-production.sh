#!/bin/bash
# Rebuild & restart production stack (ไม่ต้องมี npm บน host)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "❌ ไม่พบ .env — รัน: cp .env.production.example .env && nano .env"
  exit 1
fi

echo "=== Rebuild frontend + backend (Docker) ==="
docker compose -f docker-compose.prod.yml build frontend backend --no-cache

echo "=== Restart services ==="
docker compose -f docker-compose.prod.yml up -d frontend backend nginx 2>/dev/null || \
docker compose -f docker-compose.prod.yml up -d frontend backend

echo "=== Health checks ==="
sleep 8
curl -sf http://127.0.0.1:3001/api/v1/health && echo "" || echo "⚠ backend health failed"
curl -sI http://127.0.0.1:80/ | head -3 || true
curl -sI "https://ddcomputersamrong.com/api/v1/health" 2>/dev/null | head -5 || true

echo "=== Done ==="
