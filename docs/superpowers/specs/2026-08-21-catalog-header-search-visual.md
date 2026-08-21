# Catalog Header Search — Visual & UX Spec (Spotlight B)

**Date:** 2026-08-21  
**Status:** Approved — prototype verdict [#68](https://github.com/Leritas/skm-energo/issues/68)  
**Prototype variant:** **Final** — purple-header spotlight (`VariantFinal_Spotlight`)  
**Preview:** `/prototype/header-search` (dev only)  
**Implementation:** [#68](https://github.com/Leritas/skm-energo/issues/68) — replace `SkmSearchModal` + wire live `/catalog/search`  
**Parent spec:** [2026-08-20-public-catalog-rebuild.md](./2026-08-20-public-catalog-rebuild.md)

---

## Verdict

**Chosen pattern:** full-viewport **spotlight overlay** (centered panel, dimmed backdrop), not inline header expand, not top stripe on white panel, not modal-with-footer-cancel.

**Chosen shell:** **purple header bar** (`bg-brand-purple-950`, white input text/icons) — aligns with [#72](https://github.com/Leritas/skm-energo/issues/72) catalog dropdown sidebar. Panel body/footer stay white/neutral. **No outer border** on panel — shadow only (`shadow-2xl`).

**Rejected for production:**

- Modal `SkmModal` + submit-only flow (no live results)
- Persistent search field in header
- Slide-down / header-expand panels
- Purple top stripe on white panel (variant A)
- Table rows, manufacturer grouping sections
- Image thumbnails in result list

**Primary reference implementation:**

- `frontend/app/components/prototype/header-search/spotlight/VariantFinal_Spotlight.vue`
- `frontend/app/components/prototype/header-search/spotlight/PrototypeSpotlightFrame.vue`
- `frontend/app/components/prototype/header-search/spotlight/SpotlightRowsFinal_Full.vue`
- `frontend/app/components/prototype/header-search/spotlight/purpleHeaderSpotlightProps.ts`
- `frontend/app/components/prototype/header-search/spotlight/SpotlightSkuCopy.vue`
- `frontend/app/components/prototype/header-search/spotlight/SpotlightRowShell.vue`

Exploration artifacts (B1–B3 row variants, A/B shell compare) remain under `frontend/app/components/prototype/header-search/spotlight/` for history.

---

## Overlay & panel

| Element  | Treatment                                                                |
| -------- | ------------------------------------------------------------------------ |
| Backdrop | `bg-neutral-950/60 backdrop-blur-sm`, click closes                       |
| Panel    | `max-w-2xl`, `rounded-lg`, `bg-brand-purple-950` shell + white body      |
| Position | `pt-[12vh]`, centered horizontally                                       |
| z-index  | overlay `z-[100]`, panel `z-[101]`                                       |
| Close    | Esc key, **Esc** pill button (far right), backdrop click — **not** the ✕ |

---

## Input bar (purple)

Layout left → right: search icon · input · **✕ clear** (when text) · **Esc** close.

| Control   | Behavior                                                                     |
| --------- | ---------------------------------------------------------------------------- |
| Input     | `type="text"` (no native search clear), white text, purple placeholder       |
| ✕         | Visible when any text; **clears query** only; reserved `size-8` slot         |
| Esc       | Clickable kbd-style button; **closes spotlight**                             |
| Enter     | Navigate to `/catalog?q=…` when query length ≥ 2                             |
| Min query | **2 characters** before live search / results / footer (`MIN_SEARCH_LENGTH`) |

Input row: `min-h-12`, trailing controls in `flex items-center` group for vertical alignment.

---

## Empty & loading

- **Empty query or 1 char:** popular suggestions (`PrototypeSearchSuggestions`).
- **≥ 2 chars, debounced ~180ms:** live results list + footer.
- **Footer** (only when searching): «N результатов» + link «Все результаты →» → `/catalog?q=…`.

---

## Result row (3 lines)

Hover: `border-l-2` idle `neutral-200` → **`accent-500`** + `bg-neutral-50`. Chevron vertically centered on row. Row click → product page; SKU copy stops propagation.

1. **Title** — `text-sm font-medium text-neutral-900`
2. **Manufacturer · category** — manufacturer `font-semibold text-accent-600`, category `text-neutral-500`
3. **Artikul + badges** — `SpotlightSkuCopy` (copy to clipboard, copy→check 2s) + `SkmBadge` (`pdf`, `new`, `onRequest`)

Badges spaced from artikul (`gap-x-3`).

---

## Production notes (#68)

- Replace mock `usePrototypeSearch` with `useCatalogSearch` / `GET /catalog/search`.
- Mount from `SkmHeader` search trigger; remove placeholder `SkmSearchModal` flow.
- Reuse `productBadgeLabel` / `toProductCardBadges` from catalog tiles.
- Keep `robots: noindex` off production routes; prototype route stays dev-only.
