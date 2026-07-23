# SKM UI Kit Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Внедрить `Skm*` дизайн-систему как единую точку использования компонентов через `@skm/components`: папочная структура `components/ui/*`, nested `index.ts`, rename `App* → Skm*` (ui + layout), первые обёртки форм, и Storybook Overview + per-component stories для UI Kit.

**Architecture:** Hybrid A+B — глобальные дефолты Nuxt UI в `app.config.ts` + `:ui` пресеты в `components/ui/presets.ts` + тонкие `Skm*` wrappers. Экспорт всех компонентов (ui+layout) через barrel `app/components/index.ts` и алиас `@skm/components`.

**Tech Stack:** Nuxt 4, Vue 3, Nuxt UI v4, Tailwind v4, Storybook 10 (`@storybook/vue3-vite`).

---

### Task 1: Public entrypoint `@skm/components` + alias wiring

**Files:**
- Create: `frontend/app/components/index.ts`
- Create: `frontend/app/components/ui/index.ts`
- Create: `frontend/app/components/layout/index.ts`
- Modify: `frontend/nuxt.config.ts`
- Modify: `frontend/.storybook/main.ts`
- Modify: `frontend/.storybook/tsconfig.json`

- [ ] **Step 1: Add alias in Nuxt**

Modify `frontend/nuxt.config.ts` to include `alias` mapping:

```ts
import { fileURLToPath, URL } from 'node:url'

export default defineNuxtConfig({
  alias: {
    '@skm/components': fileURLToPath(new URL('./app/components', import.meta.url)),
  },
})
```

- [ ] **Step 2: Add alias in Storybook**

Modify `frontend/.storybook/main.ts`:

```ts
config.resolve.alias = {
  ...config.resolve.alias,
  '@skm/components': resolve(import.meta.dirname, '../app/components'),
}
```

- [ ] **Step 3: Add TS path mapping for Storybook**

Modify `frontend/.storybook/tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@skm/components": ["../app/components/index.ts"],
      "@skm/components/*": ["../app/components/*"]
    }
  }
}
```

- [ ] **Step 4: Add barrel exports**

Create `frontend/app/components/index.ts`:

```ts
export * from './ui'
export * from './layout'
```

Create `frontend/app/components/ui/index.ts` and `frontend/app/components/layout/index.ts` that re-export their folders’ public symbols (filled in Task 2/3).

- [ ] **Step 5: Smoke-check module resolution**

Run:

```bash
cd frontend
npm run build
npm run build-storybook
```

Expected: both succeed (they may still use old `App*` names until Task 3, but alias should not break anything).

---

### Task 2: Restructure `components/ui` into per-component folders + nested indexes

**Files:**
- Create: `frontend/app/components/ui/presets.ts` (moved/created later)
- Move/Rename: all existing `frontend/app/components/ui/App*.vue` and `*.stories.ts`
- Create: `frontend/app/components/ui/*/index.ts`
- Modify: `frontend/app/components/ui/index.ts`

- [ ] **Step 1: Create the folder layout**

Target folder structure:

```
frontend/app/components/ui/
├── presets.ts
├── SkmButton/SkmButton.vue
├── SkmButton/SkmButton.stories.ts
├── SkmButton/index.ts
├── SkmCard/…
├── SkmBreadcrumbs/…
├── SkmContainer/…
├── SkmSection/…
└── SkmDesignSystem/SkmDesignSystem.stories.ts
```

- [ ] **Step 2: Move/rename existing components**

Rename:
- `AppButton` → `SkmButton`
- `AppCard` → `SkmCard`
- `AppBreadcrumbs` → `SkmBreadcrumbs`
- `AppContainer` → `SkmContainer`
- `AppSection` → `SkmSection`

Keep functionality identical at this step.

- [ ] **Step 3: Add per-component `index.ts`**

Each component folder exports a named component:

```ts
export { default as SkmButton } from './SkmButton.vue'
export type { /* public types */ } from './types'
```

If no types exist, omit type export for now.

- [ ] **Step 4: Add `ui/index.ts`**

`frontend/app/components/ui/index.ts` exports all UI Kit components:

```ts
export * from './SkmButton'
export * from './SkmCard'
export * from './SkmBreadcrumbs'
export * from './SkmContainer'
export * from './SkmSection'
// add SkmInput/SkmTextarea/SkmFormField after Task 4
```

- [ ] **Step 5: Update Storybook stories paths**

Ensure `.storybook/main.ts` glob (`../app/components/**/*.stories.*`) still picks up stories in nested folders.

---

### Task 3: Rename layout shell `App* → Skm*` and update usages

**Files:**
- Rename: `frontend/app/components/layout/AppHeader.vue` → `SkmHeader.vue`
- Rename: `frontend/app/components/layout/AppFooter.vue` → `SkmFooter.vue`
- Rename: `frontend/app/components/layout/AppMobileNav.vue` → `SkmMobileNav.vue`
- Rename: `frontend/app/components/layout/AppCatalogMenu.vue` → `SkmCatalogMenu.vue`
- Rename: `frontend/app/components/layout/AppCallOrderModal.vue` → `SkmCallOrderModal.vue`
- Modify: `frontend/app/layouts/default.vue`
- Modify: `frontend/app/components/layout/SkmHeader.vue` (internal component tags)
- Modify: `frontend/app/components/layout/index.ts`

- [ ] **Step 1: Rename files**

- [ ] **Step 2: Update component tags**

Examples:
- `layouts/default.vue`: `<AppHeader />` → `<SkmHeader />`, `<AppFooter />` → `<SkmFooter />`
- `SkmHeader.vue`: `<AppCatalogMenu/>` → `<SkmCatalogMenu/>`, `<AppMobileNav/>` → `<SkmMobileNav/>`, `<AppCallOrderModal/>` → `<SkmCallOrderModal/>`

- [ ] **Step 3: Export layout shell**

`frontend/app/components/layout/index.ts`:

```ts
export { default as SkmHeader } from './SkmHeader.vue'
export { default as SkmFooter } from './SkmFooter.vue'
export { default as SkmMobileNav } from './SkmMobileNav.vue'
export { default as SkmCatalogMenu } from './SkmCatalogMenu.vue'
export { default as SkmCallOrderModal } from './SkmCallOrderModal.vue'
```

---

### Task 4: Add form wrappers (`SkmInput`, `SkmTextarea`, `SkmFormField`) + presets

**Files:**
- Create: `frontend/app/components/ui/presets.ts`
- Create: `frontend/app/components/ui/SkmInput/*`
- Create: `frontend/app/components/ui/SkmTextarea/*`
- Create: `frontend/app/components/ui/SkmFormField/*`
- Modify: `frontend/app/pages/contacts.vue`
- Modify: `frontend/app/components/layout/SkmCallOrderModal.vue`
- Modify: `frontend/app/components/ui/index.ts`

- [ ] **Step 1: Introduce `presets.ts`**

Create `presets.ts` with `inputDefault`, `inputOnBrand`, `formFieldOnBrand` preset objects for `:ui`.

- [ ] **Step 2: Implement wrappers**

Each wrapper should:
- accept a small `variant` (`default | onBrand` for inputs; `light | brand` for form field)
- apply `:ui` from presets
- forward attrs and slots

- [ ] **Step 3: Replace direct `UInput/UTextarea/UFormField` usage**

Update `/contacts` and `SkmCallOrderModal` to use the wrappers.

- [ ] **Step 4: Add stories**

Add `*.stories.ts` for each of the three components and include them in Overview (Task 5).

---

### Task 5: Storybook Overview page (`SkmDesignSystem/Overview`)

**Files:**
- Create: `frontend/app/components/ui/SkmDesignSystem/SkmDesignSystem.stories.ts`
- Modify: other stories as needed

- [ ] **Step 1: Build a demo “page”**

The Overview story should visually demonstrate:
- Buttons (variants, disabled)
- Form block in light + on-brand (purple section)
- Cards
- Breadcrumbs
- Container/Section tones

- [ ] **Step 2: Ensure UI Kit coverage**

Definition of Done:
- every `components/ui/Skm*/` has a `*.stories.ts`

---

### Task 6: Cleanup + verification

**Files:**
- Delete: old `frontend/app/components/ui/App*`
- Delete: old `frontend/app/components/ui/*.stories.ts` for `App*`
- Delete: old `frontend/app/components/layout/App*`
- Update: any remaining references

- [ ] **Step 1: Verify no `App*` remains**

Run:

```bash
cd frontend
rg \"App(Button|Card|Breadcrumbs|Container|Section|Header|Footer|MobileNav|CatalogMenu|CallOrderModal)\" app
```

Expected: no matches.

- [ ] **Step 2: Build verification**

Run:

```bash
cd frontend
npm run build
npm run build-storybook
```

Expected: both succeed.

