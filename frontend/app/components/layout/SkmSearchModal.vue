<script setup lang="ts">
import { SkmSearchBox } from '@skm/components';
import { buildCatalogUrl } from '~/utils/catalog';

const open = defineModel<boolean>('open', { default: false });

const query = ref('');

function handleClose() {
  open.value = false;
  query.value = '';
}

async function handleSubmit(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  await navigateTo(buildCatalogUrl(null, null, trimmed));
  handleClose();
}
</script>

<template>
  <SkmModal v-model:open="open" title="Поиск по каталогу">
    <template #body>
      <p class="mb-4 text-sm text-neutral-600">
        Найдите продукцию по названию, артикулу или производителю.
      </p>
      <SkmSearchBox
        v-model="query"
        placeholder="Например, NH00 или MERSEN"
        @submit="handleSubmit"
      />
      <div class="mt-4 flex justify-end">
        <SkmButton variant="outline" type="button" @click="handleClose">
          Отмена
        </SkmButton>
      </div>
    </template>
  </SkmModal>
</template>
