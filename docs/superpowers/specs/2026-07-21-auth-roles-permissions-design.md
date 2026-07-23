# Auth, Roles & Permissions — Design Spec

**Date:** 2026-07-21  
**Status:** Approved for implementation  
**Scope:** JWT Bearer auth, hardcoded permissions in `@skm/specs`, dynamic roles in DB, Nest guards + minimal Nuxt client (no polished roles admin UI)

---

## Goal

Заменить упрощённую модель `admin | client` на RBAC: конечные права (permissions) заданы в коде, роли — именованные наборы permissions в PostgreSQL. Пользователь может иметь несколько ролей; эффективные права — union. Проверка на API через JWT + `@RequirePermissions()`.

---

## Decisions

| Topic | Choice |
|-------|--------|
| Permissions storage | TypeScript const/enum in `@skm/specs` |
| Roles storage | DB `Role.permissions String[]` validated against catalog |
| User ↔ Role | Many-to-many (`UserRole`) |
| Superuser bypass | `hasAbsoluteControl` skips other permission checks |
| JWT payload | Access: `sub` (userId) only; permissions loaded from DB per request |
| Token transport | Bearer access + refresh in JSON body; frontend Pinia + `localStorage` |
| Registration | Public → role `user`; staff via `POST /users` (`canCreateUsers`) |
| Unauthenticated | `guest` is not a DB role — absence of JWT |
| Shared types | Package `@skm/specs` via `file:../skm-specs` |

---

## Permission catalog (initial)

Defined in `skm-specs/src/permissions.ts`:

- `hasAbsoluteControl`
- `hasAccessToAdmin`
- `canCreateRoles`, `canManageRoles`
- `canCreateUsers`, `canDeleteUsers`, `canManageUserRoles`
- `hasAccessToOrders`, `canManageOrders`
- `hasAccessToNews`, `canManageNews`
- `canCreateItems`, `canManageItems`

Helpers: `ALL_PERMISSIONS`, `hasPermission()`, `hasAbsoluteControl()`, `hasAllPermissions()`.

---

## Data model

```
User 1──* UserRole *──1 Role
User 1──* RefreshToken
```

- `Role.slug` unique (`user`, `moderator`, `admin`, custom)
- `Role.isSystem` — system roles cannot be deleted
- `Role.permissions` — subset of catalog strings
- `RefreshToken.tokenHash` — store hash only; rotate on refresh

### Seed roles

| Slug | Permissions |
|------|-------------|
| `user` | (none) — authenticated customer |
| `moderator` | `hasAccessToAdmin`, news + orders access/manage |
| `admin` | all permissions including `hasAbsoluteControl` |

Seed admin user from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

---

## API contract

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | public | Assigns `user` role |
| POST | `/api/auth/login` | public | Returns tokens + user |
| POST | `/api/auth/refresh` | body.refreshToken | Rotation |
| POST | `/api/auth/logout` | JWT | Revoke refresh |
| GET | `/api/auth/me` | JWT | User + roles + permissions from DB |
| POST | `/api/users` | `canCreateUsers` | Staff create |
| GET/POST/PATCH/DELETE | `/api/roles` | role perms | Minimal CRUD |
| PUT | `/api/users/:id/roles` | `canManageUserRoles` | Replace role set |

Access TTL ~15m, refresh ~7d.

---

## Guard semantics

1. `JwtAuthGuard` (global) — skip if `@Public()`
2. Resolve `userId` from JWT `sub`
3. If handler has `@RequirePermissions(...required)`:
   - Load union of permissions from user's roles
   - If `hasAbsoluteControl` ∈ set → allow
   - Else require **all** listed permissions (AND)
4. Else authenticated-only (or public)

Frontend mirrors catalog checks via `@skm/specs` + `/auth/me` for route middleware (`auth`, `admin`).

---

## Out of scope

- Polished admin UI for roles/users
- httpOnly cookies / CSRF
- OAuth, email verification, password reset
- Full catalog Prisma schema (roadmap stage 2)
- Guest cart merge

---

## Related

- Implementation plan: [../plans/2026-07-21-auth-roles-permissions.md](../plans/2026-07-21-auth-roles-permissions.md)
- Replaces roadmap stage 3 `admin \| client` and `User.Role` in `docs/db-draft.sql`
