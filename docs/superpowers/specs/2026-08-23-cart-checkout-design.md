# Cart & Checkout — Design Spec

**Date:** 2026-08-23  
**Status:** Planned  
**Scope:** Stage 6 — guest/server Cart, authenticated checkout, Order creation, minimal email, admin order CRUD  
**Epic:** [#15](https://github.com/Leritas/skm-energo/issues/15)  
**Glossary:** `CONTEXT.md` → Commerce

---

## Problem Statement

Stub-маршруты `/cart` и `/checkout` показывают mock UX, но не создают заказы в БД. B2B-клиент не может собрать запрос на поставку из каталога, оформить его под своим аккаунтом и отследить статус; менеджер не видит заказы в админке. Profile P2 ([#22](https://github.com/Leritas/skm-energo/issues/22)) заблокирован отсутствием Order в PostgreSQL.

---

## Solution

Полноценный commerce-контур v1:

1. **Cart** — серверная корзина для Guest (cookie) и User; merge при login.
2. **Checkout** — только для авторизованных; snapshot B2B-реквизитов на Order.
3. **Order** — строки с optional unit price («пo запросу»); auto `type` + `paymentStatus`; номер `SKM-{id}`.
4. **Email** — подтверждение клиенту + notify ops при submit (minimal SMTP); полный MailService → TD4 ([#86](https://github.com/Leritas/skm-energo/issues/86)).
5. **Admin** — list/edit/manual create заказов.

Implementation slices: [#81](https://github.com/Leritas/skm-energo/issues/81)–[#85](https://github.com/Leritas/skm-energo/issues/85).

---

## User Stories

1. As a **Guest**, I want to add products to a cart while browsing, so that I can prepare a request before registering.
2. As a **Guest**, I want my cart to persist for several days, so that I do not lose selections between visits.
3. As a **Guest**, I want my cart merged into my account when I log in, so that I do not re-add items.
4. As an **authenticated User**, I want my cart tied to my account, so that I see the same cart on any device after login.
5. As a **User**, I want to see product price on PDP when the catalog has a price, so that I know the item is priced.
6. As a **User**, I want a «Запросить поставку» button when price is absent, so that B2B intent is clear — while still adding to the same cart.
7. As a **User**, I want a «В корзину» button when price is present, so that I can buy/request priced items uniformly.
8. As a **User**, I want to edit quantities and remove lines on `/cart`, so that I can fix mistakes before submit.
9. As a **User**, I want a warning when a cart line's product became unavailable, so that I know why checkout is blocked.
10. As a **User**, I want checkout blocked until unavailable lines are removed, so that I do not submit invalid requests.
11. As a **Guest** at checkout, I want to be redirected to login with return URL, so that I can authenticate and continue.
12. As an **authenticated User**, I want B2B fields prefilled on checkout, so that I do not retype company details.
13. As an **authenticated User**, I want to add a comment to my order, so that I can specify delivery context or object.
14. As an **authenticated User**, I want a success page with order number after submit, so that I have a reference for support.
15. As an **authenticated User**, I want my contact details snapshotted on the order, so that documents reflect what I submitted even if I later edit my profile.
16. As an **authenticated User**, I want an email confirmation on submit, so that I have written proof the request was received.
17. As **ops staff**, I want an internal email on new orders, so that I can respond without polling admin.
18. As a **moderator**, I want to list and open orders in admin, so that I can process client requests.
19. As a **moderator**, I want to change fulfillment status, so that clients see progress (via profile P2 later).
20. As a **moderator**, I want to set line prices and order type, so that I can turn a product request into a priced purchase.
21. As a **moderator**, I want to set payment status manually, so that I can record offline payment before online payments exist.
22. As a **moderator**, I want to create an order manually for a phone client, so that offline sales enter the same system.
23. As a **moderator**, I want to link manual orders to an existing User, so that the client sees orders in profile later.
24. As a **moderator**, I want to create a User in admin when none exists, so that phone orders still attach to an account.
25. As a **User**, I want a cart badge in the header, so that I see I have pending items without opening `/cart`.
26. As a **User**, I want catalog tiles to navigate to PDP without an add button, so that the B2B catalog stays uncluttered.
27. As a **User** with only unpriced lines, I want the order typed as `request-products` with no payment pending, so that the flow matches a quote request.
28. As a **User** with all lines priced, I want the order typed as `purchase` with `pending_manual` payment, so that payment can be tracked offline.
29. As **ops**, I want cancelled orders hidden from client profile lists in v1, so that the ЛК stays simple.

---

## Implementation Decisions

### Domain model

- **`Product.price`** — optional `Decimal`; null → «пo запросу» in public UI.
- **`Cart`** — `guestSessionId?`, `userId?`, `expiresAt`; one active cart per guest session / user.
- **`CartItem`** — `cartId`, `productId`, `quantity`; unique (cart, product).
- **`Order`** — `userId`, fulfillment `status`, `paymentStatus`, `type` (`purchase` | `request-products`), contact snapshot fields, `customerNote`, timestamps.
- **`OrderLine`** — `productId`, `quantity`, `unitPrice?` (snapshot at submit).

### Order type (auto + admin override)

```
type = all lines have unitPrice ? purchase : request-products
```

Admin may override via admin PATCH.

### Payment status on submit

```
paymentStatus = type === purchase ? pending_manual : not_required
```

Admin may set `paid_manual` later.

### Fulfillment status

Canonical enum matches UI `SkmOrderStatus`: `pending` | `processing` | `shipped` | `completed` | `cancelled`.  
On create: `pending`.

### Order number

Display `SKM-{id}` where `id` is Order primary key.

### Guest cart session

- HttpOnly cookie `cartSessionId` (UUID), max-age **7 days**.
- Server stores `Cart.guestSessionId`; `expiresAt` aligned with TTL.
- First cart mutation issues cookie.

### Cart merge on login/register

- Union by `productId`; **sum quantities** for duplicates.
- Delete guest cart row after merge; invalidate guest session cookie.

### Checkout auth

- Guest may view/edit cart.
- `POST /orders` requires JWT.
- `/checkout` redirects to `/login?returnTo=/checkout`.

### Checkout flow

- `/cart` — edit lines, summary, CTA to checkout.
- `/checkout` — stepper step 2; prefill User B2B fields; `customerNote`; submit.
- `/checkout/success` — stepper step 3; show `SKM-{id}`.

### Unavailable products in cart

- Unpublished or soft-deleted products: line remains, `isAvailable: false` on GET cart.
- Checkout/submit **blocked** until user removes unavailable lines.
- Add-to-cart rejects unavailable products.

### PDP commerce CTA

- `Product.price` set → show price + «В корзину».
- `Product.price` null → «пo запросу» + «Запросить поставку».
- Both actions call the same add-to-cart API.

### Contact snapshot on Order

At submit, copy from User: `name`, `email`, `company`, `phone`, `inn`, `position`, plus `customerNote` from form.

### Profile tab mapping (feeds #22)

- **Active:** `pending`, `processing`, `shipped`
- **Completed:** `completed`
- **Cancelled:** excluded from profile lists v1

### Permissions

- `hasAccessToOrders` — admin read
- `canManageOrders` — admin write + manual create

### Manual admin order

- Must select existing `userId` (email search).
- If no account — create User via existing admin users flow first.
- Only published products.

### Email v1 (minimal)

- On submit: customer confirmation + internal notify (`ORDERS_NOTIFY_EMAIL`).
- Env: `SMTP_*`, `ORDERS_FROM_EMAIL`, `ORDERS_NOTIFY_EMAIL`.
- Dev: log/console when SMTP unset.
- Status-change emails → TD4 ([#86](https://github.com/Leritas/skm-energo/issues/86)).

### Shared types

Export from `@skm/specs`: `OrderType`, fulfillment status, `PaymentStatus` — aligned with UI and Prisma.

### API surface (summary)

**Cart (guest cookie or JWT):** GET/PATCH/DELETE cart, POST/PATCH/DELETE items.

**Orders (JWT):** POST create from cart, GET list, GET detail (own orders only).

**Admin orders:** GET list, GET detail, POST manual create, PATCH update — permission-gated.

---

## Testing Decisions

**Primary seam:** HTTP integration tests against NestJS app + PostgreSQL (same pattern as catalog/media integration specs). One seam covers schema, service, guards, and cookie behavior without mocking Prisma internals.

**What to test (behavior, not internals):**

- Guest cart CRUD via cookie; authenticated cart by JWT.
- Merge on login: guest + user carts combine with summed qty.
- Reject add for unpublished product.
- GET cart marks unavailable lines; submit rejected while unavailable present.
- Order submit: snapshot fields, type/paymentStatus derivation, cart cleared.
- User GET orders scoped to self; admin routes respect permissions.

**Prior art:** `backend/test/*integration.spec.ts` (auth headers, Prisma seed per run, supertest).

**Frontend:** manual smoke for PDP/cart/checkout; no new E2E requirement in stage 6 (roadmap defers E2E).

---

## Out of Scope

- Online payment (Stage 11 / v2)
- Status-change email templates (TD4)
- Profile UI wiring ([#22](https://github.com/Leritas/skm-energo/issues/22)) — separate ticket after stage 6
- Reviews ([#23](https://github.com/Leritas/skm-energo/issues/23)), favorites ([#24](https://github.com/Leritas/skm-energo/issues/24))
- Catalog tile add-to-cart
- Guest checkout without User account
- Shipping address entity (B2B requisites only)
- SSR-safe auth ([#20](https://github.com/Leritas/skm-energo/issues/20)) — client-only middleware accepted for v1

---

## Further Notes

- Grilling transcript: [#15 comment](https://github.com/Leritas/skm-energo/issues/15#issuecomment-5386127520)
- Tickets: [#81](https://github.com/Leritas/skm-energo/issues/81) (frontier) → [#82](https://github.com/Leritas/skm-energo/issues/82), [#83](https://github.com/Leritas/skm-energo/issues/83) → [#84](https://github.com/Leritas/skm-energo/issues/84), [#85](https://github.com/Leritas/skm-energo/issues/85); TD4 [#86](https://github.com/Leritas/skm-energo/issues/86)
- Existing UI kit: `SkmCartLine`, `SkmCartSummary`, `SkmStepper`, `SkmOrderCard`, `SkmOrderStatusBadge` — wire, do not redesign
- Stage 6 unblocks Profile P2 orders API
