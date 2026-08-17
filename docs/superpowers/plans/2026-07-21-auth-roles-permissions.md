# Auth, Roles & Permissions — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or executing-plans. Steps use checkbox syntax.

**Goal:** JWT Bearer auth + RBAC (hardcoded permissions in `@skm/specs`, dynamic roles in DB) on Nest/Prisma and minimal Nuxt client.

**Architecture:** Access JWT carries only `sub`; permissions resolved from DB on each guarded request. `@RequirePermissions` + `hasAbsoluteControl` bypass. Shared types via npm workspaces package `@skm/specs`.

**Tech stack:** NestJS 11, Prisma 6, `@nestjs/jwt` + passport-jwt, bcrypt, Nuxt 4, Pinia, `@skm/specs`

**Spec:** [../specs/2026-07-21-auth-roles-permissions-design.md](../specs/2026-07-21-auth-roles-permissions-design.md)

## Global Constraints

- Do not put permissions inside JWT access payload
- Validate role permission strings against `ALL_PERMISSIONS` from `@skm/specs`
- No polished admin UI for roles in this plan
- Do not edit the Cursor plan file under `.cursor/plans/`

---

### Task 1: Docs & roadmap

- [x] Design spec written
- [x] This plan written
- [x] Update `docs/roadmap.md` stage 3
- [x] Note in `docs/db-draft.sql` that `User.Role` is deprecated

### Task 2: `@skm/specs` + workspaces

- [x] Root package + `skm-specs` (`file:` linking)
- [x] Package exports `Permission`, helpers, auth DTO types
- [x] Depend from backend and frontend

### Task 3: Prisma auth models

- [x] Models: User, Role, UserRole, RefreshToken
- [x] Seed: user/moderator/admin roles + admin user
- [x] Migrate

### Task 4: Guards & PermissionsService

- [x] JwtStrategy, JwtAuthGuard, `@Public`, `@CurrentUser`
- [x] PermissionsService (union + absolute bypass)
- [x] `@RequirePermissions` + PermissionsGuard
- [x] Unit tests for permission resolution

### Task 5: Auth API

- [x] register, login, refresh, logout, me
- [x] Token hash storage + rotation

### Task 6: Users & Roles API

- [x] `POST /users` (`canCreateUsers`)
- [x] Roles CRUD + `PUT /users/:id/roles`

### Task 7: Frontend

- [x] Auth store, `useApi`, `usePermissions`
- [x] Middleware `auth` / `admin`
- [x] Pages `login` / `register`; wire account + admin

### Task 8: Verify

- [x] Unit tests pass
- [x] Manual: Swagger register/login/me; API smoke (roles 403 for user)
