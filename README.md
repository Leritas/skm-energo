# SKM-Energo

Монорепозиторий нового сайта [skm-energo.ru](https://skmenergo.ru) (ООО «СКМ-Энергосервис»).

Заменяет устаревший сайт 2016 года — статический HTML-каталог с PHP-формами — на современную B2B e-commerce платформу: каталог высоковольтных компонентов, корзина, заказы, личный кабинет и админ-панель.

## О проекте

| | |
|---|---|
| **Компания** | ООО «СКМ-Энергосервис» |
| **Домен** | skm-energo.ru / skm-energoservice.ru |
| **Продукция** | Предохранители, разъединители, контакторы, графитовые щётки и др. |
| **Текущий этап** | 0 — фундамент монорепы (см. [roadmap](docs/roadmap.md)) |

Контент со старого сайта (~747 страниц) **не мигрируется** — используется только как референс. Данные добавляются через админ-панель.

## Архитектура

```
Браузер
   │
   ├──► frontend/  Nuxt SSR (порт 3000)
   │       ├── публичная часть: /, /catalog, …
   │       └── админка: /admin
   │
   └──► backend/   NestJS REST API (порт 3001, prefix /api)
           │
           └──► PostgreSQL 16 (порт 5433→5432, Docker)
```

Shared types: `skm-specs/` (`@skm/specs`) — permissions, auth DTO.

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | Nuxt 4, Vue 3, TypeScript, Pinia, VueUse, Tailwind CSS |
| Backend | NestJS 11, Prisma 6, class-validator, Swagger |
| БД | PostgreSQL 16 |
| Dev | Docker Compose |

## Структура репозитория

```
skm-energo/
├── frontend/           # Nuxt SSR + админка (/admin)
├── backend/            # NestJS REST API
├── docs/
│   ├── roadmap.md      # Этапы разработки (0–11)
│   └── db-draft.sql    # Черновик схемы БД (reference, не migration source)
├── docker-compose.yml  # PostgreSQL для локальной разработки
├── .env.example        # Пример переменных окружения
└── skm-proj.sql        # Исходный черновик БД (дубликат docs/db-draft.sql)
```

## Требования

- **Node.js** 20+ (рекомендуется 22+ — Nuxt 4 официально требует Node 22+)
- **npm** 10+
- **Docker** + **Docker Compose** (`docker-compose`, не `docker compose`)

## Быстрый старт

### 1. Клонировать и поднять PostgreSQL

```bash
git clone <repo-url> skm-energo
cd skm-energo
docker-compose up -d
```

Проверка: `docker-compose ps` — контейнер `skm-energo-postgres` в статусе `running`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run start:dev
```

| URL | Назначение |
|-----|------------|
| http://localhost:3001/api/health | Health check |
| http://localhost:3001/api/docs | Swagger UI |

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Сайт: http://localhost:3000

Главная страница при SSR запрашивает `/api/health` и отображает статус backend.

## Переменные окружения

Каждый пакет имеет свой `.env.example`. Подробности:

- [frontend/.env.example](frontend/.env.example) — `NUXT_PUBLIC_API_BASE`
- [backend/.env.example](backend/.env.example) — `PORT`, `CORS_ORIGIN`, `DATABASE_URL`

## Документация

| Документ | Описание |
|----------|----------|
| [docs/roadmap.md](docs/roadmap.md) | Полный план: этапы, оценки, схема БД |
| [docs/db-draft.sql](docs/db-draft.sql) | Черновик SQL-схемы для Prisma (этап 2) |
| [frontend/README.md](frontend/README.md) | Frontend: команды, структура, SSR |
| [backend/README.md](backend/README.md) | Backend: API, Prisma, эндпоинты |

## Roadmap (кратко)

| Этап | Содержание | Статус |
|------|------------|--------|
| 0 | Монорепа, Nuxt SSR, NestJS, PostgreSQL, docs | ✅ |
| 1 | UI-каркас: layout, about, services, contacts | — |
| 2 | Prisma schema, миграции, seed | — |
| 3 | Auth (JWT Bearer, RBAC `@skm/specs` + динамические роли) | — |
| 4 | Админка: CRUD каталога, новости, медиа | — |
| 5–10 | Каталог, корзина, заказы, ЛК, production | — |
| 11 | Онлайн-оплата (v2) | — |

Подробнее — [docs/roadmap.md](docs/roadmap.md).

## Лицензия

Proprietary — ООО «СКМ-Энергосервис». Все права защищены.
