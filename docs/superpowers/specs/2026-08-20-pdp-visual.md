# Product Detail Page (PDP) — Visual Design Spec

**Date:** 2026-08-20  
**Status:** Approved — prototype verdict [#71](https://github.com/Leritas/skm-energo/issues/71)  
**Prototype variant:** **Final classic** (`VariantFinalClassic`)  
**Preview:** `/prototype/product-detail` (dev only)  
**Implementation:** [#73](https://github.com/Leritas/skm-energo/issues/73) — PDP full redesign  
**Parent spec:** [2026-08-20-public-catalog-rebuild.md](./2026-08-20-public-catalog-rebuild.md)

---

## Verdict

**Chosen layout:** classic two-column hero (gallery + summary/CTA), tabbed detail block below, similar-products grid at footer.

**Document presentation:** row list inside tab «Документы» (not plain text links, not cards, not inline under CTA).

**Rejected for production:** sticky side panel (B), accordion-only flow (C), editorial hero 21:9 (D), spec-first three-column (E), document card grid (A2), documents inline under CTA without tab (A3).

**Primary reference implementation:** `frontend/app/components/prototype/product-detail/VariantFinalClassic.vue`

---

## Page structure

Applies to `/product/{slug}` for a published product. Page chrome: `SkmSection` → `SkmContainer`.

1. **`SkmPageHeader`** — product title; description line `{manufacturer} · арт. {sku}`; breadcrumbs from `useCatalogTaxonomy`.
2. **Hero** — `lg:grid-cols-2`, `gap-10`, `mt-8`:
   - **Left:** multi-photo gallery.
   - **Right:** badges, lead description (full text), primary CTA.
3. **Detail tabs** — `mt-12`; `SkmTabs` with three tabs (see below).
4. **Similar products** — `mt-16` section when API returns items.

Single-column stack on mobile; gallery above summary.

---

## Hero — gallery (left)

Use existing **`SkmProductGallery`** (UI Kit):

| Property   | Rule                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| Source     | `product.photos[]` (Stage 4b), mapped to `{ src: url, alt: filename }` |
| Main media | 4:3 aspect                                                             |
| Thumbnails | 1:1, shown when `photos.length > 1`                                    |
| Empty      | `SkmProductMedia` placeholder 4:3                                      |

---

## Hero — summary (right)

| Element     | Rule                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| Badges      | Product badges via existing badge display helpers; omit block when empty                     |
| Description | Full `product.description`, `text-sm leading-relaxed text-neutral-600`, preserve line breaks |
| CTA         | `SkmButton variant="primary"` → `/contacts`, label «Запросить поставку»                      |
| Spacing     | Badges `mb-4`; CTA `mt-6` after description                                                  |

No duplicate document block in the hero — documents live only in the tab.

---

## Detail tabs

**Tab labels:** «Описание» · «Характеристики» · «Документы»

**Default active tab in production:** «Описание» (prototype opens «Документы» for review only).

| Tab            | Content                                               | Empty state                                                     |
| -------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| Описание       | Same description text as hero (`whitespace-pre-line`) | N/A (description required for published products)               |
| Характеристики | `SkmSpecList` over `product.specs`                    | «Характеристики пока не заполнены.»                             |
| Документы      | Domain document row list (below)                      | «Документация будет добавлена менеджером при запросе поставки.» |

Tab panel: `mt-6` below `SkmTabs`.

---

## Domain component: `SkmCatalogDocumentList`

Location: `frontend/app/components/catalog/SkmCatalogDocumentList.vue`

Promote from prototype `PrototypeDocumentList.vue`.

| Property            | Rule                                                                   |
| ------------------- | ---------------------------------------------------------------------- |
| Container           | `rounded-xl border border-neutral-100 divide-y divide-neutral-100`     |
| Row                 | Flex: icon box → filename + size → download icon                       |
| Icon box            | `size-10`, `rounded-lg`, `bg-neutral-100`, `i-lucide-file-text`        |
| Filename            | `text-sm font-medium`, truncate                                        |
| Size                | `text-xs text-neutral-500`, human-readable (`formatAttachedFileSize`)  |
| Download affordance | `i-lucide-download`, `text-accent-600`, right-aligned                  |
| Row hover           | `hover:bg-neutral-50`                                                  |
| Link                | `<a target="_blank" rel="noopener noreferrer">` to public document URL |
| Empty               | Single paragraph empty copy (table above)                              |

Do **not** use plain `SkmFileLink` stack on PDP — row list is the approved pattern.

---

## Similar products strip

| Property   | Rule                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| Heading    | «Похожие товары других производителей» — `text-xl font-semibold`                |
| Grid       | `mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3`                                 |
| Card       | **`SkmProductCard`** (UI Kit) — square media default, manufacturer, SKU, badges |
| Data       | `GET /catalog/products/:slug/similar`                                           |
| Visibility | Omit entire section when zero similar products                                  |

---

## Wiring on `product/[slug].vue`

Replace legacy **`CatalogProductDetailView`** with a new domain view (e.g. `CatalogProductDetailView` rewritten in place or `SkmCatalogProductDetailView`) that implements this spec.

Keep unchanged on the page route: SSR product fetch, SEO meta, JSON-LD, 404, breadcrumbs/taxonomy composables, similar-products fetch.

---

## Out of scope (this spec)

- Manufacturer landing pages ([#46](https://github.com/Leritas/skm-energo/issues/46))
- Cart / favorites live data
- Category page tiles ([#67](https://github.com/Leritas/skm-energo/issues/67) / [#70](https://github.com/Leritas/skm-energo/issues/70))

---

## Acceptance checklist (#73 visual half)

- [ ] Hero 2-col: `SkmProductGallery` + summary/CTA per above
- [ ] `SkmTabs`: Описание / Характеристики / Документы with empty states
- [ ] `SkmCatalogDocumentList` — row list in documents tab
- [ ] Similar strip — 3-col `SkmProductCard` grid when data present
- [ ] Retire legacy PDP layout; manual smoke on seeded product with photos + PDFs
