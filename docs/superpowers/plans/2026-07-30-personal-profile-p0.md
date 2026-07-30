# Personal Profile P0 (Shell) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/account` stub with nested `/profile/*` frontend shell (info, orders×3, favorite) on mocks, plus `SkmReviewCard` editMode.

**Architecture:** Nuxt nested pages: `profile.vue` shell (sidebar/tabs nav) → child pages; `orders.vue` secondary tabs → active/completed/purchased. Auth middleware on parent. Mocks in `constants/profile-mocks.ts`. No backend changes.

**Tech Stack:** Nuxt 4, Vue 3, Pinia auth store, Skm UI kit (`SkmFormField`, `SkmInput`, `SkmTextarea`, `SkmButton`, `SkmCard`, `SkmOrderCard`, `SkmReviewCard`)

**Spec:** [../specs/2026-07-30-personal-profile-design.md](../specs/2026-07-30-personal-profile-design.md)

## Global Constraints

- No avatars / photo upload
- Email field read-only; no email-change UI
- P0: mocks + toast only — no PATCH/API for profile/orders/favorites/reviews
- Use `Skm*` only in pages/layout (no raw `U*` except allowlisted `UIcon`)
- Auth middleware stays client-only (`import.meta.server` early return)
- Redirect `/account` → `/profile`; header links → `/profile`

---

## File map

| Path | Responsibility |
|------|----------------|
| `frontend/app/constants/profile-mocks.ts` | Typed mock orders, purchased products, favorites |
| `frontend/app/components/ui/SkmReviewCard/SkmReviewCard.vue` | Read + `editMode` |
| `frontend/app/components/ui/SkmReviewCard/SkmReviewCard.stories.ts` | EditMode story |
| `frontend/app/pages/profile.vue` | Shell: header name/email, nav, logout, `<NuxtPage />`, middleware auth |
| `frontend/app/pages/profile/index.vue` | Redirect → `/profile/info` |
| `frontend/app/pages/profile/info.vue` | B2B form + password form |
| `frontend/app/pages/profile/orders.vue` | Secondary tabs + `<NuxtPage />` |
| `frontend/app/pages/profile/orders/index.vue` | Redirect → `/profile/orders/active` |
| `frontend/app/pages/profile/orders/active.vue` | Active order cards |
| `frontend/app/pages/profile/orders/completed.vue` | Completed order cards |
| `frontend/app/pages/profile/orders/purchased.vue` | Products + reviews |
| `frontend/app/pages/profile/favorite.vue` | Favorite product grid |
| `frontend/app/pages/account/index.vue` | Redirect → `/profile` |
| `SkmUserMenu.vue`, `SkmMobileNav.vue`, login/register | `/profile` links |
| `nuxt.config.ts` sitemap exclude | `/profile/**` |
| Docs: frontend README, design status | Mark P0 in progress / done when finished |

---

### Task 1: Profile mocks

**Files:**
- Create: `frontend/app/constants/profile-mocks.ts`

**Interfaces:**
- Produces: `PROFILE_ACTIVE_ORDERS`, `PROFILE_COMPLETED_ORDERS`, `PROFILE_PURCHASED_ITEMS`, `PROFILE_FAVORITES` and types `ProfileOrderMock`, `ProfilePurchasedItem`, `ProfileFavoriteItem`

- [ ] **Step 1: Add mock module**

```ts
import type { SkmOrderStatus } from '~/components/ui/SkmOrderStatusBadge/types'

export type ProfileOrderMock = {
  number: string
  dateLabel: string
  status: SkmOrderStatus
  totalLabel?: string
}

export type ProfilePurchasedItem = {
  id: string
  name: string
  description: string
  to: string
  review: null | { rating: number; text: string; dateLabel: string }
}

export type ProfileFavoriteItem = {
  id: string
  name: string
  description: string
  to: string
}

export const PROFILE_ACTIVE_ORDERS: ProfileOrderMock[] = [
  { number: 'SKM-1042', dateLabel: '18 июля 2026', status: 'processing' },
  { number: 'SKM-1045', dateLabel: '22 июля 2026', status: 'processing', totalLabel: 'по запросу' },
]

export const PROFILE_COMPLETED_ORDERS: ProfileOrderMock[] = [
  { number: 'SKM-1038', dateLabel: '5 июля 2026', status: 'completed' },
  { number: 'SKM-1021', dateLabel: '12 июня 2026', status: 'completed' },
]

export const PROFILE_PURCHASED_ITEMS: ProfilePurchasedItem[] = [
  {
    id: 'p1',
    name: 'Предохранитель MERSEN NH 160A',
    description: 'Заказ SKM-1038',
    to: '/product/mersen-nh-160a',
    review: {
      rating: 5,
      text: 'Оперативная поставка, документы в порядке.',
      dateLabel: '8 июля 2026',
    },
  },
  {
    id: 'p2',
    name: 'Рубильник HIITIO 250A',
    description: 'Заказ SKM-1021',
    to: '/product/hiitio-250a',
    review: null,
  },
]

export const PROFILE_FAVORITES: ProfileFavoriteItem[] = [
  {
    id: 'f1',
    name: 'Контактор CASRAM C9',
    description: 'Низковольтный контактор',
    to: '/product/casram-c9',
  },
  {
    id: 'f2',
    name: 'Разъединитель Lampar 400A',
    description: 'Силовой разъединитель',
    to: '/product/lampar-400a',
  },
]
```

Adjust import path for `SkmOrderStatus` to match project (`~/components/ui/...` or relative). If types are not exported from a clean path, inline union `'processing' | 'completed' | ...` matching `SkmOrderStatus`.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/constants/profile-mocks.ts
git commit -m "$(cat <<'EOF'
chore: add profile page mock data for P0 shell

EOF
)"
```

---

### Task 2: SkmReviewCard editMode

**Files:**
- Modify: `frontend/app/components/ui/SkmReviewCard/SkmReviewCard.vue`
- Modify: `frontend/app/components/ui/SkmReviewCard/SkmReviewCard.stories.ts`

**Interfaces:**
- Consumes: `SkmTextarea`, `SkmButton` from kit
- Produces: props `editMode?: boolean`; when editMode, optional `author`/`dateLabel`/`text` unused for display; emit `submit: [{ rating: number; text: string }]`

- [ ] **Step 1: Implement editMode UI**

Replace component with dual-mode version:

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    author?: string
    dateLabel?: string
    text?: string
    rating?: number
    editMode?: boolean
  }>(),
  {
    author: undefined,
    dateLabel: undefined,
    text: undefined,
    rating: undefined,
    editMode: false,
  },
)

const emit = defineEmits<{
  submit: [{ rating: number; text: string }]
}>()

const draftText = ref(props.text ?? '')
const draftRating = ref(props.rating ?? 0)

function setRating(value: number) {
  draftRating.value = value
}

function handleSubmit() {
  if (draftRating.value < 1 || !draftText.value.trim()) {
    return
  }
  emit('submit', {
    rating: draftRating.value,
    text: draftText.value.trim(),
  })
}
</script>

<template>
  <article class="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
    <template v-if="!editMode">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-sm font-semibold text-neutral-950">
          {{ author }}
        </p>
        <time class="text-xs text-neutral-500">
          {{ dateLabel }}
        </time>
      </div>
      <p
        v-if="rating != null"
        class="mt-2 text-xs font-medium text-accent-600"
        aria-label="Оценка"
      >
        {{ '★'.repeat(rating) }}{{ '☆'.repeat(Math.max(0, 5 - rating)) }}
      </p>
      <p class="mt-3 text-sm leading-relaxed text-neutral-600">
        {{ text }}
      </p>
    </template>

    <template v-else>
      <p class="mb-3 text-sm font-semibold text-neutral-900">
        Оцените товар
      </p>
      <SkmFormField label="Отзыв">
        <SkmTextarea
          v-model="draftText"
          :rows="3"
          placeholder="Как прошла поставка?"
        />
      </SkmFormField>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div
          class="flex gap-1"
          role="group"
          aria-label="Оценка от 1 до 5"
        >
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="text-lg leading-none text-accent-600 transition-opacity hover:opacity-80"
            :aria-label="`${star} из 5`"
            :aria-pressed="draftRating === star"
            @click="setRating(star)"
          >
            {{ star <= draftRating ? '★' : '☆' }}
          </button>
        </div>
        <SkmButton
          type="button"
          :disabled="draftRating < 1 || !draftText.trim()"
          @click="handleSubmit"
        >
          Оценить
        </SkmButton>
      </div>
    </template>
  </article>
</template>
```

Keep read-mode required usage sites passing `author`, `dateLabel`, `text` as before.

- [ ] **Step 2: Add EditMode story**

```ts
export const EditMode: Story = {
  args: { editMode: true },
  render: (args) => ({
    components: { SkmReviewCard },
    setup: () => ({
      args,
      onSubmit: (payload: { rating: number; text: string }) => {
        console.log('submit', payload)
      },
    }),
    template:
      '<div class="max-w-md p-4"><SkmReviewCard v-bind="args" @submit="onSubmit" /></div>',
  }),
}
```

- [ ] **Step 3: Lint ReviewCard files**

Run: `cd frontend && npx eslint app/components/ui/SkmReviewCard --max-warnings 0`  
Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add frontend/app/components/ui/SkmReviewCard
git commit -m "$(cat <<'EOF'
feat: add editMode to SkmReviewCard for product ratings

EOF
)"
```

---

### Task 3: Profile shell + redirects

**Files:**
- Create: `frontend/app/pages/profile.vue`
- Create: `frontend/app/pages/profile/index.vue`
- Modify: `frontend/app/pages/account/index.vue` (replace with redirect)
- Modify: `frontend/app/components/layout/SkmUserMenu.vue` — `/profile`
- Modify: `frontend/app/components/layout/SkmMobileNav.vue` — `/profile`
- Modify: `frontend/app/pages/login.vue` — default redirect `/profile`
- Modify: `frontend/app/pages/register.vue` — navigate `/profile`
- Modify: `frontend/nuxt.config.ts` — sitemap exclude `/profile/**`

**Interfaces:**
- Produces: parent route `/profile` with auth middleware and nav links to `info` | `orders` | `favorite`

- [ ] **Step 1: Create `profile.vue` shell**

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const auth = useAuthStore()
const route = useRoute()

const nav = [
  { label: 'Данные', to: '/profile/info', match: '/profile/info' },
  { label: 'Заказы', to: '/profile/orders', match: '/profile/orders' },
  { label: 'Избранное', to: '/profile/favorite', match: '/profile/favorite' },
] as const

function isActive(match: string) {
  return route.path === match || route.path.startsWith(`${match}/`)
}

async function handleLogout() {
  await auth.logout()
  await navigateTo('/')
}

onMounted(async () => {
  if (!auth.hydrated) auth.hydrate()
  if (auth.accessToken) {
    try {
      await auth.fetchMe()
    }
    catch {
      auth.clearSession()
      await navigateTo('/login')
    }
  }
})
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 md:text-4xl">
          Личный кабинет
        </h1>
        <p
          v-if="auth.user"
          class="mt-2 text-neutral-600"
        >
          {{ auth.user.name }}
          <span class="text-neutral-400">·</span>
          {{ auth.user.email }}
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside class="space-y-1">
          <nav class="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            <NuxtLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              class="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              :class="
                isActive(item.match)
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              "
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
          <SkmButton
            variant="ghost"
            class="mt-4 w-full justify-start"
            @click="handleLogout"
          >
            Выйти
          </SkmButton>
        </aside>
        <div class="min-w-0">
          <NuxtPage />
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>
```

- [ ] **Step 2: `profile/index.vue` redirect**

```vue
<script setup lang="ts">
await navigateTo('/profile/info', { replace: true })
</script>

<template>
  <div />
</template>
```

- [ ] **Step 3: Replace `account/index.vue` with redirect**

```vue
<script setup lang="ts">
await navigateTo('/profile', { replace: true })
</script>

<template>
  <div />
</template>
```

- [ ] **Step 4: Update links + sitemap**

In `SkmUserMenu.vue` and `SkmMobileNav.vue`: `to="/account"` → `to="/profile"`.  
In `login.vue` / `register.vue`: default navigate `/profile`.  
In `nuxt.config.ts` sitemap exclude: replace `/account/**` with `/profile/**` (keep `/account` excluded too if desired).

- [ ] **Step 5: Manual smoke**

Run frontend (`npm run dev`). Login → header «Личный кабинет» opens `/profile` → lands on `/profile/info` (after Task 4). `/account` redirects. Logout from sidebar works.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/pages/profile.vue frontend/app/pages/profile/index.vue frontend/app/pages/account frontend/app/components/layout frontend/app/pages/login.vue frontend/app/pages/register.vue frontend/nuxt.config.ts
git commit -m "$(cat <<'EOF'
feat: add /profile shell and redirect /account

EOF
)"
```

---

### Task 4: `/profile/info` page

**Files:**
- Create: `frontend/app/pages/profile/info.vue`

**Interfaces:**
- Consumes: `useAuthStore()` for name/email; toast via `useToast()`

- [ ] **Step 1: Implement info form page**

Two `SkmCard` blocks:

1. Fields: email (disabled + hint), name, phone, company, inn, position — `SkmFormField` + `SkmInput`. Prefill name from `auth.user`. Save → `toast.add({ title: 'Сохранение появится после API', color: 'neutral' })`.
2. Password: current, new, confirm — same toast on submit.

Use local `ref` state; no API.

- [ ] **Step 2: Visually check at `/profile/info`**

Expected: forms render; email not editable; toasts on buttons.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/pages/profile/info.vue
git commit -m "$(cat <<'EOF'
feat: add profile info form shell with mock save

EOF
)"
```

---

### Task 5: Orders nested routes

**Files:**
- Create: `frontend/app/pages/profile/orders.vue`
- Create: `frontend/app/pages/profile/orders/index.vue`
- Create: `frontend/app/pages/profile/orders/active.vue`
- Create: `frontend/app/pages/profile/orders/completed.vue`
- Create: `frontend/app/pages/profile/orders/purchased.vue`

**Interfaces:**
- Consumes: mocks from Task 1; `SkmReviewCard` editMode from Task 2
- Produces: secondary nav tabs Active / Completed / Purchased

- [ ] **Step 1: `orders.vue` with secondary tabs**

```vue
<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'Активные', to: '/profile/orders/active' },
  { label: 'Завершённые', to: '/profile/orders/completed' },
  { label: 'Вы покупали', to: '/profile/orders/purchased' },
] as const
</script>

<template>
  <div>
    <nav class="mb-6 flex gap-1 overflow-x-auto border-b border-neutral-100 pb-2">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium"
        :class="
          route.path === tab.to
            ? 'bg-accent-50 text-accent-700'
            : 'text-neutral-600 hover:bg-neutral-50'
        "
      >
        {{ tab.label }}
      </NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>
```

Note: nested `orders.vue` under `profile.vue` — Nuxt nests both parents; ensure only one NuxtPage chain (profile → orders → leaf).

- [ ] **Step 2: Redirect `orders/index.vue` → active**

Same pattern as profile index.

- [ ] **Step 3: `active.vue` / `completed.vue`**

Map mocks to `SkmOrderCard` grid. Empty-state: «Пока нет заказов» if array empty.

- [ ] **Step 4: `purchased.vue`**

For each item: product title/description/link + below:
- if `review` → `<SkmReviewCard :author="auth.user?.name" ... />`
- else → `<SkmReviewCard edit-mode @submit="onSubmit(item.id, $event)" />`

On submit: toast + update local reactive copy of list (set review) so card flips to read mode.

- [ ] **Step 5: Smoke tabs**

Visit each orders URL; purchased edit submit flips to read locally.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/pages/profile/orders
git commit -m "$(cat <<'EOF'
feat: add profile orders tabs with mock purchased reviews

EOF
)"
```

---

### Task 6: Favorites page + docs polish

**Files:**
- Create: `frontend/app/pages/profile/favorite.vue`
- Modify: `frontend/README.md` routes (if not already matching)
- Modify: `docs/superpowers/specs/2026-07-30-personal-profile-design.md` — Status: P0 implemented when done

- [ ] **Step 1: `favorite.vue`**

Reactive copy of `PROFILE_FAVORITES`. Grid of `SkmCard` with name, description, `NuxtLink`, button «Убрать из избранного» (filter out of local list). Empty-state: text + link to `/catalog`.

- [ ] **Step 2: Lint changed pages**

Run: `cd frontend && npx eslint app/pages/profile app/pages/account app/constants/profile-mocks.ts app/components/ui/SkmReviewCard --max-warnings 0`

- [ ] **Step 3: End-to-end manual checklist**

- [ ] Login → `/profile` → `/profile/info`
- [ ] Sidebar: Данные / Заказы / Избранное
- [ ] Orders secondary tabs work
- [ ] Purchased: edit review → toast → read card
- [ ] Favorite remove works locally
- [ ] `/account` → `/profile`
- [ ] Header menu → `/profile`
- [ ] No avatar anywhere

- [ ] **Step 4: Update design status line**

In spec frontmatter/status: `P0 shell implemented` (date).

- [ ] **Step 5: Commit**

```bash
git add frontend/app/pages/profile/favorite.vue frontend/README.md docs/superpowers/specs/2026-07-30-personal-profile-design.md
git commit -m "$(cat <<'EOF'
feat: add profile favorites shell and mark P0 complete

EOF
)"
```

---

## Self-review

1. **Spec coverage:** P0 routes, layout, info, orders×3, favorite, ReviewCard editMode, redirects, no email change, no avatars — all tasked.  
2. **No placeholders:** concrete files and code.  
3. **Types:** mock types shared by orders/favorite pages; ReviewCard emit matches purchased handler.
