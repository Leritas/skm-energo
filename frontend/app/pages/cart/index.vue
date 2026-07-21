<script setup lang="ts">
import { ref } from 'vue'
import { SITE } from '~/constants/site'

useSeoMeta({
  title: `Корзина — ${SITE.name}`,
  description: 'Корзина запроса поставки (stub).',
})

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Корзина' },
]

const lines = ref([
  {
    id: '1',
    title: 'Предохранитель NH00 160A',
    to: '/product/nh00-160a',
    sku: 'NH00-160',
    quantity: 2,
  },
  {
    id: '2',
    title: 'Контактор C09 220V',
    to: '/product/c09-220',
    sku: 'C09-220',
    quantity: 1,
  },
])

const confirmOpen = ref(false)
const pendingRemoveId = ref<string | null>(null)

function askRemove(id: string) {
  pendingRemoveId.value = id
  confirmOpen.value = true
}

function confirmRemove() {
  if (pendingRemoveId.value) {
    lines.value = lines.value.filter((line) => line.id !== pendingRemoveId.value)
  }
  pendingRemoveId.value = null
}
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader title="Корзина" description="Stub на mock-данных. Цены — по запросу.">
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <SkmEmpty
        v-if="!lines.length"
        title="Корзина пуста"
        description="Добавьте товары с карточки продукта."
      >
        <template #actions>
          <SkmButton to="/catalog" variant="outline">
            В каталог
          </SkmButton>
        </template>
      </SkmEmpty>

      <div
        v-else
        class="grid gap-8 lg:grid-cols-[1fr_280px]"
      >
        <div>
          <SkmCartLine
            v-for="line in lines"
            :key="line.id"
            v-model:quantity="line.quantity"
            :title="line.title"
            :to="line.to"
            :sku="line.sku"
            @remove="askRemove(line.id)"
          />
        </div>
        <SkmCartSummary :lines-count="lines.length" />
      </div>

      <SkmConfirmModal
        v-model:open="confirmOpen"
        title="Удалить позицию?"
        description="Товар будет убран из корзины."
        confirm-label="Удалить"
        confirm-tone="danger"
        @confirm="confirmRemove"
      />
    </SkmContainer>
  </SkmSection>
</template>
