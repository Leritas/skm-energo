# Frontend — Nuxt SSR

Публичная часть сайта SKM-Energo и админ-панель (`/admin`) на **Nuxt 4** с server-side rendering.

## Назначение

- **Публичный сайт** — каталог, новости, контакты, корзина, личный кабинет (по мере реализации roadmap)
- **Админка** (`/admin`) — управление контентом, заказами, пользователями (этап 4+)

## Стек

| | |
|---|---|
| Framework | Nuxt 4.4 |
| UI | Vue 3.5, Nuxt UI v4, Tailwind CSS v4 |
| State | Pinia |
| Utils | VueUse |
| Storybook | 10.4 (standalone, `@storybook/vue3-vite`) |
| Язык | TypeScript |

## Команды

```bash
npm install          # установка зависимостей (+ nuxt prepare через postinstall)
npm run dev          # dev-сервер → http://localhost:3000
npm run build        # production-сборка
npm run preview      # preview production-сборки
npm run storybook    # Storybook → http://localhost:6006
npm run build-storybook
```

## Переменные окружения

```bash
cp .env.example .env
```

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `NUXT_PUBLIC_API_BASE` | Base URL NestJS API | `http://localhost:3001/api` |
| `NUXT_PUBLIC_SITE_URL` | Канонический URL сайта (sitemap) | `https://skmenergo.ru` |

## Дизайн-система

White-first B2B-стиль. Акцентные цвета из логотипа (`public/logo.jpg`):

| Token | Light | Роль |
|-------|-------|------|
| `accent-500` | `#E85D04` | Primary CTA, active nav |
| `accent-300` | `#FDBA74` | Hover, focus |
| `neutral-*` | gray scale | Фон, текст, borders |
| `brand-purple-950` | `#2E1065` | Dark theme (токены, toggle позже) |

Токены заданы в `app/assets/css/main.css` и `app/app.config.ts`.

## Структура

```
frontend/
├── app/
│   ├── assets/css/main.css     # Tailwind + Nuxt UI + design tokens
│   ├── app.config.ts             # Nuxt UI theme (accent, neutral)
│   ├── constants/
│   │   ├── navigation.ts         # MAIN_NAV, CATALOG_TREE
│   │   └── site.ts               # контакты, tagline
│   ├── components/
│   │   ├── ui/                   # AppButton, AppCard, AppBreadcrumbs, …
│   │   ├── layout/               # AppHeader, AppFooter, AppMobileNav, …
│   │   └── home/                 # HomeHero, HomeProductDirections, …
│   ├── layouts/default.vue
│   └── pages/
│       ├── index.vue             # Главная
│       ├── about.vue
│       ├── services.vue
│       ├── contacts.vue
│       ├── catalog/index.vue
│       ├── news/index.vue
│       └── admin/index.vue
├── .storybook/                   # Storybook config
├── public/
│   ├── favicon.ico
│   ├── logo.jpg
│   └── robots.txt
└── nuxt.config.ts
```

## Маршруты

| Путь | Описание | SSR |
|------|----------|-----|
| `/` | Главная (hero, направления, about-teaser) | ✅ |
| `/about` | О компании | ✅ |
| `/services` | Услуги | ✅ |
| `/contacts` | Контакты + форма (UI) | ✅ |
| `/catalog` | Каталог (заглушка + дерево категорий) | ✅ |
| `/news` | Новости (заглушка) | ✅ |
| `/admin` | Админ-панель (заглушка) | — |

## Модули Nuxt

| Модуль | Назначение |
|--------|------------|
| `@nuxt/ui` | UI-кит (кнопки, модалки, формы) |
| `@pinia/nuxt` | State management |
| `@vueuse/nuxt` | Composables |
| `@nuxtjs/sitemap` | `/sitemap.xml` |

## SEO

- Глобальные meta в `nuxt.config.ts` (`lang="ru"`, title, description)
- `useSeoMeta()` на каждой публичной странице
- `robots.txt` + ссылка на sitemap
- `@nuxtjs/sitemap` — auto-discovery страниц из `app/pages`

## Storybook

Компоненты UI-kit документированы в Storybook (stories рядом с компонентами в `app/components/ui/`):

```bash
npm run storybook
```

Stories: `AppButton` (variants + dark theme), `AppCard`, `AppBreadcrumbs`, `AppContainer`.

> `@nuxtjs/storybook` пока несовместим с Nuxt 4 — используется standalone Storybook 10 + `@storybook/vue3-vite` (совместим с Vite 7).

## Запуск (локально)

```bash
cp .env.example .env
npm install
npm run dev
```

Открыть http://localhost:3000

## Node.js

Nuxt 4 официально требует Node 22+. На Node 20 проект может работать с предупреждениями `EBADENGINE`. Рекомендуется обновить Node до 22 LTS.

## Дальнейшая разработка

См. [docs/roadmap.md](../docs/roadmap.md):

- **Этап 2** — Prisma, seed, API каталога
- **Этап 4** — полноценная админка `/admin`
- **Этап 5** — публичный каталог `/catalog/[...slug]`, `/product/[slug]`
