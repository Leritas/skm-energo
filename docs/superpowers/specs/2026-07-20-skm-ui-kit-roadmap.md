# SKM UI Kit Roadmap — Domain Components

**Date:** 2026-07-20  
**Status:** Draft — proposed  
**Depends on:** [SKM UI Kit Design Spec](./2026-07-13-skm-ui-kit-design.md) (Phase 1–3 ✅)  
**Aligns with:** [Product roadmap](../roadmap.md) этапы 4–8

---

## 1. Цель

После базы (`SkmButton`, forms, overlays, layout primitives) нужен **следующий слой UI Kit**: доменные компоненты B2B-каталога и e-commerce SKM-Энергосервис — не generic marketing-карточки с главной, а сущности каталога, новостей, корзины и ЛК.

Этот документ:

1. Фиксирует, что **уже есть** (foundation)
2. Предсказывает компоненты по сценариям продукта
3. Разделяет **UI Kit** vs **layout/page** vs **admin-only**
4. Даёт порядок внедрения, привязанный к этапам product roadmap

---

## 2. Контекст продукта (почему такие компоненты)

| Факт | Следствие для UI |
|------|------------------|
| B2B поставка электрооборудования, без витрины «купить сейчас» | Карточка товара: фото, название, производитель, PDF — **без цены и Buy** (пока `priceOnRequest`) |
| Каталог по производителям (MERSEN, HIITIO…) + дерево категорий | Category/Manufacturer tiles + sidebar/tree + breadcrumbs (уже есть) |
| PDF-каталоги и datasheet | `SkmFileLink` / download CTA, не только `<a>` |
| Новости минимальные → полноценные | `SkmNewsCard` + list + detail hero |
| Позже: корзина, заказы, ЛК, отзывы | Cart line, order status, empty/skeleton states |
| Админка CRUD | Отдельный admin kit (не раздувать публичный UI Kit) |

**Принцип:** частота использования > 2–3 экранов → в `components/ui/` как `Skm*`. Одноразовый экранный glue → `pages/` или `components/catalog|news|cart|account/`.

---

## 3. Что уже сделано (foundation) ✅

| Компонент | Роль |
|-----------|------|
| `SkmButton` | CTA + ghost/icon + `tone="brand"` |
| `SkmInput` / `SkmTextarea` / `SkmFormField` | Формы light / onBrand |
| `SkmPopover` / `SkmModal` | Overlays |
| `SkmCard` | Generic teaser (главная / услуги) — **не** карточка товара |
| `SkmBreadcrumbs`, `SkmContainer`, `SkmSection` | Page chrome |
| Layout shell | Header, Footer, MobileNav, CatalogMenu, CallOrderModal |
| Guardrails | `@skm/components`, ESLint no raw `U*`, Storybook Overview |

**Явно не карточка товара:** `SkmCard` = title + description + optional `to`. Для каталога нужен отдельный `SkmProductCard`.

---

## 4. Слои компонентов (как лучше делать)

```
┌─────────────────────────────────────────────────────────┐
│  Pages / features (catalog, news, cart, account)        │
│  — сборка секций, data fetching, SEO                    │
├─────────────────────────────────────────────────────────┤
│  Domain UI Kit (SkmProductCard, SkmNewsCard, …)         │
│  — props = доменная модель (или DTO-friendly shape)     │
│  — внутри используют SkmButton / SkmBadge / …           │
├─────────────────────────────────────────────────────────┤
│  Primitive UI Kit (уже есть + мелкие доборы)            │
│  — Badge, Alert, Pagination, Empty, Skeleton, Tabs…     │
├─────────────────────────────────────────────────────────┤
│  Nuxt UI (только внутри ui/)                            │
└─────────────────────────────────────────────────────────┘
```

### Правила проектирования domain-карточек

1. **Узкий публичный API** — props вроде `title`, `image`, `to`, `manufacturer`, `pdfHref`; не прокидывать сырой Prisma-entity.
2. **Variants, не копипаста** — например `SkmProductCard` `density: 'grid' | 'list'`.
3. **Slots для редких кейсов** — `#actions`, `#media`, `#meta`.
4. **Без бизнес-логики** — корзина/избранное снаружи через emit/`#actions`.
5. **Storybook обязателен** + пример в Overview, когда компонент входит в DoD.
6. **Типы** экспортировать из `index.ts` рядом с компонентом.

---

## 5. Inventory — что понадобится

Приоритет: **P0** (каталог/контент v1) → **P1** (commerce) → **P2** (полировка / admin public-shared).

### 5.1 Domain — каталог и контент (P0)

| Component | Назначение | Ключевой API (черновик) | Notes |
|-----------|------------|-------------------------|-------|
| **`SkmProductCard`** | Ячейка сетки/списка товаров | `title`, `to`, `image?`, `manufacturer?`, `sku?`, `pdfHref?`, `badges?`, `density?: 'grid' \| 'list'` | **Не** цена, **не** «Купить». CTA: «Подробнее» / иконка PDF |
| **`SkmProductMedia`** | Фото товара + placeholder | `src?`, `alt`, `aspect?: '4/3' \| '1/1'` | Empty state без битой картинки |
| **`SkmManufacturerCard`** | Плитка производителя | `name`, `to`, `logo?`, `linesCount?` | Каталог верхнего уровня |
| **`SkmCategoryCard`** | Плитка категории / линейки | `title`, `to`, `description?`, `image?` | Может быть thin alias над layout `SkmCard` + image — лучше отдельный API |
| **`SkmNewsCard`** | Карточка новости в ленте | `title`, `to`, `excerpt?`, `date`, `cover?` | Дата человекочитаемая снаружи или через prop `dateLabel` |
| **`SkmFileLink`** | Ссылка на PDF/файл | `href`, `label?`, `filename?`, `sizeLabel?` | Иконка файла + accent hover |
| **`SkmPageHeader`** | Заголовок внутренней страницы | `title`, `description?`, default slot after breadcrumbs | Снижает копипасту h1+p на about/services/catalog |

### 5.2 Domain — PDP и навигация по каталогу (P0/P1)

| Component | Назначение | Notes |
|-----------|------------|-------|
| **`SkmProductGallery`** | 1+ фото на `/product/[slug]` | Главное + thumbs; fallback placeholder |
| **`SkmSpecList`** | Таблица/список характеристик | `items: { label, value }[]` — B2B datasheet-паттерн |
| **`SkmCatalogSidebar`** | Дерево категорий (desktop) | UI Kit *или* `components/catalog/` если сильно привязан к API tree |
| **`SkmFilterBar`** | Поиск + фильтры производителя/категории | Содержит `SkmInput` + chips; emit `update:query` |
| **`SkmSearchBox`** | Поиск в header / catalog | Обёртка над Input + icon button; debounce снаружи |

Рекомендация: **sidebar/filters** сначала в `components/catalog/`, в UI Kit вынести только когда стабилизируется UX (2+ места).

### 5.3 Primitive доборы (P0–P1)

Нужны часто, лучше как thin Nuxt UI wrappers:

| Component | Wraps / build | Зачем |
|-----------|---------------|-------|
| **`SkmBadge`** | `UBadge` | «PDF», «Под заказ», «Новинка», статус заказа |
| **`SkmAlert`** | `UAlert` | Успех формы, ошибки checkout |
| **`SkmPagination`** | `UPagination` | Списки товаров/новостей/заказов |
| **`SkmEmpty`** | Tailwind / `UEmpty` | Пустой каталог, пустая корзина, нет результатов поиска |
| **`SkmSkeleton`** | `USkeleton` | SSR+client loading каталога |
| **`SkmTabs`** | `UTabs` | PDP: Описание / Характеристики / PDF |
| **`SkmTable`** | `UTable` | Спеки, ЛК заказы (простая) |
| **`SkmSlideover`** | `USlideover` | Замена сырого `USlideover` в MobileNav + фильтры mobile |
| **`SkmIcon`** *(optional)* | `UIcon` | Только если нужен единый size/color API; иначе `UIcon` в allowlist OK |

### 5.4 Commerce / account (P1)

| Component | Назначение | Notes |
|-----------|------------|-------|
| **`SkmCartLine`** | Строка корзины | qty controls, remove; цена optional / «по запросу» |
| **`SkmCartSummary`** | Итог + CTA «Оформить» | Без платёжной логики |
| **`SkmOrderStatusBadge`** | Статус заказа | Маппинг enum → Badge color |
| **`SkmOrderCard`** | Карточка заказа в ЛК | номер, дата, статус, сумма/«по запросу» |
| **`SkmReviewCard`** | Отзыв к товару | этап 7; можно отложить |
| **`SkmQtyInput`** | ± количество | Для cart/checkout |

B2B-нюанс: даже в commerce **не навязывать** «Buy now» на листинге. Добавление в корзину — с PDP или явной кнопки «В запрос», когда появится модель.

### 5.5 Feedback / UX chrome (P1)

| Component | Назначение |
|-----------|------------|
| **`SkmToast` usage guide** | Не обязательно wrapper — документировать `useToast` + единые тексты |
| **`SkmConfirmModal`** | Confirm на базе `SkmModal` (удалить из корзины) |
| **`SkmStepper`** | Checkout steps (Корзина → Данные → Подтверждение) |

### 5.6 Admin (отдельный трек, P2)

Не смешивать с публичным UI Kit:

- `admin/components/` или `SkmAdmin*` позже
- Data table dense, form layouts, media picker
- Можно переиспользовать `SkmInput` / `SkmButton` / `SkmModal` / `SkmTable`

---

## 6. Фокус: карточки (разделение ответственности)

| | `SkmCard` (есть) | `SkmProductCard` (нужен) | `SkmNewsCard` (нужен) |
|--|------------------|---------------------------|------------------------|
| Где | Главная teaser, услуги | `/catalog`, поиск, related | `/news`, виджет на главной |
| Media | Нет | Обязателен (placeholder) | Cover optional |
| Meta | description | manufacturer, sku?, PDF | date |
| CTA | link whole card | link + optional PDF action | link |
| Badge | Нет | PDF / Под заказ / Новинка | optional tag |

**Не расширять `SkmCard` до product** — иначе API расползётся и Storybook станет кашей.

### Черновик `SkmProductCard` (grid)

```
┌─────────────────────────┐
│      [ photo 4:3 ]      │
│  badge·PDF (optional)   │
├─────────────────────────┤
│ Manufacturer (eyebrow)  │
│ Product title           │
│ SKU (muted, optional)   │
│ [ PDF ]     Подробнее → │
└─────────────────────────┘
```

Вся карточка — ссылка на `/product/[slug]`; PDF — отдельная ссылка `stopPropagation` / nested `<a>` с аккуратным a11y (предпочтительнее PDF только на PDP, на grid — badge «есть PDF»).

Рекомендация v1 grid: **badge «PDF»** без второй ссылки; скачивание на PDP через `SkmFileLink`.

---

## 7. Фазы внедрения UI Kit (после foundation)

Связка с product roadmap, но **не блокирует** backend: карточки можно сначала на mock data в Storybook + catalog stub.

### Wave A — Catalog & content primitives (перед / параллельно этапу 5)

1. `SkmBadge`
2. `SkmEmpty`, `SkmSkeleton`
3. `SkmProductMedia`
4. **`SkmProductCard`** (+ stories: grid, list, no image, with badges)
5. **`SkmNewsCard`**
6. `SkmFileLink`
7. `SkmPageHeader`
8. `SkmManufacturerCard` / `SkmCategoryCard` (можно одним `SkmEntityCard` с `kind` — **не рекомендуется**; лучше два явных имени)
9. Overview: секция Catalog & News
10. Подключить на `/catalog` stub и `/news` stub

**DoD Wave A:** Storybook + использование на stub-страницах без API.

### Wave B — PDP & discovery

1. `SkmProductGallery`, `SkmSpecList`, `SkmTabs`
2. `SkmPagination`
3. `SkmSearchBox` (+ опционально `SkmFilterBar` в feature folder)
4. `SkmSlideover` (MobileNav + mobile filters)
5. Feature: `components/catalog/CatalogSidebar.vue` (не обязательно UI Kit)

**DoD Wave B:** готово к `/product/[slug]` и листингу с пагинацией.

### Wave C — Commerce & account

1. `SkmQtyInput`, `SkmCartLine`, `SkmCartSummary`
2. `SkmOrderStatusBadge`, `SkmOrderCard`
3. `SkmAlert`, `SkmConfirmModal`, `SkmStepper`
4. `SkmTable` (ЛК / спеки advanced)
5. `SkmReviewCard` (этап 7)

**DoD Wave C:** страницы `/cart`, `/checkout`, `/account` собираются из kit без сырого `U*`.

### Wave D — Admin shared (позже)

Вынести пересечения (Table dense, MediaThumb) только когда админка живая.

---

## 8. Что **не** тащить в UI Kit

| Избегать | Почему |
|----------|--------|
| `SkmHeader` / footer в UI Kit stories | Уже layout shell |
| «Умный» ProductCard с `useCart()` внутри | Сломать SSR и тестируемость |
| Цена + Buy на листинге «на будущее» | Противоречит текущему B2B scope |
| Один `SkmCard` на все сущности | Размытый API |
| Копирование всего Nuxt UI 1:1 | Только частота > 2–3 экрана |

---

## 9. Типы данных (контракт с API)

Публичные types рядом с компонентами (пример):

```ts
// SkmProductCard/types.ts
export type SkmProductCardBadge = 'pdf' | 'onRequest' | 'new'

export interface SkmProductCardProps {
  title: string
  to: string
  imageSrc?: string | null
  imageAlt?: string
  manufacturer?: string
  sku?: string
  badges?: SkmProductCardBadge[]
  density?: 'grid' | 'list'
}
```

Маппинг `Product` (Prisma) → props — в `composables` / page, не в UI Kit.

---

## 10. Storybook / Quality

Для каждого нового `Skm*` из Wave A–C:

- [ ] `SkmX.vue` + `index.ts` + `SkmX.stories.ts`
- [ ] Явный `import` из `vue` при необходимости
- [ ] Экспорт из `ui/index.ts`
- [ ] ESLint: `U*` только внутри `ui/`
- [ ] Overview — краткий демо-блок для domain-карточек

---

## 11. Предлагаемый ближайший спринт (конкретный)

**Цель спринта:** закрыть Wave A минимум для визуального каталога и новостей.

1. `SkmBadge`
2. `SkmProductMedia` + **`SkmProductCard`**
3. **`SkmNewsCard`**
4. `SkmEmpty` + `SkmFileLink`
5. Stub UI на `/catalog` и `/news` на mock-массивах
6. Stories + кусок Overview

Оценка: **2–4 дня** при готовой дизайн-базе.

---

## 12. Open decisions

| Вопрос | Рекомендация |
|--------|--------------|
| PDF на grid-карточке | Только badge; download на PDP |
| List density | Да, prop `density`, не два компонента |
| Sidebar в UI Kit? | Сначала `components/catalog/` |
| Icon wrapper | Пока `UIcon` в allowlist |
| Admin kit | Отдельный трек после этапа 4 |

---

## 13. Связь документов

| Doc | Роль |
|-----|------|
| [2026-07-13-skm-ui-kit-design.md](./2026-07-13-skm-ui-kit-design.md) | Foundation architecture |
| Этот файл | Domain roadmap после foundation |
| [roadmap.md](../roadmap.md) | Продуктовые этапы (API, auth, cart) |
| Plans phase 1–3 | Уже выполнены |

После утверждения этого roadmap — следующий шаг: **implementation plan Wave A** (`writing-plans`) и реализация с `SkmProductCard` / `SkmNewsCard` в приоритете.
