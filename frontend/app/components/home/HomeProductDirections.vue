<script setup lang="ts">
import { PRODUCT_DIRECTIONS } from '~/constants/navigation'
</script>

<template>
  <AppSection alt>
    <AppContainer>
      <div class="mb-10 max-w-2xl">
        <h2 class="text-2xl font-bold text-neutral-900 md:text-3xl">
          Направления продукции
        </h2>
        <p class="mt-3 text-neutral-500">
          Некоторые разделы предлагаемой нами продукции
        </p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AppCard
          v-for="item in PRODUCT_DIRECTIONS"
          :key="item.title"
          :title="item.title"
          :description="item.description"
          :to="item.to"
        />
      </div>
    </AppContainer>
  </AppSection>
</template>
