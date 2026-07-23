# Account & Header Profile — Design Spec

**Date:** 2026-07-23  
**Status:** Implemented  
**Scope:** Иконка профиля в header, меню входа/регистрации, личный кабинет с карточкой профиля

---

## Goal

Дать пользователю очевидный вход в auth-флоу с любой страницы сайта и полноценную страницу профиля в `/account`.

---

## UI

### Header (`SkmUserMenu`)

Компонент: `frontend/app/components/layout/SkmUserMenu.vue`

- Иконка `i-lucide-user` в desktop и mobile header (рядом с поиском)
- Popover (`SkmPopover`) с двумя состояниями:

| Состояние | Содержимое |
|-----------|------------|
| Гость | «Войти» → `/login`, «Регистрация» → `/register` |
| Авторизован | имя + email, «Личный кабинет» → `/account`, «Админ-панель» → `/admin` (если `hasAccessToAdmin`), «Выйти» |

При монтировании: `hydrate()` из `localStorage`, при наличии токена без user — `GET /auth/me`.

### Mobile nav (`SkmMobileNav`)

Дублирует блок «Аккаунт» в slideover-меню для удобства на маленьких экранах.

### Личный кабинет (`/account`)

- Middleware: `auth` (client-only, Bearer из `localStorage`)
- При открытии: `fetchMe()` для актуальных данных
- Layout: карточка профиля (имя, email, роли, id) + секция заказов (demo до этапа 6)
- Кнопки: «Админ-панель» (если permission), «Выйти»

---

## Auth flow (напоминание)

```
Гость → header popover → /login | /register
       → API /auth/login | /auth/register → tokens в localStorage
       → /account (middleware auth)
```

Токены: Bearer access + refresh в `localStorage` (`skm-auth`). Защита API — на backend.

---

## Related

- Auth RBAC: [2026-07-21-auth-roles-permissions-design.md](./2026-07-21-auth-roles-permissions-design.md)
- Frontend README: auth routes + header section
