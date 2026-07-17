# SKM UI Kit — Design Spec

**Date:** 2026-07-13  
**Status:** Draft — approved  
**Scope:** Обёртки Nuxt UI v4 + layout-примитивы с префиксом `Skm`\*, Storybook-демо

---

## Goal

Все переиспользуемые UI-примитивы (частота > 5 на проекте) живут в бизнес UI-системе SKM как тонкие обёртки над Nuxt UI с готовыми пресетами. Страницы и layout-компоненты используют только `Skm*`, не `U*` напрямую.

Layout-компоненты уровня страницы (`SkmHeader`, `SkmFooter`, `SkmCatalogMenu` и т.д.) остаются в `components/layout/` — одноразовые, **не входят в UI Kit**, но носят префикс `Skm`\* для единообразия дизайн-системы.

---

## Architecture: Hybrid (A + B)

### Layer 1 — Global defaults (`app.config.ts`)

Nuxt UI theme: цвета, размеры по умолчанию, базовые слоты.

```ts
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: { primary: "accent", neutral: "neutral" },
    button: { defaultVariants: { size: "md" } },
    input: {
      /* base ring, radius */
    },
    textarea: {
      /* same as input */
    },
    // card, popover, modal — по мере добавления обёрток
  },
});
```

### Layer 2 — Variant presets (`app/components/ui/presets.ts`)

Явные объекты `:ui` для вариантов, которые нельзя выразить только глобальным config:

| Preset key         | Использование                              |
| ------------------ | ------------------------------------------ |
| `inputDefault`     | белый фон, neutral ring — формы на светлом |
| `inputOnBrand`     | белый фон на `brand-purple-950`            |
| `formFieldOnBrand` | светлые label                              |
| `popoverCatalog`   | light dropdown + shadow (каталог)          |
| `modalDefault`     | стандартная модалка                        |

Компоненты мапят `variant` / `tone` → preset из этого файла.

### Layer 3 — Skm\* wrappers (`app/components/ui/`)

Каждый wrapper:

1. Узкий публичный API (`variant`, `size`, `tone`, …)
2. Скрывает Nuxt UI `color` / `variant` / `ui`
3. Пробрасывает `v-model`, attrs, слоты через `v-bind="$attrs"` + `defineOptions({ inheritAttrs: false })` где нужно
4. `switch` + `never` для exhaustive variants

---

## Folder structure

```
frontend/app/components/ui/
├── presets.ts                      # shared :ui presets (Layer 2)
├── SkmButton/
│   ├── SkmButton.vue
│   ├── SkmButton.stories.ts
│   └── index.ts
├── SkmInput/
│   ├── SkmInput.vue
│   ├── SkmInput.stories.ts
│   └── index.ts
├── SkmTextarea/
│   ├── SkmTextarea.vue
│   ├── SkmTextarea.stories.ts
│   └── index.ts
├── SkmFormField/
│   ├── SkmFormField.vue
│   ├── SkmFormField.stories.ts
│   └── index.ts
├── SkmCard/
│   ├── SkmCard.vue
│   ├── SkmCard.stories.ts
│   └── index.ts
├── SkmBreadcrumbs/
│   ├── SkmBreadcrumbs.vue
│   ├── SkmBreadcrumbs.stories.ts
│   └── index.ts
├── SkmContainer/
│   ├── SkmContainer.vue
│   ├── SkmContainer.stories.ts
│   └── index.ts
├── SkmSection/
│   ├── SkmSection.vue
│   ├── SkmSection.stories.ts
│   └── index.ts
├── SkmPopover/                     # phase 2
│   ├── SkmPopover.vue
│   ├── SkmPopover.stories.ts
│   └── index.ts
├── SkmModal/                       # phase 2
│   ├── SkmModal.vue
│   ├── SkmModal.stories.ts
│   └── index.ts
└── SkmDesignSystem/
    ├── SkmDesignSystem.stories.ts  # demo page (все примитивы на одной «странице»)
    └── index.ts
```

**Удаляются после миграции:** `AppButton`, `AppCard`, `AppBreadcrumbs`, `AppContainer`, `AppSection` (+ их stories).

### Nested components guideline

- Если компонент состоит из внутренних подкомпонентов, они живут **внутри папки родителя**.
- Пример семантической вложенности:

```

### Exports & imports (barrel + alias)

#### Goal

- В коде **не используем прямые пути к `*.vue`**.
- Всё импортируется из **одного entrypoint**: `@skm/components`.
- Экспорты организованы через **nested index** (barrel) на каждом уровне папок.

#### Export structure (proposal)

```

frontend/app/components/
├── index.ts # экспортирует всё наружу (public API)
├── ui/
│ ├── index.ts # экспортирует все Skm\* UI Kit примитивы + types
│ ├── presets.ts
│ └── SkmButton/
│ ├── index.ts # export { default as SkmButton } …; export type …
│ ├── SkmButton.vue
│ └── SkmButton.stories.ts
└── layout/
├── index.ts # экспортирует SkmHeader/SkmFooter/... (layout shell)
└── SkmHeader.vue

```

`@skm/components` → `app/components/index.ts`:

- `export * from './ui'`
- `export * from './layout'` (**layout shell** тоже экспортируется из публичного entrypoint)

**Важно:** layout shell **не является UI Kit** и **не требует** отдельной обвязки с персональными Storybook stories. Он просто использует `Skm`*-примитивы из `ui/` внутри.

#### Alias wiring (Nuxt + TS + Storybook)

В рамках миграции добавляем алиас:

- **Nuxt**: `nuxt.config.ts` → `alias: { '@skm/components': fileURLToPath(new URL('./app/components', import.meta.url)) }`
- **TypeScript**: `tsconfig.json` / `paths` → `\"@skm/components\": [\"./app/components/index.ts\"]` и `\"@skm/components/*\": [\"./app/components/*\"]`
- **Storybook**: `.storybook/main.ts` → `viteFinal().resolve.alias['@skm/components'] = resolve(..., '../app/components')`

#### Import rules

- ✅ `import { SkmButton, SkmInput } from '@skm/components'`
- ✅ `import type { BreadcrumbItem } from '@skm/components'` (если типы экспортируются публично)
- ❌ `import SkmButton from '~/components/ui/SkmButton/SkmButton.vue'`
SkmUl/
├── SkmUl.vue
├── SkmUl.stories.ts
├── index.ts
└── SkmLi/
    ├── SkmLi.vue
    ├── SkmLi.stories.ts
    └── index.ts
```

```
frontend/app/components/layout/
├── SkmHeader.vue           # было AppHeader
├── SkmFooter.vue           # было AppFooter
├── SkmMobileNav.vue        # было AppMobileNav
├── SkmCatalogMenu.vue      # было AppCatalogMenu
└── SkmCallOrderModal.vue   # было AppCallOrderModal
```

**Удаляются после миграции:** все `App`\* в `layout/`.

---

## Component inventory

### Tier 1 — Nuxt UI wrappers (миграция в первую очередь)

| Component      | Wraps        | Public API                                          |
| -------------- | ------------ | --------------------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `SkmButton`    | `UButton`    | `variant: primary                                   | secondary                                       | outline`, `size`, `to`, `type`, `disabled` |
| `SkmInput`     | `UInput`     | `variant: default                                   | onBrand`, + стандартные input props             |
| `SkmTextarea`  | `UTextarea`  | `variant: default                                   | onBrand`, `rows`, + v-model                     |
| `SkmFormField` | `UFormField` | `tone: light                                        | brand`, `label`, `error`, `hint` + default slot |
| `SkmPopover`   | `UPopover`   | `variant: catalog                                   | default` + trigger/content slots                |
| `SkmModal`     | `UModal`     | `open` (v-model), `title`, `#body`, `#footer` slots |

### Tier 2 — Primitives (Tailwind / без Nuxt UI)

| Component        | Notes                                                   |
| ---------------- | ------------------------------------------------------- | ----- | ----------------------------- |
| `SkmCard`        | border, shadow, padding; опционально `to` для link-card |
| `SkmBreadcrumbs` | `items: { label, to? }[]`, accent hover                 |
| `SkmContainer`   | `max-w-7xl mx-auto px-4`                                |
| `SkmSection`     | `tone: light                                            | muted | brand`, `alt` alias для brand |

### Layout shell (не UI Kit, префикс `Skm*`)

Одноразовые компоненты оболочки сайта. Живут в `layout/`, не документируются в Storybook UI Kit, но **внутри** используют `Skm`\*-примитивы из `ui/`.

| Component           | Было                | Роль                      |
| ------------------- | ------------------- | ------------------------- |
| `SkmHeader`         | `AppHeader`         | шапка, nav, CTA           |
| `SkmFooter`         | `AppFooter`         | подвал                    |
| `SkmMobileNav`      | `AppMobileNav`      | мобильное меню            |
| `SkmCatalogMenu`    | `AppCatalogMenu`    | dropdown каталога         |
| `SkmCallOrderModal` | `AppCallOrderModal` | модалка «Заказать звонок» |

---

## Storybook

### Структура навигации

```
SKM Design System/
├── Overview          ← SkmDesignSystem.stories.ts (demo page)
├── SkmButton
├── SkmInput
├── SkmTextarea
├── SkmFormField
├── SkmCard
├── SkmBreadcrumbs
├── SkmContainer
├── SkmSection
├── SkmPopover        (phase 2)
└── SkmModal          (phase 2)
```

### Story requirement (UI Kit)

- **Каждый компонент из** `components/ui/Skm*/` **обязан иметь собственный** `*.stories.ts`**.**
- Stories для UI Kit — часть Definition of Done для компонента.
- **Layout shell (**`components/layout/Skm`**\*) stories не требует** (но может иметь 1 интеграционную story позже, если понадобится).

### Demo page (`SkmDesignSystem.stories.ts`)

Одна story `Overview` — визуальная «страница» с секциями:

1. **Buttons** — все variant + disabled
2. **Form** — Input / Textarea / FormField на light и on brand (фиолетовый блок)
3. **Cards** — с title, link, slot content
4. **Breadcrumbs** — типовой путь
5. **Layout** — Container + Section tones (light, muted, brand)

Storybook остаётся standalone (без Nuxt runtime). Для `SkmButton` и form-компонентов:

- **Phase 1:** stories с Tailwind mock (как сейчас `AppButton.stories`) + постепенный переход на реальные компоненты через Nuxt UI stubs / minimal plugin
- **Phase 2:** подключить `@nuxt/ui/vite` plugin в Storybook для полного рендера `U`\*

---

## Migration phases

### Phase 1 — Rename + core wrappers

1. Создать `presets.ts`
2. **UI Kit:** `AppButton` → `SkmButton`, `AppCard` → `SkmCard`, `AppBreadcrumbs` → `SkmBreadcrumbs`, `AppContainer` → `SkmContainer`, `AppSection` → `SkmSection`
3. **Layout shell:** `AppHeader` → `SkmHeader`, `AppFooter` → `SkmFooter`, `AppMobileNav` → `SkmMobileNav`, `AppCatalogMenu` → `SkmCatalogMenu`, `AppCallOrderModal` → `SkmCallOrderModal`
4. Создать `SkmInput`, `SkmTextarea`, `SkmFormField`
5. Обновить все ссылки в `pages/`, `layouts/`, `home/`
6. Stories + `SkmDesignSystem` overview
7. Удалить все старые `App*` из `ui/` и `layout/`

### Phase 2 — Overlay components

1. `SkmPopover` — вынести стили из `SkmCatalogMenu`
2. `SkmModal` — вынести из `SkmCallOrderModal`
3. Довести layout shell на `Skm*`-примитивы (если остались прямые `U*`)
4. Storybook: Nuxt UI vite plugin для полного рендера

### Phase 3 — Guardrails (optional)

- ESLint rule / comment convention: запрет `UButton`, `UInput`, … вне `components/ui/`
- README: раздел «SKM UI Kit»

---

## Usage rules

| ✅ Do                                      | ❌ Don't                        |
| ------------------------------------------ | ------------------------------- |
| `<SkmButton variant="primary">`            | `<UButton>` в pages/layout      |
| `<SkmInput v-model="x" variant="onBrand">` | `class="!bg-white"` на `UInput` |
| `import presets` только в `ui/`            | Импорт presets в pages          |
| Layout: `SkmHeader` + `SkmButton`          | Любые `App*` после миграции     |

---

## app.config.ts extensions (Phase 1)

Дополнить глобальные дефолты для input/textarea:

- `ring-neutral-200`, `rounded-md`
- `focus-visible:ring-accent-500`
- placeholder `text-neutral-400`

Вариант `onBrand` — только через `presets.ts` → `SkmInput` / `SkmFormField`.

---

## Success criteria

- [ ] Нет `App*` компонентов в `components/ui/` и `components/layout/`
- [ ] Нет прямого `UInput` / `UButton` / `UFormField` в `pages/` и `components/layout/` (кроме временного Phase 1 tail)
- [ ] Storybook: страница Overview с демо всех Tier 1 + Tier 2 примитивов
- [ ] `npm run build` и `npm run build-storybook` проходят
- [ ] Форма на `/contacts` — белые инпуты + оранжевая кнопка через `Skm*`

---

## Open decisions (resolved)

| Question          | Decision                                                                        |
| ----------------- | ------------------------------------------------------------------------------- |
| Architecture      | Hybrid A + B                                                                    |
| Naming            | Все компоненты дизайн-системы `Skm*`: UI Kit (`ui/`) + layout shell (`layout/`) |
| Storybook         | Отдельная Overview story с demo page (только UI Kit; layout shell без stories)  |
| Layout components | `Skm*` в `layout/`, не в UI Kit, используют `Skm*`-примитивы из `ui/`           |
