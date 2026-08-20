# Catalog Category Page — Visual Design Spec (A2)

**Date:** 2026-08-20  
**Status:** Approved — prototype verdict [#70](https://github.com/Leritas/skm-energo/issues/70)  
**Prototype variant:** **A2** (`VariantA2StackedGrid`)  
**Preview:** `/prototype/catalog-category?variant=A2` (dev only)  
**Implementation:** [#67](https://github.com/Leritas/skm-energo/issues/67) — category page visual half  
**Parent spec:** [2026-08-20-public-catalog-rebuild.md](./2026-08-20-public-catalog-rebuild.md)

---

## Verdict

**Chosen layout:** stacked sections (variant A family), not sidebar filtering (variant B).

**Rejected for production:** sidebar-driven subcategory selection (B1–B3), wide 21:9 subcategory covers (A1), horizontal subcategory rows + product list (A3).

**Primary reference implementation:** `frontend/app/components/prototype/catalog-category/VariantA2StackedGrid.vue`

---

## Page structure

Applies to `/catalog/{slug}` when the category is in the visible tree. Existing page chrome stays: `SkmSection` → `SkmContainer` → `SkmPageHeader` (title, description, breadcrumbs) → sidebar + main column grid from current catalog page.

Inside the **main column** (right of catalog sidebar on `lg+`):

1. **Section «Подкатегории»** — visible child categories of the current slug (from visible tree).
2. **Section «Товары»** — products for the current category (including descendants per data-layer rules).

Sections are **stacked vertically**, never mixed in one grid.

### Section visibility (empty behavior)

| Condition                                 | Behavior                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| No visible subcategories                  | Omit «Подкатегории» section entirely (no heading, no empty state).        |
| No products for current scope             | Omit «Товары» section entirely when not in search mode.                   |
| Both empty (leaf category, zero products) | Show existing `SkmEmpty` for the product area (current catalog behavior). |
| Search active                             | Subcategories hidden; product/search results area unchanged by this spec. |

### Section headings

- Copy: «Подкатегории» / «Товары» (or «Категории» on `/catalog` root — unchanged).
- Style: `text-sm font-semibold uppercase tracking-wide text-neutral-900`
- First section: `mt-10` below filter bar (or `mt-8` where filter chips present — match surrounding catalog page spacing).
- Second section: `mt-10` below first section (not `mt-12`).

---

## Subcategory grid («Подкатегории»)

```
mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3
```

- **1 col** below `sm`
- **2 cols** from `sm`
- **3 cols** from `xl`
- **Gap:** `gap-5` (1.25rem)

### Domain component: `SkmCatalogCategoryTile`

Location: `frontend/app/components/catalog/SkmCatalogCategoryTile.vue`

| Property      | Rule                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------- |
| Media aspect  | **4:3** (`aspect-[4/3]`) — category **cover photo** from Stage 4b (`category.coverPhoto`)       |
| Media fit     | `object-cover`                                                                                  |
| Missing cover | Neutral placeholder with `i-lucide-layers` icon (same pattern as `SkmProductMedia` placeholder) |
| Title         | Category label, `text-base font-semibold`, below media in `p-4`                                 |
| Card shell    | `rounded-xl border border-neutral-100 bg-white shadow-sm`, hover `shadow-md`                    |
| Link          | `NuxtLink` to `/catalog/{slug}` preserving active manufacturer query                            |
| Title hover   | `group-hover:text-accent-600`                                                                   |

**Not** 21:9 wide tiles (that was A1). Root `/catalog` category grid uses the **same tile and same grid** as subcategories on nested pages.

---

## Product grid («Товары»)

```
mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

- **1 col** default
- **2 cols** from `sm`
- **3 cols** from `lg`
- **4 cols** from `xl`
- **Gap:** `gap-5`

Denser than the pre-prototype 3-column product grid; fourth column only at `xl`.

### Domain component: `SkmCatalogProductTile`

Location: `frontend/app/components/catalog/SkmCatalogProductTile.vue`

Promote from prototype `PrototypeProductTile` with `compact` styling (A2 uses compact everywhere in the product grid).

| Property        | Rule                                                                             |
| --------------- | -------------------------------------------------------------------------------- |
| Media aspect    | **1:1** square (`SkmProductMedia aspect="1/1"`)                                  |
| Media placement | **Inset:** `mx-4 mt-4` on media wrapper; media `rounded-lg` (not full-bleed top) |
| Image source    | First attached product photo or placeholder                                      |
| Badges          | Overlay top-left on media; reuse `SkmProductCard` badge display helpers          |
| Manufacturer    | `text-xs font-medium uppercase tracking-wide text-accent-600`                    |
| Title           | `text-base font-semibold`                                                        |
| SKU             | `text-xs text-neutral-500`, prefix «Артикул:»                                    |
| Body padding    | `p-4` below media block                                                          |
| Card shell      | Same as category tile                                                            |
| Link            | `NuxtLink` to `/product/{slug}`                                                  |

**Do not** reuse raw `SkmProductCard` on category pages — domain tiles keep distinct density and inset-square media called out in prototype A2.

---

## Wiring on `catalog/[[...slug]].vue`

Replace mixed `SkmCategoryCard` / `SkmProductCard` grids in the main column with:

- `SkmCatalogCategoryTile` for subcategory/root category sections
- `SkmCatalogProductTile` for product sections

Keep unchanged: sidebar (`SkmCatalogSidebar`), filter bar, breadcrumbs, pagination, search, SEO, 404, composables.

Pagination (`itemsPerPage`) — out of scope for this visual spec; keep current behavior until a separate UX decision.

---

## Out of scope (this spec)

- Sidebar layout changes
- Subcategory filtering without navigation (B variants)
- PDP tile treatment ([#73](https://github.com/Leritas/skm-energo/issues/73) / [#71](https://github.com/Leritas/skm-energo/issues/71))
- Header dropdown visuals ([#72](https://github.com/Leritas/skm-energo/issues/72))

---

## Acceptance checklist (#67 visual half)

- [ ] `SkmCatalogCategoryTile` — 4:3 cover, link, placeholder
- [ ] `SkmCatalogProductTile` — inset 1:1 media, manufacturer, SKU, badges
- [ ] Category page: separate stacked sections, grids per above
- [ ] Empty subcategory section omitted when no children
- [ ] Root `/catalog` uses same category tile + grid as subcategory section
- [ ] Manual smoke: category with cover + products renders per A2 in browser
