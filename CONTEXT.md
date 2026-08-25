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
Preview route outside current stage criteria (`/admin`; `/profile/**` partially live). Kept for UX preview; excluded from sitemap until the owning stage ships. Dev-copy («этап N», «mock») allowed on stubs, not on public shell routes.
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
An authenticated account (email + password). Profile fields (phone, company, inn, position) live on User, not a separate Profile entity. Company fields are optional — used when ordering as a legal entity.
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

## Commerce

**Cart**:
A persisted list of products and quantities a visitor is assembling before checkout. Owned by either a Guest session or an authenticated User.
_Avoid_: Basket, request list (in domain docs)

**Guest cart session**:
An anonymous cart identity keyed by `cartSessionId` in an HttpOnly cookie, stored server-side until login merge or expiry.
_Avoid_: Anonymous user, localStorage cart (as canonical identity)

**Order**:
A committed supply request or purchase record with line items, fulfillment status, and payment status. Created at checkout by an authenticated User.
_Avoid_: Lead, quote (as separate v1 entity)

**Order type**:
Discriminator on Order: `purchase` (all lines have unit prices) vs `request-products` (any line without price — «пo запросу»). Set automatically at submit; admin may override.
_Avoid_: Order kind, order mode (in code identifiers)

**Order line**:
One product + quantity on an Order, with an optional unit price snapshot copied from `Product.price` at checkout. Null unit price means «пo запросу» for that line.
_Avoid_: CartItem (after checkout), OrderItem (OK in code/DB)

**Checkout customer type**:
Checkout selector: `individual` (physical person) or `legal_entity` (company / sole proprietor). Determines whether company requisites are shown and required; stored on Order at submit.
_Avoid_: Customer type (ambiguous with User), buyer kind (in code identifiers)

**Order contact snapshot**:
Copy of checkout contact fields frozen on Order at submit (name, email, phone, customer type, optional company/inn/position, customerNote). For `individual`, company/inn/position are null. Documents reflect details at order time even if the User later edits profile.
_Avoid_: Shipping address (v1 uses contact + optional company requisites, not delivery address)

**Order number**:
Public identifier formatted `SKM-{id}` from the Order database id.
_Avoid_: Order code, reference number (in user-facing copy without SKM prefix)

**Add to cart (PDP)**:
Primary commerce action on product detail. If `Product.price` is set — show price and button «В корзину»; if not — show «пo запросу» and button «Запросить поставку». Both labels add the product to Cart the same way.
_Avoid_: Separate quote flow (v1 — same Cart path)

**Fulfillment status**:
Order lifecycle for delivery/handling: `pending` → `processing` → `shipped` → `completed`, or `cancelled`.
_Avoid_: Order state (ambiguous with payment)

**Payment status**:
Separate from fulfillment: `pending_manual`, `paid_manual`, or `not_required`. v1 has no online payment. On submit: `purchase` → `pending_manual`; `request-products` → `not_required`.
_Avoid_: Payment state (without qualifier)

**Active order (profile)**:
An Order shown under `/profile/orders/active` — fulfillment status is `pending`, `processing`, or `shipped`.
_Avoid_: Open order, in-progress order (in code identifiers)

**Completed order (profile)**:
An Order shown under `/profile/orders/completed` — fulfillment status is `completed`. Cancelled orders are excluded from profile lists in v1.
_Avoid_: Closed order, delivered order (in user-facing copy)
