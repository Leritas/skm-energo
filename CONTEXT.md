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
The single manufacturer of a product card. One product = one manufacturer = one SKU + Document set.
_Avoid_: Vendor, supplier (in code)

**Similar product**:
A product from another manufacturer shown on PDP as a cross-brand alternative. Separate card, not a shared listing.
_Avoid_: Analogue, cross-sell

**Document**:
A downloadable file attached to a catalog entity (technical documentation, certificate, …). A Product holds an ordered Document set — many Documents, not one link. People tell Documents apart by the original filename, not a separate kind. Sequence is manager-set, not alphabetical. In v1 a Document exists only while attached; there is no unattached pool. Display images are Photos, not Documents.
_Avoid_: MediaFile, pdfHref, file (when meaning this), PDF set, Document kind / type enum

**Photo**:
A display image attached to a catalog entity: an ordered Product gallery (the first Photo is the listing image), a News cover, or a Category image. Not a downloadable Document. In v1 a Photo exists only while attached; there is no unattached pool.
_Avoid_: MediaFile, image URL / path as the stored concept, cover as a raw path, product cover, primary Photo

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
