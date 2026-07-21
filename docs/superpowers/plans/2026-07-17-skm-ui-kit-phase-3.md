# SKM UI Kit Phase 3 Implementation Plan

**Status:** ✅ Completed — historical

> **For agentic workers:** Plan executed. Historical record only. Note: `USlideover` later wrapped as `SkmSlideover` in Waves A–C; allowlist now primarily `UIcon`.

**Goal:** Закрепить guardrails дизайн-системы: ESLint запрещает прямые `U*` вне `components/ui/`, README документирует SKM UI Kit и правила импорта через `@skm/components`.

**Architecture:** Flat ESLint (`eslint.config.mjs`) + `@nuxt/eslint` / `eslint-plugin-vue` с path overrides: wrappers в `ui/` могут использовать `U*`, всё остальное — только `Skm*`.

**Tech Stack:** Nuxt 4, ESLint 9 flat config, eslint-plugin-vue, frontend README.

## Global Constraints

- Не ломать Phase 1–2 API (`Skm*`, `@skm/components`)
- `UIcon` / `USlideover` пока разрешены (нет wrappers) — в allowlist правила
- Не коммитить без явной просьбы пользователя

---

### Task 0: Phase 2 polish (before Phase 3)

**Files:**
- Modify: `frontend/app/app.config.ts`
- Modify: `frontend/app/components/ui/SkmPopover/SkmPopover.vue`
- Modify: `docs/superpowers/specs/2026-07-13-skm-ui-kit-design.md` (success criteria)

- [ ] **Step 1: Input defaults in app.config.ts**

```ts
export default defineAppConfig({
  ui: {
    colors: { primary: 'accent', neutral: 'neutral' },
    button: { defaultVariants: { size: 'md' } },
    input: {
      defaultVariants: { size: 'md' },
    },
    textarea: {
      defaultVariants: { size: 'md' },
    },
  },
})
```

- [ ] **Step 2: SkmPopover reads catalog/default from presets**

Use `skmPopoverContent` from `presets.ts` via exhaustive switch (no dynamic index).

- [ ] **Step 3: Mark success criteria done in design spec**

---

### Task 1: ESLint tooling + forbid `U*` outside `ui/`

**Files:**
- Create: `frontend/eslint.config.mjs`
- Modify: `frontend/nuxt.config.ts` (add `@nuxt/eslint` module if used)
- Modify: `frontend/package.json` (lint script + deps)

**Forbidden component names (templates):**
`UButton`, `UInput`, `UTextarea`, `UFormField`, `UPopover`, `UModal`, `UCard`, `UContainer`, `UBreadcrumb`

**Allowlist (no wrapper yet):**
`UIcon`, `USlideover`, `UApp`, `UToast` / provider primitives as needed

- [ ] **Step 1: Install deps**

```bash
cd frontend
npm i -D @nuxt/eslint eslint typescript-eslint
```

- [ ] **Step 2: eslint.config.mjs**

```js
import withNuxt from './.nuxt/eslint.config.mjs'

const forbiddenUComponents = [
  'UButton',
  'UInput',
  'UTextarea',
  'UFormField',
  'UPopover',
  'UModal',
  'UCard',
  'UContainer',
  'UBreadcrumb',
]

export default withNuxt(
  {
    files: ['app/**/*.{vue,ts}'],
    ignores: ['app/components/ui/**'],
    rules: {
      'vue/no-restricted-component-names': [
        'error',
        {
          names: forbiddenUComponents.map((name) => ({
            name,
            message: `Use Skm* from @skm/components instead of ${name}. Wrappers live in app/components/ui/.`,
          })),
        },
      ],
    },
  },
  {
    files: ['app/pages/**/*.{vue,ts}', 'app/components/layout/**/*.{vue,ts}', 'app/components/home/**/*.{vue,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/components/ui/presets', '**/ui/presets'],
              message: 'Import presets only inside app/components/ui/. Use Skm* wrappers in pages/layout.',
            },
          ],
        },
      ],
    },
  },
)
```

- [ ] **Step 3: Enable module + script**

`nuxt.config.ts`:
```ts
modules: ['@nuxt/eslint', ...]
```

`package.json`:
```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

- [ ] **Step 4: Run lint, fix false positives**

```bash
npm run lint
```

Expected: pass (layout may still use UIcon/USlideover — allowed).

---

### Task 2: README — SKM UI Kit section

**Files:**
- Modify: `frontend/README.md`

- [ ] **Step 1: Replace outdated App* structure with Skm* + document rules**

Document:
- Import from `@skm/components`
- Folder layout `components/ui/Skm*/`
- Do/Don't table from design spec
- Storybook Overview
- ESLint guardrail
- Link to `docs/superpowers/specs/2026-07-13-skm-ui-kit-design.md`

---

### Task 3: Verification

```bash
cd frontend
npm run lint
npm run build
npm run build-storybook
rg "<U(Button|Input|Textarea|FormField|Popover|Modal)\b" app/pages app/components/layout app/components/home
```

Expected: lint+builds green; no forbidden U* outside ui/.
