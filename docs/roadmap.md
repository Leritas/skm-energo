# SKM-Energo — Roadmap

План переработки сайта [skmenergo.ru](https://skmenergo.ru) / [skm-energoservice.ru](https://skm-energoservice.ru).

## Принятые решения

| Решение | Выбор |
|---------|-------|
| Frontend | Nuxt (SSR), Vue 3, TypeScript, Pinia, Tailwind |
| Backend | NestJS REST API |
| БД | PostgreSQL + Prisma (этап 2) |
| Админка | `/admin` в Nuxt |
| v1 scope | E-commerce: регистрация, корзина, заказы, ЛК + админка |
| Контент | Не мигрируем ~747 страниц; админка для добавления данных |
| Оплата v1 | Ручная обработка менеджером; задел под онлайн-оплату в v2 |
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

| Есть сейчас | Нет сейчас |
|-------------|------------|
| Каталог, breadcrumbs, sidebar | Корзина, ЛК |
| Поиск (POST) | Онлайн-оплата |
| «Заказать звонок» | Админка |
| Форма обратной связи + captcha | API / SSR |
| Новости (минимально) | Отзывы, заказы |

Карточка товара: заголовок, фото, PDF — без цены и «купить».

---

## Целевая архитектура

```
Браузер → Nuxt SSR (frontend) → NestJS API → PostgreSQL
                ↓
            /admin (JWT admin)
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

### Этап 1 — Дизайн-система и публичный каркас

- Layout: header, footer, breadcrumbs
- Страницы: `/`, `/about`, `/services`, `/contacts`, `/catalog`
- SEO: `useSeoMeta`, sitemap, robots.txt
- Адаптивная вёрстка (mobile-first)
- Референс меню — со старого сайта

**Ориентир:** 3–5 дней

---

### Этап 2 — База данных и Prisma

- Prisma schema на основе [db-draft.sql](./db-draft.sql) + расширения выше
- Миграции, seed (2–3 производителя, дерево категорий, 5–10 товаров)
- NestJS Prisma module, repository/service паттерны

**Ориентир:** 2–3 дня

---

### Этап 3 — Аутентификация и роли

- Регистрация / вход / refresh token
- Роли `admin` | `client`
- Guards: `/account/*` (client), `/admin/*` (admin)
- Профиль пользователя

**Ориентир:** 3–4 дня

---

### Этап 4 — Админка `/admin` (контент)

- CRUD: производители, категории (дерево), товары, новости
- Медиа-библиотека (upload/delete)
- Dashboard: заказы, заявки

**Ориентир:** 7–10 дней

---

### Этап 5 — Публичный каталог

- `/catalog`, `/catalog/[...slug]`, `/product/[slug]`
- Поиск (PostgreSQL full-text / pg_trgm)
- SSR для SEO

**Ориентир:** 5–7 дней

---

### Этап 6 — Корзина и оформление заказа

- Guest cart + merge при авторизации
- `/cart`, `/checkout`
- Оплата v1: `pending_manual`
- Email-уведомления
- Админка: управление заказами

**Ориентир:** 5–7 дней

---

### Этап 7 — Личный кабинет клиента

- `/account` — профиль, история заказов
- Отзывы к товарам
- Повтор заказа (опционально)

**Ориентир:** 3–4 дня

---

### Этап 8 — Формы и лиды

- «Заказать звонок» (модалка)
- Форма на `/contacts`
- Captcha (Turnstile / reCAPTCHA)
- Админка: просмотр лидов

**Ориентир:** 2–3 дня

---

### Этап 9 — Поставщики и логистика

- CRUD поставщиков
- Product ↔ Supplier
- Учёт остатков, оповещения

**Ориентир:** 2–3 дня

---

### Этап 10 — Production-ready

- Docker multi-stage build
- CI: lint, typecheck, test
- Yandex Metrika
- 301-redirect со старых `.html` URL
- Rate limiting, логирование

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

| Этап | Ориентир | Сложность |
|------|----------|-----------|
| 0. Инициализация | 1–2 дня | Низкая |
| 1. Каркас UI | 3–5 дней | Средняя |
| 2. Prisma + seed | 2–3 дня | Средняя |
| 3. Auth | 3–4 дня | Средняя |
| 4. Админка | 7–10 дней | Высокая |
| 5. Каталог | 5–7 дней | Высокая |
| 6. Корзина + заказы | 5–7 дней | Высокая |
| 7. ЛК + отзывы | 3–4 дня | Средняя |
| 8. Формы/лиды | 2–3 дня | Низкая |
| 9. Поставщики | 2–3 дня | Средняя |
| 10. Production | 3–5 дней | Средняя |
| 11. Оплата v2 | 5–7 дней | Высокая |

**Итого v1 (этапы 0–10):** ~6–10 недель для одного разработчика.

---

## Риски

- **Scope v1 амбициозный** — строго следовать этапам
- **747 страниц** — не блокируют запуск; slug-стратегия закладывается сразу
- **B2B:** цены «по запросу» — `priceOnRequest` в Product
- **Файлы:** абстракция StorageService с первого дня (local → S3)
