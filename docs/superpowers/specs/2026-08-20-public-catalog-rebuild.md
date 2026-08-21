# Public Catalog Rebuild — Design Spec

**Date:** 2026-08-20  
**Status:** Approved (grilling #14, 2026-08-20)  
**Scope:** Roadmap Stage 5 — public catalog on PostgreSQL + Stage 4b media; admin CRUD as source of truth  
**Epic:** [#14](https://github.com/Leritas/skm-energo/issues/14)  
**Implementation:** [#67](https://github.com/Leritas/skm-energo/issues/67) (taxonomy + category pages), [#72](https://github.com/Leritas/skm-energo/issues/72) (nav), [#73](https://github.com/Leritas/skm-energo/issues/73) (PDP), [#68](https://github.com/Leritas/skm-energo/issues/68) (search), [#69](https://github.com/Leritas/skm-energo/issues/69) (similar)  
**Prototypes (design gate):** [#70](https://github.com/Leritas/skm-energo/issues/70), [#71](https://github.com/Leritas/skm-energo/issues/71), [#72](https://github.com/Leritas/skm-energo/issues/72) (header dropdown — **D3P** approved 2026-08-21)  
**ADR:** [docs/adr/0001-visible-catalog-taxonomy.md](../adr/0001-visible-catalog-taxonomy.md)

---

## Problem Statement

Stage 5 was closed as a “delta” wiring mock UI to an early read API (#6, #8, #9). With catalog content entered via `/admin` and Stage 4b media attached, the public catalog does not work: category routes return 404, navigation and validation disagree, and PDP/layout predates current media and admin models. Visitors cannot browse admin-published categories and products reliably; staff cannot verify content they create in admin on the public site.

## Solution

Rebuild the public catalog end-to-end on admin-sourced PostgreSQL data and Stage 4b `AttachedFile` media. A single **visible category tree** (published categories, pruned by product presence in subtree) drives header dropdown, mobile nav, sidebar, breadcrumbs, slug validation, and manufacturer-scoped filtering. Category pages show separate sections for subcategories and products with distinct Domain UI tiles. PDP is fully redesigned after UI prototype approval. Search and similar products build on the same taxonomy composable. Manufacturer remains a query filter only (#46 out of scope).

## User Stories

1. As a **guest**, I want to open `/catalog` and see root categories that contain published products, so that I only navigate to sections with real assortment.
2. As a **guest**, I want to open `/catalog/{slug}` for a visible category and see its subcategories and products, so that I can drill down without dead ends.
3. As a **guest**, I want a flat URL `/catalog/{slug}` even when the category is nested in the taxonomy, so that links stay clean while breadcrumbs show hierarchy.
4. As a **guest**, I want a 404 when I open an unknown, unpublished, or pruned category slug, so that I am not shown empty catalog shells for non-existent public categories.
5. As a **guest**, I want subcategory tiles and product tiles to look visually distinct (4:3 category covers vs inset square product photos), so that I can tell navigation from purchasable items at a glance.
6. As a **guest**, I want category tiles to show cover photos when staff attached them in admin, so that browsing feels visual and current.
7. As a **guest**, I want product cards to show the first attached photo or a neutral placeholder, so that cards are consistent when media is missing.
8. As a **guest**, I want to filter the catalog by Manufacturer via `?manufacturer=`, so that I see only relevant brands without manufacturer-first navigation.
9. As a **guest**, I want the category tree to shrink when a Manufacturer filter is active, so that I do not see categories with no products from that Manufacturer.
10. As a **guest**, I want switching Manufacturer to land on catalog root with the filter applied, so that I never stay on a category invalid for the new filter.
11. As a **guest**, I want to pick a Manufacturer from the header dropdown as an entry point, so that I can start browsing a brand quickly.
12. As a **guest**, I want to toggle Manufacturer on the catalog page filter bar, so that I can refine results without reopening the header menu.
13. As a **guest**, I want the header dropdown and catalog sidebar to show the same category tree as the page I am on, so that navigation is predictable.
14. As a **guest**, I want product lists on a category page to include products in descendant categories, so that parent category pages are useful summaries.
15. As a **guest**, I want to open `/product/{slug}` and see gallery, description, specs, documents, and SEO meta from admin data, so that PDP reflects what staff published.
16. As a **guest**, I want document downloads on PDP with filename and size, so that I can access PDFs attached in admin.
17. As a **guest**, I want a “similar products from other manufacturers” strip when alternatives exist, so that I can compare cross-brand options in the same Category.
18. As a **guest**, I want to search from the header modal and land on `/catalog?q=…`, so that search behaves like the rest of the catalog.
19. As a **guest**, I want catalog page search to use the same backend as the header, so that results are consistent.
20. As a **guest**, I want search to find products created in admin after deploy, so that the catalog stays current without re-seed.
21. As a **staff member with admin access**, I want a published category with at least one published product (and published Manufacturer) to appear on the public site without re-seed, so that I can verify CRUD in admin immediately.
22. As a **staff member**, I want unpublished or soft-deleted entities hidden from the public catalog, so that draft content never leaks.
23. As a **developer**, I want one taxonomy composable shared by all catalog surfaces, so that validation and navigation cannot drift apart again.
24. As a **developer**, I want category page and PDP visuals approved via throwaway prototypes before production implementation, so that layout iteration does not churn production routes.

## Implementation Decisions

### Visible category tree (canonical rule)

- Load **published, non-deleted** categories only from PostgreSQL.
- Apply **product-subtree prune:** a category appears in the visible tree iff its subtree contains ≥1 published product matching the active catalog filter (any Manufacturer when none selected; only that Primary manufacturer when `?manufacturer=` is set).
- Parent categories remain if any child survives prune or products exist in subtree.
- Leaf with zero matching products → omitted from tree (not shown with empty state as primary UX).
- Same tree returned by public read API and consumed by all client surfaces (sidebar, dropdown, mobile nav, slug validation, breadcrumbs).
- See ADR-0001 for rationale and rejected alternatives.

### Catalog filter and URLs

- **Catalog filter** = optional category slug (flat path segment) + optional manufacturer slug (query) + optional search query (query).
- Public category URLs are **flat:** `/catalog` or `/catalog/{categorySlug}` — no nested path segments required; breadcrumbs derive hierarchy from the tree.
- Invalid slug for current filter → HTTP 404 on category routes.
- Manufacturer change (dropdown or filter bar) → navigate to `/catalog` root preserving `?manufacturer=`; drop category slug if it falls out of the pruned tree.

### API (public read)

- Reuse existing catalog read endpoints; adjust category tree assembly so published load precedes prune (no separate validation endpoint in v1).
- `GET /catalog/categories?manufacturer=` returns visible tree per rules above.
- Product list and search continue to respect category descendants and manufacturer scope.
- Product detail returns Stage 4b photos, documents, specs, SEO fields; 404 when product not public.
- Similar products: same Category, different Primary manufacturer, limit configurable.

### Frontend composables

- Replace misleading split between “all categories” and “visible categories” fetching the same endpoint with different names.
- **`useCatalogTaxonomy(manufacturerSlug)`** — fetches visible tree; exposes slug lookup, breadcrumbs, child nodes for current slug; cache key includes manufacturer scope.
- **`useCatalogProducts(categorySlug, manufacturerSlug)`** — product list for page.
- **`useCatalogPage()`** — orchestrates route params, taxonomy validation, 404, manufacturer redirect, search query.
- No Pinia catalog store in Stage 5; `useAsyncData` with scoped keys.

### Category page layout

- Two stacked sections (not one mixed grid):
  1. **Subcategories** — Domain UI `SkmCatalogCategoryTile` (4:3 cover, title below).
  2. **Products** — Domain UI `SkmCatalogProductTile` (inset 1:1 media, compact density).
- **Visual design:** prototype **A2** verdict ([#70](https://github.com/Leritas/skm-energo/issues/70)) — full rules in [catalog category page visual spec](./2026-08-20-catalog-category-page-visual.md).
- Empty subcategory section omitted when no visible children; product section omitted when no products (search mode unchanged).
- Data layer (#67) may land before tiles; production tiles follow A2 spec above.

### Header and mobile navigation

- **`SkmCatalogMenu`** and mobile catalog nav consume `useCatalogTaxonomy`.
- **Visual design:** prototype **D3P** verdict ([#72](https://github.com/Leritas/skm-energo/issues/72)) — [catalog header dropdown visual spec](./2026-08-21-catalog-header-dropdown-visual.md): purple manufacturer sidebar (radio filter + `arrow-up-right` catalog entry), folder tree + expand/collapse toolbar.
- Manufacturer selected in dropdown filters the in-panel tree; `arrow-up-right` navigates to `/catalog?manufacturer=` (entry point).
- Filter bar on catalog page = in-context manufacturer toggle; both paths use the same setter and redirect rules.

### PDP

- Retire legacy PDP layout; full rebuild per prototype **#71** verdict ([#73](https://github.com/Leritas/skm-energo/issues/73)).
- **Visual design:** classic hero + tabs; document row list in tab «Документы» — [PDP visual spec](./2026-08-20-pdp-visual.md).
- Gallery from `photos[]`, documents via `SkmCatalogDocumentList`, specs, description, CTA, similar strip (`SkmProductCard` 3-col grid).
- Breadcrumbs via taxonomy composable.

### Search

- Header modal submits to `/catalog?q=…` (unchanged UX).
- Catalog page search box uses same search API with optional category/manufacturer scope from current route.
- pg_trgm / existing backend search over published products.

### Workflow

1. Prototype #70 (category tiles) — **done:** variant **A2** approved 2026-08-20.
2. Prototype #71 (PDP) — **done:** final classic layout approved 2026-08-20. Category tiles in #67 follow [catalog category page visual spec](./2026-08-20-catalog-category-page-visual.md); PDP in #73 follows [PDP visual spec](./2026-08-20-pdp-visual.md).
3. Prototype #72 (header dropdown) — **done:** variant **D3P** approved 2026-08-21. Nav in #72 follows [catalog header dropdown visual spec](./2026-08-21-catalog-header-dropdown-visual.md).
4. #72 nav implementation after #67 composable; #68 search after #67; #69 similar after #73.

### Testing seam (preferred)

**Single highest seam:** public catalog taxonomy — `filterVisibleCategoryTree` applied to published category nodes and published product refs, exposed via `CatalogService.getCategoryTree` / `GET /catalog/categories`.

- Extend unit tests on taxonomy pure functions (prior art: existing catalog-tree spec).
- Extend `CatalogService` tests for published-only load + manufacturer-scoped prune + admin-like fixtures (unpublished category, empty leaf, published parent with products only in child).
- Client behavior validated by manual smoke: create category + product in admin → visible on public site; manufacturer switch → root redirect.
- Do not unit-test Vue composables in isolation; rely on taxonomy seam + smoke for client correctness.

## Testing Decisions

- **Good tests** assert observable outcomes: tree shape given published categories/products/manufacturer filter; 404 boundaries; product list scope — not internal composable call order or component CSS.
- **Modules tested:** catalog taxonomy pure functions; `CatalogService` public read methods; existing search/similar service tests updated if prune semantics touch them.
- **Prior art:** `catalog-tree.spec.ts`, `catalog.service.spec.ts` (mocked Prisma + MediaUrlService).
- **Out of test scope for v1:** Playwright E2E (deferred per roadmap); prototype routes; Storybook-only tile variants until promoted to Domain UI.

## Out of Scope

- Manufacturer landing pages, logos, brand colors, `ManufacturerPage` ([#46](https://github.com/Leritas/skm-energo/issues/46)).
- Admin media library tab ([#55](https://github.com/Leritas/skm-energo/issues/55)).
- Nested canonical URLs (`/catalog/parent/child`).
- Pinia catalog store / client-side taxonomy cache beyond `useAsyncData`.
- New public API endpoints for per-slug category validation.
- Category taxonomy v2 full rebuild (roadmap deferred table).
- Cart, favorites live data, orders.

## Further Notes

- Supersedes closed tickets #6, #8, #9 (mock delta; acceptance not met).
- Root cause of 404: client validated slugs against product-filtered tree while admin publishes categories independently; `useCatalogAllCategories` masked the same endpoint as “full” taxonomy.
- Russian public copy on catalog/PDP routes: no dev-facing “mock/stub/этап N” strings (public shell policy).
- Glossary terms added in `CONTEXT.md`: Visible category tree, Flat category URL, Catalog category tile, Catalog product tile, Manufacturer catalog entry.
