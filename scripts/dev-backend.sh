#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"

cd "${ROOT_DIR}"
echo "→ Starting PostgreSQL (docker-compose)..."
docker-compose up -d --wait

cd "${BACKEND_DIR}"

if [[ ! -f .env ]]; then
  echo "→ Creating backend/.env from .env.example"
  cp .env.example .env
fi

echo "→ Prisma generate..."
npm run prisma:generate

echo "→ Applying migrations..."
npx prisma migrate deploy

echo "→ Seeding database..."
npm run prisma:seed

echo "→ Starting NestJS (watch mode) on http://localhost:3001"
echo "   Swagger: http://localhost:3001/api/docs"
npm run start:dev
