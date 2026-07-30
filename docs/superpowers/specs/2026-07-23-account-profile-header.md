# Account & Header Profile — Design Spec

**Date:** 2026-07-23  
**Status:** Implemented (path superseded)  
**Scope:** Иконка профиля в header, меню входа/регистрации; кабинет переехал на `/profile`

> **Update 2026-07-30.** Маршрут ЛК: `/account` → `/profile`. Актуальный дизайн и roadmap: [2026-07-30-personal-profile-design.md](./2026-07-30-personal-profile-design.md). `/account` остаётся redirect для совместимости.

---

## Goal

Дать пользователю очевидный вход в auth-флоу с любой страницы сайта и точку входа в личный кабинет.

---

## UI

### Header (`SkmUserMenu`)

Компонент: `frontend/app/components/layout/SkmUserMenu.vue`

- Иконка `i-lucide-user` в desktop и mobile header (рядом с поиском)
- Popover (`SkmPopover`) с двумя состояниями:

| Состояние | Содержимое |
|-----------|------------|
| Гость | «Войти» → `/login`, «Регистрация» → `/register` |
| Авторизован | имя + email, «Личный кабинет» → `/profile`, «Админ-панель» → `/admin` (если `hasAccessToAdmin`), «Выйти» |

При монтировании: `hydrate()` из `localStorage`, при наличии токена без user — `GET /auth/me`.

### Mobile nav (`SkmMobileNav`)

Дублирует блок «Аккаунт» в slideover-меню.

### Личный кабинет

См. [personal profile design](./2026-07-30-personal-profile-design.md) — nested `/profile/*`.

---

## Auth flow (напоминание)

```
Гость → header popover → /login | /register
       → API /auth/login | /auth/register → tokens в localStorage
       → /profile (middleware auth)
```

Токены: Bearer access + refresh в `localStorage` (`skm-auth`). Защита API — на backend.

---

## Related

- Profile roadmap: [2026-07-30-personal-profile-design.md](./2026-07-30-personal-profile-design.md)
- Auth RBAC: [2026-07-21-auth-roles-permissions-design.md](./2026-07-21-auth-roles-permissions-design.md)
- Frontend README: auth routes + header section
