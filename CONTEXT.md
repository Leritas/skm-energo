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
Preview route outside current stage criteria (cart, profile, checkout). Kept for UX preview.
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
A product from another manufacturer shown on PDP as a cross-brand alternative. Separate card, not a shared listing.
_Avoid_: Analogue, cross-sell
