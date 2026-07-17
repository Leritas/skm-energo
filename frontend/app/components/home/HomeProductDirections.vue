<script setup lang="ts">
import { PRODUCT_DIRECTIONS } from '~/constants/navigation'
</script>

<template>
  <SkmSection alt>
    <SkmContainer>
      <div class="mb-10 max-w-2xl">
        <h2 class="text-2xl font-bold text-white md:text-3xl">
          Направления продукции
        </h2>
        <p class="mt-3 text-brand-purple-200">
          Некоторые разделы предлагаемой нами продукции
        </p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SkmCard
          v-for="item in PRODUCT_DIRECTIONS"
          :key="item.title"
          :title="item.title"
          :description="item.description"
          :to="item.to"
        />
      </div>
    </SkmContainer>
  </SkmSection>
</template>
