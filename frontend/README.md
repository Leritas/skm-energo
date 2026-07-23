# Frontend — Nuxt SSR

Публичная часть сайта SKM-Energo и админ-панель (`/admin`) на **Nuxt 4** с server-side rendering.

## Назначение

- **Публичный сайт** — каталог, новости, контакты, корзина, личный кабинет (по мере реализации roadmap)
- **Админка** (`/admin`) — управление контентом, заказами, пользователями (этап 4+)

## Стек

| | |
|---|---|
| Framework | Nuxt 4.4 |
| UI | Vue 3.5, Nuxt UI v4 (через SKM wrappers), Tailwind CSS v4 |
| State | Pinia |
| Utils | VueUse |
| Storybook | 10.4 (standalone, `@storybook/vue3-vite`) |
| Lint | ESLint 9 + `@nuxt/eslint` + guardrail `skm-ui-kit/no-raw-nuxt-ui` |
| Язык | TypeScript |

## Команды

```bash
npm install          # установка зависимостей (+ nuxt prepare через postinstall)
npm run dev          # dev-сервер → http://localhost:3000
npm run build        # production-сборка
npm run preview      # preview production-сборки
npm run storybook    # Storybook → http://localhost:6006
npm run build-storybook
npm run lint         # ESLint (в т.ч. запрет сырых U* вне ui/)
npm run lint:fix    # ESLint --fix
```

## Переменные окружения

```bash
cp .env.example .env
```

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `NUXT_PUBLIC_API_BASE` | Base URL NestJS API | `http://localhost:3001/api` |
| `NUXT_PUBLIC_SITE_URL` | Канонический URL сайта (sitemap) | `https://skmenergo.ru` |

## SKM UI Kit

Дизайн-система проекта: тонкие `Skm*` обёртки над Nuxt UI + layout-примитивы. Spec: [docs/superpowers/specs/2026-07-13-skm-ui-kit-design.md](../docs/superpowers/specs/2026-07-13-skm-ui-kit-design.md).

### Импорт

```ts
import { SkmButton, SkmInput, SkmModal } from '@skm/components'
```

Не импортируйте `*.vue` напрямую и не тяните `presets.ts` в pages/layout — только через wrappers в `app/components/ui/`.

### Структура

```
app/components/
├── index.ts                 # public API → @skm/components
├── ui/                      # UI Kit (Storybook + wrappers)
│   ├── presets.ts           # :ui пресеты (только для ui/)
│   ├── SkmButton/
│   ├── SkmInput/
│   ├── SkmTextarea/
│   ├── SkmFormField/
│   ├── SkmPopover/
│   ├── SkmModal/
│   ├── SkmCard/
│   ├── SkmBreadcrumbs/
│   ├── SkmContainer/
│   ├── SkmSection/
│   └── SkmDesignSystem/     # Overview story
└── layout/                  # shell сайта (SkmHeader, SkmFooter, …)
```

### Правила

| ✅ Do | ❌ Don't |
|------|---------|
| `<SkmButton variant="primary">` | `<UButton>` в pages / layout / home |
| `<SkmInput variant="onBrand">` | `class="!bg-white"` на сыром `UInput` |
| `tone="brand"` на кнопках поверх `brand-purple-*` | Импорт `presets` вне `components/ui/` |
| Layout использует `Skm*` | Новые `App*` компоненты |

**Allowlist без обёртки (пока):** `UIcon`, `USlideover`.

ESLint-правило `skm-ui-kit/no-raw-nuxt-ui` запрещает `UButton` / `UInput` / `UTextarea` / `UFormField` / `UPopover` / `UModal` / `UCard` / `UContainer` / `UBreadcrumb` вне `app/components/ui/`.

### Токены

White-first B2B. Акцент из логотипа (`public/logo.jpg`):

| Token | Light | Роль |
|-------|-------|------|
| `accent-500` | `#E85D04` | Primary CTA, active nav |
| `accent-300` | `#FDBA74` | Hover, focus |
| `neutral-*` | gray scale | Фон, текст, borders |
| `brand-purple-950` | `#2E1065` | Brand-поверхности (секции, onBrand) |

Токены: `app/assets/css/main.css`, тема Nuxt UI: `app/app.config.ts` (`primary: accent`).

## Структура приложения

```
frontend/
├── app/
│   ├── assets/css/main.css
│   ├── app.config.ts
│   ├── constants/
│   ├── components/           # ui/ + layout/ + home/ → @skm/components
│   ├── layouts/default.vue
│   └── pages/
├── eslint.config.mjs
├── eslint-rules/skm-ui-kit.mjs
├── .storybook/
├── public/
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
| `@nuxt/eslint` | ESLint flat config |
| `@nuxt/ui` | UI primitives (только внутри `components/ui/`) |
| `@pinia/nuxt` | State management |
| `@vueuse/nuxt` | Composables |
| `@nuxtjs/sitemap` | `/sitemap.xml` |

## SEO

- Глобальные meta в `nuxt.config.ts` (`lang="ru"`, title, description)
- `useSeoMeta()` на каждой публичной странице
- `robots.txt` + ссылка на sitemap
- `@nuxtjs/sitemap` — auto-discovery страниц из `app/pages`

## Storybook

```bash
npm run storybook
```

Навигация: **SKM Design System** → Overview + per-component stories (`SkmButton`, `SkmInput`, `SkmPopover`, `SkmModal`, …).

> Standalone Storybook 10 + `@storybook/vue3-vite` + `@nuxt/ui/vite` (без Nuxt runtime).

## Запуск (локально)

```bash
cp .env.example .env
npm install
npm run dev
```

Открыть http://localhost:3000

## Node.js

Nuxt 4 официально требует Node 22+. На Node 20 проект может работать; для ESLint добавлен полифилл `Object.groupBy` (`eslint-node20-polyfill.mjs`). Рекомендуется Node 22 LTS.

## Дальнейшая разработка

См. [docs/roadmap.md](../docs/roadmap.md):

- **Этап 2** — Prisma, seed, API каталога
- **Этап 4** — полноценная админка `/admin`
- **Этап 5** — публичный каталог `/catalog/[...slug]`, `/product/[slug]`
