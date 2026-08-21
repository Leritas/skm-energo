# SKM-Energo

B2B e-commerce platform for industrial electrical equipment supply.

## Language

**Design System**:
The umbrella term for SKM visual and component standards: tokens, all Skm* components, Storybook.
_Avoid_: UI library, component library (without qualifier)

**UI Kit**:
Reusable primitive Skm* wrappers in `components/ui/` (SkmButton, SkmInput, …).
_Avoid_: Design System (when meaning only primitives)

**Domain UI**:
Catalog- and commerce-specific Skm* components (SkmProductCard, SkmOrderCard, …).
_Avoid_: UI Kit (when meaning domain cards)

**Layout shell**:
Site chrome in `components/layout/` (SkmHeader, SkmFooter). Skm* prefix but not part of UI Kit.
_Avoid_: Layout components, page components

**Public shell**:
Stage 1b deliverable: layout + skeleton pages without backend API.
_Avoid_: MVP, static site

**Stub page**:
Preview route outside current stage criteria (`/cart`, `/checkout`, `/admin`; `/profile/**` partially live). Kept for UX preview; excluded from sitemap until the owning stage ships. Dev-copy («этап N», «mock») allowed on stubs, not on public shell routes.
_Avoid_: WIP page, draft route

**Category**:
A node in the catalog taxonomy tree. Navigation axis of the catalog.
_Avoid_: Product line, manufacturer section

**Manufacturer**:
A brand/supplier (MERSEN, HIITIO, …). Optional catalog filter, not the root of the tree.
_Avoid_: Brand (in user-facing copy — OK colloquially; in domain docs use Manufacturer)

**Catalog filter**:
Active catalog state: optional category slug (path) + optional manufacturer slug (query).
_Avoid_: Search params, catalog query

**Primary manufacturer**:
The single manufacturer of a product card. One product = one manufacturer = one SKU + PDF set.
_Avoid_: Vendor, supplier (in code)

**Similar product**:
A product from another manufacturer shown on PDP as a cross-brand alternative. Separate card, not a shared listing. Similar strip: 3-column `SkmProductCard` grid below PDP content (see [PDP visual spec](docs/superpowers/specs/2026-08-20-pdp-visual.md)).
_Avoid_: Analogue, cross-sell

**Catalog document list**:
Domain UI row list for product PDFs on PDP — bordered stack, file icon, filename, size, download affordance; lives in tab «Документы». Component: `SkmCatalogDocumentList`. See [PDP visual spec](docs/superpowers/specs/2026-08-20-pdp-visual.md).
_Avoid_: Plain link stack (`SkmFileLink` only) on PDP

**Visible category tree**:
The public catalog taxonomy after publish rules and product-subtree prune: only published categories that contain ≥1 matching published product in their subtree (scoped by active Manufacturer filter when set). Single source for dropdown, sidebar, breadcrumbs, and slug validation.
_Avoid_: Full category tree, all categories (on public routes)

**Flat category URL**:
Public category address `/catalog/{categorySlug}` — one slug segment, globally unique; nested hierarchy shown in breadcrumbs only, not in the path.
_Avoid_: Nested catalog path, category path segments

**Catalog category tile**:
Domain UI card for a subcategory (or root category on `/catalog`) — **4:3 cover photo** (Stage 4b category cover), title below media; links deeper into the visible category tree. Grid: `sm:2` / `xl:3` columns. See [catalog category page visual spec](docs/superpowers/specs/2026-08-20-catalog-category-page-visual.md) (prototype **A2**).
_Avoid_: Category card (ambiguous with UI Kit primitive), landscape/wide-only tile (superseded by A2 verdict)

**Catalog product tile**:
Domain UI card for a product in catalog grids — **inset square (1:1)** product media, manufacturer label, SKU, badges; denser grid (`sm:2` / `lg:3` / `xl:4`). Distinct from UI Kit `SkmProductCard` default grid density. See [catalog category page visual spec](docs/superpowers/specs/2026-08-20-catalog-category-page-visual.md) (prototype **A2**).
_Avoid_: Product card (ambiguous with UI Kit `SkmProductCard` primitive)

**Manufacturer catalog entry**:
Choosing a Manufacturer from the header catalog dropdown to open `/catalog?manufacturer=` — entry into filtered browsing, distinct from in-page manufacturer toggle on the filter bar (same catalog filter state, different UI location).
_Avoid_: Manufacturer page, brand homepage

## Auth & profile

**User**:
An authenticated account (email + password). B2B profile fields (phone, company, inn, position) live on User, not a separate Profile entity.
_Avoid_: Client, account (in domain docs)

**Role**:
A named set of Permissions stored in PostgreSQL; User may have multiple Roles; effective permissions = union.
_Avoid_: Group, profile type

**Permission**:
A hardcoded capability string in `@skm/specs` (e.g. `hasAccessToAdmin`). Checked via `@RequirePermissions` on API; `hasAbsoluteControl` bypasses other checks.
_Avoid_: Scope, grant (without qualifier)

**Guest**:
Unauthenticated visitor; not a DB Role — absence of JWT.
_Avoid_: Anonymous user role

**Profile (UI)**:
The authenticated `/profile/*` area: info, orders, favorites. Distinct from User management in admin.
_Avoid_: Account area, ЛК as code identifier
