# Verification patterns

Examples of mapping issue AC to evidence in this repo.

## Catalog read API (#4)

| AC pattern            | Look for                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| Prisma catalog models | `backend/prisma/schema.prisma` — `Manufacturer`, `Category`, `Product`                                     |
| Migration + seed      | `backend/prisma/migrations/*catalog*`, `catalog-seed-data.ts`                                              |
| Read endpoints        | `GET /api/catalog/manufacturers`, `/categories`, `/products`, `/products/:slug` in `catalog.controller.ts` |
| Public access         | `@Public()` on catalog routes                                                                              |

## Catalog frontend (#6)

| AC pattern      | Look for                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------- |
| SSR composables | `useCatalogData.ts`, `useCatalog.ts` with `await useAsyncData`                           |
| Pages wired     | `pages/catalog/[[...slug]].vue`, `pages/product/[slug].vue` — no `catalog-mocks` imports |
| Nav menus       | `SkmCatalogMenu.vue`, `SkmMobileNav.vue` use composables                                 |

## News read API (#7)

| AC pattern            | Look for                                                                |
| --------------------- | ----------------------------------------------------------------------- |
| News entity           | `NewsArticle` in schema; `slug`, `title`, `excerpt`, `body`, date field |
| Published filter      | `published: true` in `news.service.ts` list/detail queries              |
| Read endpoints        | `GET /api/news`, `/api/news/:slug`                                      |
| Seed matches Stage 1b | `news-seed-data.ts` — 3 articles                                        |
| Frontend SSR          | `useNewsData.ts`, `pages/news/*` — no `news-mocks` on pages             |
| 404 unknown slug      | `createError` on detail; service throws `NotFoundException`             |
| List API failure      | `createError` on index when fetch fails                                 |

## Commands (quick smoke)

```bash
cd backend && npm test && npm run build
cd frontend && npm run build
curl -s http://localhost:3001/api/news | head
```
