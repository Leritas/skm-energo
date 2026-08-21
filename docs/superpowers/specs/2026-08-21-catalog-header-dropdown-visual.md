# Catalog Header Dropdown — Visual Design Spec (D3P)

**Date:** 2026-08-21  
**Status:** Approved — prototype verdict [#72](https://github.com/Leritas/skm-energo/issues/72)  
**Prototype variant:** **D3P** (`PrototypeD3DropdownPanel`)  
**Preview:** `/prototype/catalog-dropdown` (dev only)  
**Implementation:** [#72](https://github.com/Leritas/skm-energo/issues/72) — `SkmCatalogMenu` + mobile catalog nav  
**Parent spec:** [2026-08-20-public-catalog-rebuild.md](./2026-08-20-public-catalog-rebuild.md)

---

## Verdict

**Chosen layout:** split panel — purple manufacturer sidebar (left) + white category tree with toolbar (right).

**Rejected for production:**

- Nested list / mega-menu columns / tile grids (prototype groups B, C)
- Neutral or orange sidebar themes (D3 baseline, D3O)
- Expanded-by-default tree without toolbar (D1)
- Compact collapsed-only tree (D2)
- Manufacturer chips with «Все бренды» entry row
- Pill/button backgrounds on manufacturer rows (white/orange filled states)

**Primary reference implementation:**

- `frontend/app/components/prototype/catalog-dropdown/PrototypeD3DropdownPanel.vue`
- `frontend/app/components/prototype/catalog-dropdown/d3-themes.ts` (`D3P_DROPDOWN_THEME`, `D3P_TREE_THEME`)
- `frontend/app/components/prototype/catalog-dropdown/PrototypeDropdownFolderTree.vue`

---

## Panel structure

Desktop dropdown for header item «Продукция». Host: existing `SkmPopover` (`variant="catalog"`). Panel width ≈ `40rem`, `rounded-xl`, white surface + shadow (popover chrome).

Two columns:

| Zone          | Width           | Background                                       | Role                                                  |
| ------------- | --------------- | ------------------------------------------------ | ----------------------------------------------------- |
| Manufacturers | `w-44` shrink-0 | `bg-brand-purple-950`, `border-brand-purple-800` | In-dropdown manufacturer filter + catalog entry links |
| Categories    | flex-1          | white                                            | Toolbar + expandable folder tree                      |

Max tree viewport height: `max-h-[20rem]` with vertical scroll.

---

## Left — manufacturers

### Heading

- Copy: «Производители»
- Style: `text-[10px] font-semibold uppercase tracking-wide text-white`

### List behavior (radio filter, not navigation)

- **No «Все бренды» row.** No selection = all manufacturers (full visible tree).
- Each row: **label button** (filter) + **`arrow-up-right` link** (catalog entry).
- **Click label:** toggle radio selection. Click active manufacturer again → clear selection (back to all).
- **Click `arrow-up-right`:** navigate to `/catalog?manufacturer={slug}` (catalog entry point; does not change in-dropdown selection by itself).
- `role="radiogroup"` / `role="radio"` / `aria-checked` on label buttons.

### Row visuals

| State    | Label text                                      | Link icon                                  |
| -------- | ----------------------------------------------- | ------------------------------------------ |
| Idle     | `text-white font-medium`, hover `text-white/90` | `text-accent-500`, hover `text-accent-400` |
| Selected | `text-accent-500 font-semibold` (no background) | same orange icon                           |

- Icon: `i-lucide-arrow-up-right`, `size-3.5`
- Row layout: `flex items-center gap-2 py-1`; label `flex-1 text-left text-xs`
- No row backgrounds, borders, or pill wrappers.

### Tree reaction

When manufacturer selected in sidebar, **category tree rebuilds** from `useCatalogTaxonomy(manufacturerSlug)` — same prune rules as catalog page (empty branches hidden). Collapse expanded nodes when filter changes.

---

## Right — categories

### Toolbar (top border `border-neutral-100`)

**Left:** link to catalog root for current filter scope.

- No manufacturer selected → label «Весь каталог», `to="/catalog"`
- Manufacturer selected → «Каталог · {ManufacturerLabel}», `to="/catalog?manufacturer={slug}"`
- Style: `text-xs font-semibold text-accent-600 hover:underline`

**Right:** text buttons «Развернуть всё» / «Свернуть»

- Style: `text-[10px] font-medium text-neutral-600 hover:bg-brand-purple-50`

### Folder tree

Admin-style expandable tree (same interaction model as `AdminCategoryTree`):

- Chevron expand/collapse on nodes with children
- Icons: expanded folder `i-lucide-folder-tree`, collapsed `i-lucide-folder`, leaf `i-lucide-box`
- Icon wrap: `bg-brand-purple-100 text-brand-purple-700`, rounded `size-6`
- Row hover: `hover:bg-brand-purple-50/60`
- Link text: `text-sm` (root `font-semibold`), `text-neutral-900 hover:text-brand-purple-700`
- Depth indent: `paddingLeft = 8 + depth * 20` px
- Category links: flat URLs `/catalog/{slug}` + optional `?manufacturer=` from active sidebar filter

### Empty tree

When pruned tree has no roots: centered «Нет категорий для выбранного производителя.» (`text-sm text-neutral-500`).

---

## Data & routing (production)

- Load manufacturers from public catalog API; tree from `useCatalogTaxonomy(selectedManufacturerSlug)`.
- Sidebar filter is **local UI state** inside open dropdown; arrow link is **navigation** to catalog entry.
- Catalog page filter bar uses same manufacturer scope — distinct UI location, same setter semantics per parent spec.
- Do not use prototype mock prune helpers in production; use live taxonomy composable.

---

## Mobile nav (#72)

Same visible tree and manufacturer scope as dropdown. Layout may stack or slide (not pixel-identical to desktop panel). Manufacturer filter + catalog entry semantics unchanged.

---

## Out of scope (this spec)

- Popover open/close animation tweaks
- Search inside dropdown
- Category cover thumbnails in tree
- Pinia catalog store

---

## Acceptance checklist (#72)

- [ ] `SkmCatalogMenu` matches D3P layout, colors, and manufacturer interaction
- [ ] No «Все бренды»; deselect manufacturer restores full tree
- [ ] Label = filter; `arrow-up-right` = `/catalog?manufacturer=`
- [ ] Tree from `useCatalogTaxonomy`; prunes on manufacturer change
- [ ] Expand all / collapse all in toolbar
- [ ] Category links: `/catalog/{slug}` + manufacturer query when filtered
- [ ] Mobile catalog section follows same data rules
- [ ] Prototype route kept at `/prototype/catalog-dropdown` (dev, noindex)
