<script setup lang="ts">
import { PROFILE_PURCHASED_ITEMS } from '~/constants/profile-mocks'
import type { ProfilePurchasedItem } from '~/constants/profile-mocks'

const auth = useAuthStore()
const toast = useToast()

const items = ref<ProfilePurchasedItem[]>(
  PROFILE_PURCHASED_ITEMS.map(item => ({ ...item, review: item.review ? { ...item.review } : null })),
)

function formatReviewDate(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function onSubmit(itemId: string, payload: { rating: number; text: string }) {
  const item = items.value.find(entry => entry.id === itemId)
  if (!item) {
    return
  }

  item.review = {
    rating: payload.rating,
    text: payload.text,
    dateLabel: formatReviewDate(new Date()),
  }

  toast.add({
    title: 'Отзыв сохранён локально',
    color: 'neutral',
  })
}
</script>

<template>
  <div
    v-if="items.length === 0"
    class="text-sm text-neutral-500"
  >
    Пока нет заказов
  </div>
  <ul
    v-else
    class="space-y-6"
  >
    <li
      v-for="item in items"
      :key="item.id"
      class="space-y-4"
    >
      <div class="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
        <NuxtLink
          :to="item.to"
          class="group block"
        >
          <p class="text-sm font-semibold text-neutral-950 group-hover:text-accent-700">
            {{ item.name }}
          </p>
          <p class="mt-1 text-xs text-neutral-500">
            {{ item.description }}
          </p>
        </NuxtLink>
      </div>
      <SkmReviewCard
        v-if="item.review"
        :author="auth.user?.name"
        :date-label="item.review.dateLabel"
        :rating="item.review.rating"
        :text="item.review.text"
      />
      <SkmReviewCard
        v-else
        edit-mode
        @submit="onSubmit(item.id, $event)"
      />
    </li>
  </ul>
</template>
