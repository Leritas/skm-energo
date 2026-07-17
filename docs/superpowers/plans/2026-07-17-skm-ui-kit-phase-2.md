# SKM UI Kit Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить overlay-обёртки `SkmPopover` и `SkmModal`, убрать прямые `UPopover` / `UModal` / `UButton` из layout shell, расширить `SkmButton` для icon/ghost-кнопок шапки.

**Architecture:** Hybrid A+B — пресеты `popoverCatalog` / `modalDefault` в `presets.ts` + тонкие wrappers в `components/ui/`. Layout shell переводится на `Skm*`. Storybook уже на `@nuxt/ui/vite` (Phase 2 item 4 — done).

**Tech Stack:** Nuxt 4, Vue 3, Nuxt UI v4, Tailwind v4, Storybook 10.

## Global Constraints

- Публичный импорт только через `@skm/components`
- Папка на компонент: `SkmX/SkmX.vue` + `index.ts` + `*.stories.ts`
- Exhaustive `switch` + `never` для variant unions
- Явные `import { computed, ref } from 'vue'` (Storybook без Nuxt auto-import)
- Nuxt `components.extensions: ['.vue']` — не ломать
- Не трогать `USlideover` / `UIcon` в этой фазе (нет в inventory Phase 2)
- Не коммитить без явной просьбы пользователя

---

### Task 1: Extends `SkmButton` — `ghost` + `icon`

**Files:**
- Modify: `frontend/app/components/ui/SkmButton/SkmButton.vue`
- Modify: `frontend/app/components/ui/SkmButton/SkmButton.stories.ts`

**Interfaces:**
- Produces: `variant?: 'primary' | 'secondary' | 'outline' | 'ghost'`, `icon?: string`
- Consumes: Nuxt UI `UButton` `color` / `variant` / `icon`

- [ ] **Step 1: Extend SkmButton.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'

type SkmButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type SkmButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: SkmButtonVariant
    size?: SkmButtonSize
    to?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    icon?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
  },
)

const color = computed(() =>
  props.variant === 'primary' ? 'primary' : 'neutral',
)

const uiVariant = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'solid'
    case 'secondary':
      return 'soft'
    case 'outline':
      return 'outline'
    case 'ghost':
      return 'ghost'
    default: {
      const _exhaustive: never = props.variant
      return _exhaustive
    }
  }
})
</script>

<template>
  <UButton
    :color="color"
    :variant="uiVariant"
    :size="size"
    :to="to"
    :type="type"
    :disabled="disabled"
    :icon="icon"
  >
    <slot />
  </UButton>
</template>
```

- [ ] **Step 2: Add Ghost / IconOnly stories**

In `SkmButton.stories.ts` add:

```ts
export const GhostIcon: Story = {
  args: {
    variant: 'ghost',
    icon: 'i-lucide-search',
  },
  render: (args) => ({
    components: { SkmButton },
    setup: () => ({ args }),
    template: '<SkmButton v-bind="args" aria-label="Поиск" />',
  }),
}
```

- [ ] **Step 3: Verify Storybook story renders**

Open `SKM Design System/SkmButton` → GhostIcon. Expected: neutral ghost icon button, no `computed is not defined`.

---

### Task 2: `SkmPopover` wrapper + catalog preset

**Files:**
- Modify: `frontend/app/components/ui/presets.ts`
- Create: `frontend/app/components/ui/SkmPopover/SkmPopover.vue`
- Create: `frontend/app/components/ui/SkmPopover/index.ts`
- Create: `frontend/app/components/ui/SkmPopover/SkmPopover.stories.ts`
- Modify: `frontend/app/components/ui/index.ts`
- Modify: `frontend/app/components/layout/SkmCatalogMenu.vue`

**Interfaces:**
- Produces: `SkmPopover` with `variant?: 'default' | 'catalog'`, `v-model:open`, default slot (trigger), `#content` slot
- Consumes: `skmPopoverContent` from presets → merged into `UPopover` `:content`

- [ ] **Step 1: Add popover presets**

Append to `presets.ts`:

```ts
export type SkmPopoverVariant = 'default' | 'catalog'

export const skmPopoverContent = {
  default: {
    side: 'bottom' as const,
    sideOffset: 8,
  },
  catalog: {
    align: 'start' as const,
    class: '!bg-white p-0 shadow-lg ring-1 ring-neutral-100/80',
  },
} as const
```

- [ ] **Step 2: Create SkmPopover.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { skmPopoverContent, type SkmPopoverVariant } from '../presets'

const props = withDefaults(
  defineProps<{
    variant?: SkmPopoverVariant
  }>(),
  { variant: 'default' },
)

const open = defineModel<boolean>('open', { default: false })

const content = computed(() => skmPopoverContent[props.variant])
</script>

<template>
  <UPopover v-model:open="open" :content="content">
    <slot :open="open" />
    <template #content="slotProps">
      <slot name="content" v-bind="slotProps" />
    </template>
  </UPopover>
</template>
```

- [ ] **Step 3: Barrel + stories**

`index.ts`:
```ts
export { default as SkmPopover } from './SkmPopover.vue'
```

Stories: Default + Catalog (trigger button + simple content panel).

Export from `ui/index.ts`: `export * from './SkmPopover'`

- [ ] **Step 4: Migrate SkmCatalogMenu**

Replace `UPopover` with:

```vue
<SkmPopover v-model:open="open" variant="catalog">
  <!-- same trigger button -->
  <template #content>
    <!-- same menu markup -->
  </template>
</SkmPopover>
```

Keep `UIcon` as-is.

- [ ] **Step 5: Smoke**

`rg "<UPopover" app/components/layout` → no matches.  
Storybook: SkmPopover Catalog story renders white dropdown panel.

---

### Task 3: `SkmModal` wrapper + migrate CallOrderModal

**Files:**
- Modify: `frontend/app/components/ui/presets.ts` (optional `modalDefault` marker comment / empty ui if unused)
- Create: `frontend/app/components/ui/SkmModal/SkmModal.vue`
- Create: `frontend/app/components/ui/SkmModal/index.ts`
- Create: `frontend/app/components/ui/SkmModal/SkmModal.stories.ts`
- Modify: `frontend/app/components/ui/index.ts`
- Modify: `frontend/app/components/layout/SkmCallOrderModal.vue`

**Interfaces:**
- Produces: `SkmModal` with `v-model:open`, `title?: string`, slots `#body` `#footer` `#header` (forward), default unused
- Consumes: `UModal`

- [ ] **Step 1: Create SkmModal.vue**

```vue
<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description">
    <template v-if="$slots.body" #body="slotProps">
      <slot name="body" v-bind="slotProps" />
    </template>
    <template v-if="$slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="slotProps" />
    </template>
    <template v-if="$slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps" />
    </template>
  </UModal>
</template>
```

- [ ] **Step 2: Barrel + stories**

Story with title + body text + SkmButton close.

Export from `ui/index.ts`.

- [ ] **Step 3: Migrate SkmCallOrderModal**

```vue
<SkmModal v-model:open="open" title="Заказать звонок">
  <template #body>
    <!-- existing body unchanged -->
  </template>
</SkmModal>
```

- [ ] **Step 4: Smoke**

`rg "<UModal" app/components/layout` → no matches.

---

### Task 4: Replace header `UButton` with `SkmButton` ghost/icon

**Files:**
- Modify: `frontend/app/components/layout/SkmHeader.vue`

- [ ] **Step 1: Replace all five UButtons**

Example:

```vue
<SkmButton
  variant="ghost"
  icon="i-lucide-phone-call"
  aria-label="Заказать звонок"
  @click="callModalOpen = true"
/>
```

Same for search and menu icons (desktop + mobile blocks).

- [ ] **Step 2: Verify no UButton in layout**

```bash
rg "<UButton" app/pages app/components/layout
```

Expected: no matches.

---

### Task 5: Overview + verification

**Files:**
- Modify: `frontend/app/components/ui/SkmDesignSystem/SkmDesignSystem.stories.ts`
- Modify: `docs/superpowers/specs/2026-07-13-skm-ui-kit-design.md` (mark Phase 2 items done in notes if needed — optional)

- [ ] **Step 1: Add Popover + Modal sections to Overview**

Import `SkmPopover`, `SkmModal`; add short demos after Cards.

- [ ] **Step 2: Build verification**

```bash
cd frontend
rg "<U(Popover|Modal|Button)\b" app/pages app/components/layout
npm run build
npm run build-storybook
```

Expected: no matches for those three tags; both builds succeed.

---

## Out of scope (Phase 2)

- `SkmSlideover` for `SkmMobileNav` (`USlideover` remains)
- `UIcon` wrapper
- Product card (`SkmProductCard`)
- Phase 3 ESLint guardrails
