# Personal Profile — Design & Roadmap

**Date:** 2026-07-30  
**Status:** P0 ✅ + P1 ✅ (2026-08-17); P2–P4 planned  
**Scope:** Nested `/profile/*` кабинет; P0 shell + P1 profile API done; orders/reviews/favorites on mocks until P2–P4

---

## Goal

Заменить stub `/account` на полноценный личный кабинет `/profile` с разделами: данные, заказы (active / completed / purchased + отзывы), избранное. P0 — только фронт-шелл на mock-данных и UI kit. Без аватарок (B2B).

---

## Decisions

| Topic | Choice |
|-------|--------|
| Base path | `/profile` (не `/account`) |
| Routing | Nested Nuxt routes + shared layout (вариант A) |
| P0 data | Mock + auth store для name/email |
| Email in form | Read-only; смена — отдельный безопасный флоу (P6) |
| Info editable (UI) | Имя, телефон, компания, ИНН, должность + смена пароля |
| Favorites v1 | Только товары; новости — later (P5) |
| Reviews UX | `SkmReviewCard` с `editMode`: textarea + звёзды слева + «Оценить» справа |
| Avatar | Нет |

---

## Routes

```
/profile                      → redirect → /profile/info
/profile/info
/profile/orders               → redirect → /profile/orders/active
/profile/orders/active
/profile/orders/completed
/profile/orders/purchased
/profile/favorite
/account, /account/*          → redirect → /profile (compat)
```

Все `/profile/**` — middleware `auth` (client-only, Bearer/`localStorage`).

---

## Layout

Desktop: боковой nav (Данные / Заказы / Избранное) + «Выйти»; mobile: горизонтальные табы сверху.  
Шапка секции: имя + email (read-only), **без аватара**.  
Header `SkmUserMenu` / mobile nav: «Личный кабинет» → `/profile`.

```
┌─────────────────────────────────────────────────────────┐
│ Header (site)                                           │
├──────────────┬──────────────────────────────────────────┤
│ Профиль      │  <NuxtPage />                            │
│ ○ Данные     │                                          │
│ ○ Заказы     │                                          │
│ ○ Избранное  │                                          │
│ [Выйти]      │                                          │
└──────────────┴──────────────────────────────────────────┘
```

---

## Sections (P0 UI)

### `/profile/info`

1. **Контактные / B2B** — email (read-only + hint «логин»), имя, телефон, компания, ИНН, должность; «Сохранить» → **live API** (`PATCH /profile`).  
2. **Смена пароля** — текущий / новый / повтор; «Изменить пароль» → **live API**; все refresh tokens revoked → re-login.  
Prefill name/email и B2B fields из auth store / `/auth/me`.

### `/profile/orders/*`

Вторичные табы: Активные | Завершённые | Вы покупали. Empty-states.

| Tab | Content (mock) |
|-----|----------------|
| `active` | `SkmOrderCard` in-progress |
| `completed` | завершённые заказы |
| `purchased` | товары из прошлых заказов + отзывы |

**Purchased + reviews:**  
- есть отзыв → `SkmReviewCard` (read);  
- нет → `SkmReviewCard` `editMode=true`: textarea; ряд: звёзды 1–5 слева, кнопка «Оценить» справа; `@submit` → toast + локальный switch в read (mock).

### `/profile/favorite`

Сетка карточек товаров (название, краткое описание, link stub, «Убрать»). Empty-state → `/catalog`. Только товары.

---

## UI kit changes (P0)

**`SkmReviewCard`:** prop `editMode?: boolean`.

| Mode | UI |
|------|-----|
| `false` | author, date, stars, text (current) |
| `true` | `SkmTextarea`; bottom row: interactive 1–5 stars + `SkmButton` «Оценить»; emit `submit({ rating, text })` |

Storybook: read + editMode stories.

---

## Roadmap phases

| Phase | Scope | Status |
|-------|--------|--------|
| **P0 — Shell** | Routes, layout, mock pages, ReviewCard editMode, redirects, header links | ✅ |
| **P1 — Profile API** | User B2B fields; PATCH profile; change password | ✅ |
| **P2 — Orders API** | Real orders → active/completed; purchased = unique products from completed | ⏳ blocked by Stage 6 |
| **P3 — Reviews API** | User review on purchased product; wire editMode submit | ⏳ after P2 |
| **P4 — Favorites API** | Persist favorites; catalog heart toggle | ⏳ after live catalog |
| **P5 — later** | Favorite news (optional) | — |
| **P6 — end** | Secure email change (verify old/new; not in info form) | — |

### Out of scope (all phases unless noted)

- Avatars / photo upload  
- Email change in P0–P5 info form  
- Polished admin for user profiles  

---

## File sketch (P0)

```
frontend/app/pages/profile.vue              # layout shell + nav + NuxtPage
frontend/app/pages/profile/info.vue
frontend/app/pages/profile/orders.vue       # secondary tabs + NuxtPage / redirect
frontend/app/pages/profile/orders/active.vue
frontend/app/pages/profile/orders/completed.vue
frontend/app/pages/profile/orders/purchased.vue
frontend/app/pages/profile/favorite.vue
frontend/app/pages/account/index.vue        # redirect → /profile (or remove + routeRules)
frontend/app/components/ui/SkmReviewCard/   # editMode
frontend/app/components/layout/SkmUserMenu.vue  # /profile links
```

Mock data: `frontend/app/constants/profile-mocks.ts` (или рядом с pages).

---

## Related

- Header stub: [2026-07-23-account-profile-header.md](./2026-07-23-account-profile-header.md) — superseded path `/account` → `/profile`  
- Auth: [2026-07-21-auth-roles-permissions-design.md](./2026-07-21-auth-roles-permissions-design.md)  
- Product roadmap этап 7: этот документ
