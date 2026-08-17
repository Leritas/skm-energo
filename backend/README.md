# Backend — NestJS API

REST API для e-commerce платформы SKM-Energo: каталог, заказы, пользователи, админка.

## Назначение

Backend обслуживает:

- **Frontend (Nuxt SSR)** — публичные данные каталога, корзина, auth
- **Админку (`/admin`)** — CRUD контента, управление заказами (JWT + permissions / `hasAccessToAdmin`)

Frontend не обращается к БД напрямую — только через этот API.

## Стек

| | |
|---|---|
| Framework | NestJS 11 |
| ORM | Prisma 6 |
| БД | PostgreSQL 16 |
| Validation | class-validator, class-transformer |
| Docs | Swagger (OpenAPI) |
| Config | @nestjs/config (.env) |

## Команды

```bash
npm install
cp .env.example .env
npx prisma generate

npm run start:dev      # dev с hot-reload → http://localhost:3001
npm run start:debug    # dev + debugger
npm run build          # компиляция TypeScript → dist/
npm run start:prod     # production: node dist/main

npm run lint           # ESLint
npm run format         # Prettier
npm run test           # unit-тесты (Jest)
npm run test:e2e       # e2e-тесты
```

### Prisma

```bash
npm run prisma:generate   # генерация @prisma/client после изменения schema
npm run prisma:migrate    # создание/применение миграций (этап 2)
npm run prisma:studio     # GUI для просмотра данных → http://localhost:5555
```

> **Текущее состояние:** auth-модели User/Role/UserRole/RefreshToken + HealthCheck.
> Полная схема каталога — **этап 2** по [docs/db-draft.sql](../docs/db-draft.sql).
> Auth design: [docs/superpowers/specs/2026-07-21-auth-roles-permissions-design.md](../docs/superpowers/specs/2026-07-21-auth-roles-permissions-design.md).

## Переменные окружения

```bash
cp .env.example .env
```

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт HTTP-сервера | `3001` |
| `CORS_ORIGIN` | Allowed origin для CORS | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://skm:skm@localhost:5433/skm_energo?schema=public` |
| `JWT_ACCESS_SECRET` | Secret for access JWT | (required) |
| `JWT_REFRESH_SECRET` | Reserved for refresh signing (tokens are opaque hashed in DB) | (required) |
| `JWT_ACCESS_TTL` | Access token TTL | `15m` |
| `JWT_REFRESH_TTL` | Refresh token TTL | `7d` |
| `SEED_ADMIN_EMAIL` | Seed admin email | `admin@skmenergo.ru` |
| `SEED_ADMIN_PASSWORD` | Seed admin password | `ChangeMeAdmin1!` |

PostgreSQL поднимается через `docker compose up -d` из корня монорепы (порт **5433** → контейнер 5432).

## API

Global prefix: **`/api`**

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api` | Hello (default NestJS controller) |
| GET | `/api/health` | Health check → `{ status, timestamp }` |
| POST | `/api/auth/register` | Public registration → role `user` |
| POST | `/api/auth/login` | Login → tokens + user |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Revoke refresh (JWT) |
| GET | `/api/auth/me` | Current user + permissions (JWT) |
| POST | `/api/users` | Create staff user (`canCreateUsers`) |
| GET/POST/PATCH/DELETE | `/api/roles` | Roles CRUD |
| PUT | `/api/users/:id/roles` | Assign roles |
| GET | `/api/docs` | Swagger UI |

Пример health check:

```bash
curl http://localhost:3001/api/health
# {"status":"ok","timestamp":"2026-07-04T12:00:00.000Z"}
```

## Структура

```
backend/
├── prisma/
│   └── schema.prisma           # Prisma schema (placeholder)
├── src/
│   ├── main.ts                 # Bootstrap: CORS, Swagger, ValidationPipe, prefix /api
│   ├── app.module.ts           # Root module
│   ├── app.controller.ts       # GET /api
│   ├── app.service.ts
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts  # GET /api/health
│   └── prisma/
│       ├── prisma.module.ts    # Global module
│       └── prisma.service.ts   # PrismaClient wrapper
├── test/
│   └── app.e2e-spec.ts
├── .env.example
└── package.json
```

## Конфигурация приложения

`src/main.ts`:

- **Global prefix** `/api` — все маршруты под `/api/*`
- **CORS** — origin из `CORS_ORIGIN`, credentials: true
- **ValidationPipe** — whitelist + transform для DTO
- **Swagger** — `/api/docs`, title «SKM-Energo API»

## Prisma

Подключение к PostgreSQL через `DATABASE_URL`. `PrismaService` — global provider, доступен во всех модулях через DI.

На этапе 0 Prisma **не подключается при старте** (lazy) — API работает без миграций. После этапа 2:

```bash
npm run prisma:migrate
```

## Запуск (локально)

```bash
# из корня монорепы
docker-compose up -d

# backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run start:dev
```

Frontend: http://localhost:3000 — см. [frontend/README.md](../frontend/README.md).

## Тестирование

```bash
npm run test          # unit
npm run test:e2e      # e2e (требует запущенного приложения)
npm run test:cov      # coverage
```

## Дальнейшая разработка

См. [docs/roadmap.md](../docs/roadmap.md):

- **Этап 2** — полная Prisma schema, миграции, seed
- **Этап 3** — JWT auth, RBAC (`@skm/specs` + динамические роли), guards
- **Этап 4+** — CRUD каталога, заказы, файлы, email

Расширения схемы БД относительно [db-draft.sql](../docs/db-draft.sql) описаны в roadmap (Manufacturer, Cart, Lead, MediaFile, …).
