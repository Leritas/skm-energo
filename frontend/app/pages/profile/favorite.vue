<script setup lang="ts">
import { PROFILE_FAVORITES } from '~/constants/profile-mocks'
import type { ProfileFavoriteItem } from '~/constants/profile-mocks'

const favorites = ref<ProfileFavoriteItem[]>(
  PROFILE_FAVORITES.map(item => ({ ...item })),
)

function removeFavorite(id: string) {
  favorites.value = favorites.value.filter(item => item.id !== id)
}
</script>

<template>
  <div
    v-if="favorites.length === 0"
    class="text-sm text-neutral-500"
  >
    В избранном пока ничего нет.
    <NuxtLink
      to="/catalog"
      class="font-medium text-accent-700 hover:underline"
    >
      Перейти в каталог
    </NuxtLink>
  </div>
  <div
    v-else
    class="grid gap-4 sm:grid-cols-2"
  >
    <SkmCard
      v-for="item in favorites"
      :key="item.id"
      :title="item.name"
      :description="item.description"
    >
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <NuxtLink
          :to="item.to"
          class="text-sm font-medium text-accent-700 hover:underline"
        >
          Перейти к товару
        </NuxtLink>
        <SkmButton
          variant="ghost"
          size="sm"
          @click="removeFavorite(item.id)"
        >
          Убрать из избранного
        </SkmButton>
      </div>
    </SkmCard>
  </div>
</template>
