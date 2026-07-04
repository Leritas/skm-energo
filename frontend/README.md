# Frontend — Nuxt SSR

Публичная часть сайта SKM-Energo и админ-панель (`/admin`) на **Nuxt 4** с server-side rendering.

## Назначение

- **Публичный сайт** — каталог, новости, контакты, корзина, личный кабинет (по мере реализации roadmap)
- **Админка** (`/admin`) — управление контентом, заказами, пользователями (этап 4+)

## Стек

| | |
|---|---|
| Framework | Nuxt 4.4 |
| UI | Vue 3.5, Tailwind CSS |
| State | Pinia |
| Utils | VueUse |
| Язык | TypeScript |

## Команды

```bash
npm install          # установка зависимостей (+ nuxt prepare через postinstall)
npm run dev          # dev-сервер → http://localhost:3000
npm run build        # production-сборка
npm run preview      # preview production-сборки
npm run generate     # статическая генерация (не используется — SSR mode)
```

## Переменные окружения

```bash
cp .env.example .env
```

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `NUXT_PUBLIC_API_BASE` | Base URL NestJS API | `http://localhost:3001/api` |

Доступ в коде: `useRuntimeConfig().public.apiBase`.

## Структура

```
frontend/
├── app/
│   ├── app.vue                 # Корневой компонент (layout + page)
│   ├── layouts/
│   │   └── default.vue         # Header + main + footer
│   ├── pages/
│   │   ├── index.vue           # Главная (SSR fetch /api/health)
│   │   ├── catalog/
│   │   │   └── index.vue       # Каталог (заглушка)
│   │   └── admin/
│   │       └── index.vue       # Админка (заглушка, layout: false)
│   └── components/
│       ├── AppHeader.vue
│       └── AppFooter.vue
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── nuxt.config.ts              # SSR, modules, runtimeConfig, SEO meta
├── .env.example
└── package.json
```

## Маршруты

| Путь | Описание | SSR |
|------|----------|-----|
| `/` | Главная | ✅ |
| `/catalog` | Каталог (заглушка) | ✅ |
| `/admin` | Админ-панель (заглушка) | — (client-only layout) |

## SSR

SSR включён явно в `nuxt.config.ts`:

```ts
ssr: true
```

Главная страница (`app/pages/index.vue`) при серверном рендеринге вызывает:

```
GET {NUXT_PUBLIC_API_BASE}/health
```

и отображает статус backend. Это проверка связи frontend ↔ API при каждом запросе.

## Модули Nuxt

| Модуль | Назначение |
|--------|------------|
| `@pinia/nuxt` | State management (корзина, auth — этапы 3–6) |
| `@vueuse/nuxt` | Composables (useFetch, useStorage, …) |
| `@nuxtjs/tailwindcss` | Utility-first CSS |

## SEO

Глобальные meta заданы в `nuxt.config.ts`:

- `lang="ru"`
- title: «СКМ-Энергосервис»
- description: поставка высоковольтных компонентов

На страницах — `useSeoMeta()` (см. `catalog/index.vue`, `admin/index.vue`).

## Запуск (локально)

Backend должен быть запущен на порту 3001 (см. [backend/README.md](../backend/README.md)).

```bash
cp .env.example .env
npm install
npm run dev
```

Открыть http://localhost:3000 — на главной должен отображаться статус API `ok`.

## Node.js

Nuxt 4 официально требует Node 22+. На Node 20 проект может работать с предупреждениями `EBADENGINE`. Рекомендуется обновить Node до 22 LTS.

## Дальнейшая разработка

См. [docs/roadmap.md](../docs/roadmap.md):

- **Этап 1** — layout, страницы about/services/contacts, навигация
- **Этап 4** — полноценная админка `/admin`
- **Этап 5** — публичный каталог `/catalog/[...slug]`, `/product/[slug]`
