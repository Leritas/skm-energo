# SKM Admin UI Kit — Future Spec

**Date:** 2026-07-21  
**Status:** Draft — future (не начат)  
**Depends on:**  
- [Public UI Kit design](./2026-07-13-skm-ui-kit-design.md) ✅ historical  
- [Domain UI Kit roadmap](./2026-07-20-skm-ui-kit-roadmap.md) ✅ historical (Waves A–C)  
- [Product roadmap](../../roadmap.md) — админка после этапа 4  

---

## 1. Цель

Отдельный слой компонентов для `/admin`: CRUD, dense tables, media picker, form layouts. **Не смешивать** с публичным `components/ui/` — иначе API и Storybook размоются под marketing + B2B storefront.

Публичный kit уже закрыт (foundation + domain). Этот документ — задел на будущее; реализация только когда админ-экраны реально появятся.

---

## 2. Границы

| В admin kit | Не в admin kit |
|-------------|----------------|
| Dense data table, filters toolbar | Публичные `SkmProductCard` / `SkmNewsCard` |
| Media picker / upload thumb | Layout shell сайта (header/footer) |
| Admin form section / page chrome | Generic `SkmButton` / `SkmInput` / `SkmModal` — **переиспользовать** |
| Confirm destructive actions (можно обёртка над `SkmConfirmModal`) | Копипаста всего Nuxt UI |

**Принцип:** частота на admin-экранах > 2–3 → `SkmAdmin*` (или `admin/components/`). Одноразовый glue → `pages/admin/`.

---

## 3. Предлагаемое размещение

Два варианта (решить при старте админки):

1. **`frontend/app/components/admin/`** — feature folder, без Storybook Overview публичного kit  
2. **`frontend/app/components/ui/SkmAdmin*`** — только если компонент реально shared и нужен в Storybook design system  

Рекомендация v1: **option 1** (`components/admin/`), переиспользуя публичные `SkmInput`, `SkmButton`, `SkmModal`, `SkmTable`, `SkmAlert`, `SkmBadge`.

ESLint: сырые `U*` по-прежнему только внутри `ui/` (или расширить allow для `admin/` wrappers, если появятся тонкие Nuxt UI wrappers там).

---

## 4. Inventory (черновик P2)

| Component | Назначение | Notes |
|-----------|------------|-------|
| **`AdminDataTable`** | Dense list + sort/filter slots | Может обёртывать / расширять `SkmTable` |
| **`AdminFilterBar`** | Поиск + chips + date range | Admin UX, не catalog `CatalogFilterBar` |
| **`AdminFormSection`** | Группа полей + title | Layout CRUD forms |
| **`AdminMediaThumb`** | Превью фото/PDF + replace | Связь с `MediaFile` API |
| **`AdminMediaPicker`** | Modal/slideover выбора файла | Позже |
| **`AdminPageHeader`** | Title + breadcrumbs + primary action | Аналог `SkmPageHeader` + actions |
| **`AdminStatusBadge`** | Publish / draft / role | Можно на базе `SkmBadge` |

Имена префикса (`Admin*` vs `SkmAdmin*`) — зафиксировать в implementation plan.

---

## 5. Что переиспользовать из публичного kit

- `SkmButton`, `SkmInput`, `SkmTextarea`, `SkmFormField`
- `SkmModal`, `SkmConfirmModal`, `SkmSlideover`
- `SkmTable`, `SkmAlert`, `SkmBadge`, `SkmEmpty`, `SkmSkeleton`
- `SkmPagination`, `SkmTabs`

Не тащить в admin: product/news/cart domain cards.

---

## 6. DoD (когда начнём)

1. Spec утверждён + implementation plan  
2. Первые 2–3 CRUD-экрана собираются без сырого `U*` вне wrappers  
3. Storybook: отдельная секция «Admin» **или** только visual QA на `/admin` (решить при старте)  
4. Публичный Overview не засорять admin-only компонентами  

---

## 7. Связь документов

| Doc | Роль |
|-----|------|
| [2026-07-13-skm-ui-kit-design.md](./2026-07-13-skm-ui-kit-design.md) | Public foundation (done) |
| [2026-07-20-skm-ui-kit-roadmap.md](./2026-07-20-skm-ui-kit-roadmap.md) | Public domain Waves A–C (done) |
| Этот файл | Admin kit — future |
| [../../roadmap.md](../../roadmap.md) | Когда поднимать админку |

**Следующий шаг при старте админки:** brainstorming → уточнить inventory → `writing-plans` → реализация.
