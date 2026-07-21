# SKM UI Kit Waves A–C Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Закрыть публичный domain UI Kit (каталог, новости, PDP, commerce/ЛК chrome) так, чтобы страницы собирались из `Skm*` без сырого `U*` (кроме allowlisted `UIcon`).

**Architecture:** Domain-карточки и commerce-блоки — thin presentational компоненты в `frontend/app/components/ui/` с DTO-friendly props; sidebar/filters сначала в `components/catalog/`; маппинг API → props снаружи kit.

**Tech Stack:** Nuxt 4, Vue 3, Nuxt UI v4 (только внутри `ui/`), Storybook, ESLint `skm-ui-kit/no-raw-nuxt-ui`, `@skm/components`.

**Spec / roadmap:** [docs/superpowers/specs/2026-07-20-skm-ui-kit-roadmap.md](../specs/2026-07-20-skm-ui-kit-roadmap.md)

**Out of scope:** Wave D / Admin kit

## Global Constraints

- Не расширять `SkmCard` до product — отдельный `SkmProductCard`
- PDF на grid: только badge; download через `SkmFileLink` на PDP
- Без бизнес-логики (`useCart`, fetch) внутри kit
- При появлении wrapper — сразу `U*` в FORBIDDEN в `eslint-rules/skm-ui-kit.mjs`
- `UIcon` остаётся в allowlist; `SkmIcon` не делаем
- Не коммитить без явной просьбы пользователя

## Per-component DoD

1. `SkmX.vue` + `index.ts` (+ `types.ts` при необходимости)
2. `SkmX.stories.ts` (`title: 'SKM Design System/SkmX'`)
3. Export from `ui/index.ts`
4. Overview demo block when domain cards ship
5. Exhaustive `switch` + `never` for variant/tone enums

---

## Wave A — Catalog & content

- [x] A1: `SkmBadge`
- [x] A2: `SkmEmpty` + `SkmSkeleton`
- [x] A3: `SkmProductMedia`
- [x] A4: `SkmProductCard`
- [x] A5: `SkmNewsCard`
- [x] A6: `SkmFileLink` + `SkmPageHeader`
- [x] A7: `SkmManufacturerCard` + `SkmCategoryCard`
- [x] A8: Stub `/catalog` + `/news` + Overview Catalog & News

## Wave B — PDP & discovery

- [x] B1: `SkmTabs` + `SkmSpecList` + `SkmProductGallery`
- [x] B2: `SkmPagination` + `SkmSearchBox` + `catalog/CatalogFilterBar.vue`
- [x] B3: `SkmSlideover` + MobileNav migration
- [x] B4: `CatalogSidebar` + stub `/product/[slug]` + catalog pagination/search

## Wave C — Commerce & account

- [x] C1: `SkmQtyInput` + `SkmCartLine` + `SkmCartSummary`
- [x] C2: `SkmOrderStatusBadge` + `SkmOrderCard`
- [x] C3: `SkmAlert` + `SkmConfirmModal` + `SkmStepper` + toast usage note
- [x] C4: `SkmTable` + `SkmReviewCard`
- [x] C5: Stub `/cart`, `/checkout`, `/account` + Overview Commerce

## Verification

```bash
cd frontend && npm run lint
```
