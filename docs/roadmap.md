# SKM-Energo — Roadmap

План переработки сайта [skmenergo.ru](https://skmenergo.ru) / [skm-energoservice.ru](https://skm-energoservice.ru).

## Принятые решения

| Решение     | Выбор                                                           |
| ----------- | --------------------------------------------------------------- |
| Frontend    | Nuxt (SSR), Vue 3, TypeScript, Pinia, Tailwind                  |
| Backend     | NestJS REST API                                                 |
| БД          | PostgreSQL + Prisma (этап 2)                                    |
| Админка     | `/admin` в Nuxt                                                 |
| v1 scope    | E-commerce: регистрация, корзина, заказы, ЛК + админка          |
| Контент     | Не мигрируем ~747 страниц; админка для добавления данных        |
| Оплата v1   | Ручная обработка менеджером; задел под онлайн-оплату в v2       |
| Черновик БД | [db-draft.sql](./db-draft.sql) — reference, не migration source |

---

## Анализ текущего сайта

Сайт 2016 года — статический HTML-каталог с PHP-формами (`call.php`, `send_msg.php`, kCaptcha). ~747 страниц в sitemap.

### Навигация

```
Главная
├── Продукция и производители
│   ├── MERSEN (9 линеек: предохранители, рубильники, разъединители…)
│   ├── CASRAM
│   ├── Lampar
│   └── HIITIO (6 подразделов + PDF-каталог)
├── Виды осуществляемых работ
├── Новости
└── Контакты
```

### Функционал

| Есть сейчас                    | Нет сейчас     |
| ------------------------------ | -------------- |
| Каталог, breadcrumbs, sidebar  | Корзина, ЛК    |
| Поиск (POST)                   | Онлайн-оплата  |
| «Заказать звонок»              | Админка        |
| Форма обратной связи + captcha | API / SSR      |
| Новости (минимально)           | Отзывы, заказы |

Карточка товара: заголовок, фото, PDF — без цены и «купить».

---

## Целевая архитектура

```
Браузер → Nuxt SSR (frontend) → NestJS API → PostgreSQL
                ↓
            /admin (JWT + hasAccessToAdmin)
```

Подробнее: [README.md](../README.md).

---

## Доработки схемы БД (относительно db-draft.sql)

Черновик [db-draft.sql](./db-draft.sql) покрывает базовые сущности. Для e-commerce и админки на этапе 2 добавить:

- **Manufacturer** — производитель (MERSEN, HIITIO…)
- **Product:** `slug`, `isPublished`, `seoTitle`, `seoDescription`, `manufacturerId`, `priceOnRequest`
- **Category:** `slug`, `sortOrder`, `isPublished`
- **Cart / CartItem** — guest session + merge при логине
- **Order:** `shippingAddress`, `customerNote`, `paymentStatus`, `paymentProvider`
- **News:** `slug`, `isPublished`, `coverImage`
- **Lead** — заявки «заказать звонок» и обратная связь
- **MediaFile** — унифицированное хранение фото/PDF
- VIEW и FUNCTION из SQL — перенести в Prisma-запросы

---

## GitHub issues

Parent epics для этапов 1–10: [#10](https://github.com/Leritas/skm-energo/issues/10) … [#19](https://github.com/Leritas/skm-energo/issues/19). Implementation slices — sub-issues с native `blocked_by`.

| Этап | Epic                                                                                                          | Frontier / sub-issues                                                                                                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [#10](https://github.com/Leritas/skm-energo/issues/10)                                                        | [#5](https://github.com/Leritas/skm-energo/issues/5) docs closure ✅                                                                                                                                                         |
| 2    | [#11](https://github.com/Leritas/skm-energo/issues/11) ✅                                                     | [#4](https://github.com/Leritas/skm-energo/issues/4) catalog API ✅, [#7](https://github.com/Leritas/skm-energo/issues/7) news ✅                                                                                            |
| 3    | [#12](https://github.com/Leritas/skm-energo/issues/12) ✅                                                     | —                                                                                                                                                                                                                            |
| 4    | [#13](https://github.com/Leritas/skm-energo/issues/13)                                                        | (slices TBD)                                                                                                                                                                                                                 |
| 5    | [#14](https://github.com/Leritas/skm-energo/issues/14)                                                        | [#70](https://github.com/Leritas/skm-energo/issues/70)–[#73](https://github.com/Leritas/skm-energo/issues/73), [#67](https://github.com/Leritas/skm-energo/issues/67)–[#69](https://github.com/Leritas/skm-energo/issues/69) |
| 6    | [#15](https://github.com/Leritas/skm-energo/issues/15)                                                        | (slices TBD)                                                                                                                                                                                                                 |
| 7    | [#16](https://github.com/Leritas/skm-energo/issues/16)                                                        | [#21](https://github.com/Leritas/skm-energo/issues/21)–[#24](https://github.com/Leritas/skm-energo/issues/24)                                                                                                                |
| 8–10 | [#17](https://github.com/Leritas/skm-energo/issues/17)–[#19](https://github.com/Leritas/skm-energo/issues/19) | [#20](https://github.com/Leritas/skm-energo/issues/20) SSR auth → #19                                                                                                                                                        |

Этап 0 и этап 11 (v2) — только в этом документе, без parent epic.

---

## Политики

### Stub pages (preview routes)

Маршруты вне критериев текущего этапа — **preview UX**, не блокер закрытия этапа 1:

| Route                | Назначение                    | Данные                            | Sitemap              |
| -------------------- | ----------------------------- | --------------------------------- | -------------------- |
| `/cart`, `/checkout` | Корзина / оформление          | mock / placeholder                | исключить до этапа 6 |
| `/profile/**`        | ЛК (shell ✅, P1 info API ✅) | orders/favorites — mocks до P2–P4 | исключить            |
| `/admin`             | Админ-панель                  | stub до этапа 4                   | исключить            |

**Dev-copy:** на **публичных** страницах этапа 1b (`/`, `/about`, `/services`, `/contacts`, `/catalog/**`, `/news/**`, `/product/[slug]`) — без «этап N roadmap», «mock», «stub». На stub-маршрутах допустим preview-copy до соответствующего этапа.

### Отложено (не потеряно)

| Решение               | Когда                                                            | Примечание                                                                     |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Category taxonomy v2  | После live catalog                                               | Пересборка дерева категорий с нуля (не копия manufacturer-first старого сайта) |
| E2E smoke tests       | После #4 (live data)                                             | Playwright/regression на mock не приоритет                                     |
| SSR-safe auth session | Этап 10 / [#20](https://github.com/Leritas/skm-energo/issues/20) | Client-only middleware принят для v1                                           |

---

## Этапы реализации

### Этап 0 — Фундамент монорепы ✅

**Цель:** запускаемый dev-окружение, документация.

- [x] Nuxt SSR в `frontend/`
- [x] NestJS в `backend/` (`GET /api/health`, Swagger)
- [x] `docker-compose.yml` — PostgreSQL
- [x] README (root, frontend, backend)
- [x] Prisma placeholder
- [x] `docs/db-draft.sql`

**Критерий:** `docker compose up`, dev-сервера, SSR + health OK.

---

### Этап 1 — Дизайн-система и публичный каркас ✅

#### 1a — Design System ✅

- SKM UI Kit (primitives) + Domain UI + Layout shell
- Storybook, ESLint guardrail, `@skm/components`
- Specs: [2026-07-13-skm-ui-kit-design.md](./superpowers/specs/2026-07-13-skm-ui-kit-design.md), [2026-07-20-skm-ui-kit-roadmap.md](./superpowers/specs/2026-07-20-skm-ui-kit-roadmap.md)

#### 1b — Public shell ✅

- Layout: header (catalog dropdown), footer, breadcrumbs
- Pages: `/`, `/about`, `/services`, `/contacts`, `/catalog/**`, `/news/**`, `/product/[slug]`
- Category-first catalog + optional manufacturer filter (mock data, ~18 products)
- SEO: `useSeoMeta`, sitemap, robots.txt
- Публичные страницы без dev-copy; формы → neutral success
- Stub pages (cart, profile, …) — preview only, не критерий этапа

**Критерий:** публичный сайт выглядит как prod на mock-данных; README/roadmap синхронизированы.

**GitHub:** [#10](https://github.com/Leritas/skm-energo/issues/10) ✅

**Ориентир:** 3–5 дней (1a выполнен ранее)

---

### Этап 2 — База данных и Prisma ✅

- Prisma schema на основе [db-draft.sql](./db-draft.sql) + расширения выше
- Миграции, seed (2–3 производителя, дерево категорий, 5–10 товаров, новости)
- NestJS Prisma module, repository/service паттерны
- Read API: catalog + news (замена mock constants)

**GitHub:** [#11](https://github.com/Leritas/skm-energo/issues/11) — [#4](https://github.com/Leritas/skm-energo/issues/4), [#7](https://github.com/Leritas/skm-energo/issues/7) ✅

**Ориентир:** 2–3 дня

---

### Этап 3 — Аутентификация и роли (RBAC) ✅

- [x] Регистрация / вход / refresh token (JWT Bearer)
- [x] Permissions — хардкод в `@skm/specs`; роли — динамические наборы в БД (M2M User↔Role)
- [x] `hasAbsoluteControl` обходит остальные проверки; иначе AND по `@RequirePermissions`
- [x] Guards: `/profile/*` (сессия; `/account` → redirect), `/admin/*` (`hasAccessToAdmin`)
- [x] Users & Roles API; seed roles user/moderator/admin
- [x] Frontend: Pinia auth store, middleware `auth` / `admin`, login/register
- Спека: [superpowers/specs/2026-07-21-auth-roles-permissions-design.md](./superpowers/specs/2026-07-21-auth-roles-permissions-design.md)
- Plan: [superpowers/plans/2026-07-21-auth-roles-permissions.md](./superpowers/plans/2026-07-21-auth-roles-permissions.md) ✅

**Known limitation:** auth middleware client-only (SSR flash on hard refresh) — deferred [#20](https://github.com/Leritas/skm-energo/issues/20).

**GitHub:** [#12](https://github.com/Leritas/skm-energo/issues/12) ✅

**Ориентир:** 3–4 дня

---

### Этап 4 — Админка `/admin` (контент)

- CRUD: производители, категории (дерево), товары, новости
- Медиа-библиотека (upload/delete)
- Dashboard: заказы, заявки

**GitHub:** [#13](https://github.com/Leritas/skm-energo/issues/13)

**Ориентир:** 7–10 дней

---

### Этап 5 — Публичный каталог (PostgreSQL + медиа 4b)

**Не delta «подключить API к mock-UI».** Этап 1b дал маршруты и UX-каркас на mocks; этап 5 — **пересборка публичного каталога** на данных из `/admin` и Stage 4b media (`AttachedFile`: фото/PDF товара, cover категории, публичные URL).

**Grilling (2026-08-20):** published tree + product-subtree prune; manufacturer filter сужает дерево; flat URLs; category page = две секции (subcategory tiles / product tiles); prototype → implement; #46 out.

**Spec:** [2026-08-20-public-catalog-rebuild.md](./superpowers/specs/2026-08-20-public-catalog-rebuild.md) · **ADR:** [0001-visible-catalog-taxonomy.md](./adr/0001-visible-catalog-taxonomy.md)

**Scope (этап 5):**

| Slice                     | Issues                                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Prototypes (design gate)  | [#70](https://github.com/Leritas/skm-energo/issues/70) category tiles, [#71](https://github.com/Leritas/skm-energo/issues/71) PDP |
| Taxonomy + category pages | [#67](https://github.com/Leritas/skm-energo/issues/67) — data layer сразу; visual после #70                                       |
| Header / mobile nav       | [#72](https://github.com/Leritas/skm-energo/issues/72)                                                                            |
| PDP rebuild (4b media)    | [#73](https://github.com/Leritas/skm-energo/issues/73) — после #71                                                                |
| Search                    | [#68](https://github.com/Leritas/skm-energo/issues/68)                                                                            |
| Similar strip             | [#69](https://github.com/Leritas/skm-energo/issues/69) — на новом PDP (#73)                                                       |
| News live data            | [#7](https://github.com/Leritas/skm-energo/issues/7) ✅                                                                           |

**Superseded:** [#6](https://github.com/Leritas/skm-energo/issues/6), [#8](https://github.com/Leritas/skm-energo/issues/8), [#9](https://github.com/Leritas/skm-energo/issues/9) — delta поверх 1b; acceptance not met.

**GitHub:** [#14](https://github.com/Leritas/skm-energo/issues/14)

**Ориентир:** 5–7 дней

---

### Этап 6 — Корзина и оформление заказа

- Guest cart + merge при авторизации
- `/cart`, `/checkout`
- Оплата v1: `pending_manual`
- Email-уведомления
- Админка: управление заказами

**GitHub:** [#15](https://github.com/Leritas/skm-energo/issues/15) — blocks profile P2 ([#22](https://github.com/Leritas/skm-energo/issues/22))

**Ориентир:** 5–7 дней

---

### Этап 7 — Личный кабинет клиента (`/profile`)

#### P0 — Shell ✅

- Nested `/profile/info`, `/profile/orders/{active,completed,purchased}`, `/profile/favorite`
- Layout, mocks, `SkmReviewCard` editMode, redirects `/account` → `/profile`

#### P1 — Profile API ✅

- User B2B fields (phone, company, inn, position); `PATCH /profile`; change password
- `/profile/info` on live API (change password revokes refresh tokens → re-login)

#### P2–P4 — ⏳

- **P2** Orders from API — blocked by этап 6 (корзина/заказы)
- **P3** Reviews API — after P2
- **P4** Favorites API — after live catalog (этап 5 / #67)

- Спека: [superpowers/specs/2026-07-30-personal-profile-design.md](./superpowers/specs/2026-07-30-personal-profile-design.md)
- GitHub: [#16](https://github.com/Leritas/skm-energo/issues/16)

**Ориентир:** P0–P1 done; P2–P4 по фазам в спеке

---

### Этап 8 — Формы и лиды

- «Заказать звонок» (модалка)
- Форма на `/contacts`
- Captcha (Turnstile / reCAPTCHA)
- Админка: просмотр лидов

**GitHub:** [#17](https://github.com/Leritas/skm-energo/issues/17)

**Ориентир:** 2–3 дня

---

### Этап 9 — Поставщики и логистика

- CRUD поставщиков
- Product ↔ Supplier
- Учёт остатков, оповещения

**GitHub:** [#18](https://github.com/Leritas/skm-energo/issues/18)

**Ориентир:** 2–3 дня

---

### Этап 10 — Production-ready

- Docker multi-stage build
- CI: lint, typecheck, test
- Yandex Metrika
- 301-redirect со старых `.html` URL
- Rate limiting, логирование
- SSR-safe auth ([#20](https://github.com/Leritas/skm-energo/issues/20))

**GitHub:** [#19](https://github.com/Leritas/skm-energo/issues/19)

**Ориентир:** 3–5 дней

---

### Этап 11 (v2) — Онлайн-оплата

- Абстракция `PaymentProvider`
- Интеграция ЮKassa (или аналог)
- Webhook → `Order.paymentStatus`
- Страницы success/failure

**Ориентир:** 5–7 дней

---

## Оценка объёма

| Этап                                 | Ориентир  | Сложность |
| ------------------------------------ | --------- | --------- |
| 0. Инициализация                     | 1–2 дня   | Низкая    |
| 1. Каркас UI                         | 3–5 дней  | Средняя   |
| 2. Prisma + seed                     | 2–3 дня   | Средняя   |
| 3. Auth                              | 3–4 дня   | Средняя   |
| 4. Админка                           | 7–10 дней | Высокая   |
| 5. Публичный каталог (PG + media 4b) | 5–7 дней  | Средняя   |
| 6. Корзина + заказы                  | 5–7 дней  | Высокая   |
| 7. ЛК + отзывы                       | 3–4 дня   | Средняя   |
| 8. Формы/лиды                        | 2–3 дня   | Низкая    |
| 9. Поставщики                        | 2–3 дня   | Средняя   |
| 10. Production                       | 3–5 дней  | Средняя   |
| 11. Оплата v2                        | 5–7 дней  | Высокая   |

**Итого v1 (этапы 0–10):** ~6–10 недель для одного разработчика.

---

## Риски

- **Scope v1 амбициозный** — строго следовать этапам
- **747 страниц** — не блокируют запуск; slug-стратегия закладывается сразу
- **B2B:** цены «по запросу» — `priceOnRequest` в Product
- **Файлы:** абстракция StorageService с первого дня (local → S3)
