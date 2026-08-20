# ADR-0001: Visible catalog taxonomy (product-subtree prune)

**Date:** 2026-08-20  
**Status:** Accepted  
**Context:** Stage 5 public catalog rebuild ([#14](https://github.com/Leritas/skm-energo/issues/14))

## Decision

The public catalog exposes a **visible category tree**: published categories pruned when their subtree contains no published products matching the active catalog filter (all manufacturers, or one manufacturer when `?manufacturer=` is set). The same tree is the single source for navigation, slug validation, and breadcrumbs. Flat URLs `/catalog/{slug}`; hierarchy appears only in breadcrumbs.

Manufacturer filter changes always navigate to catalog root with the filter applied.

## Rationale

Grilling rejected two alternatives:

1. **Full published tree with empty states** — shows categories with zero assortment; poor UX for B2B catalog where categories exist to hold products.
2. **Product-filtered tree for display but separate validation** — caused 404 drift between admin, API, dropdown, and page (the Stage 5 bug).

Product-subtree prune matches legacy site behavior (hide empty branches) while keeping admin publish model: staff publish categories and products; public site only surfaces branches that lead to products.

## Consequences

- Leaf category published but with no published products → not in tree → direct URL 404 (expected).
- Client must not maintain a second category source (e.g. “all categories” vs “visible”).
- `GET /catalog/categories` semantics are navigation/validation, not admin CRUD tree.
- Manufacturer filter is a catalog filter, not a navigation axis (#46 deferred).

## References

- Spec: [docs/superpowers/specs/2026-08-20-public-catalog-rebuild.md](../superpowers/specs/2026-08-20-public-catalog-rebuild.md)
- Implementation: `filterVisibleCategoryTree` in catalog taxonomy module
