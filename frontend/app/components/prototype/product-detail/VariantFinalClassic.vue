<script setup lang="ts">
import { ref } from 'vue';
import { prototypeGalleryImages } from './mock-data';
import type { PrototypeProductDetailVariantProps } from './types';

defineProps<PrototypeProductDetailVariantProps>();

const activeTab = ref('pdf');
const tabItems = [
  { label: 'Описание', value: 'desc', content: '' },
  { label: 'Характеристики', value: 'specs', content: '' },
  { label: 'Документы', value: 'pdf', content: '' },
];
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        :title="data.title"
        :description="`${data.manufacturer} · арт. ${data.sku}`"
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="data.breadcrumbs" />
        </template>
      </SkmPageHeader>

      <div class="mt-8 grid gap-10 lg:grid-cols-2">
        <SkmProductGallery
          v-if="data.photos.length"
          :images="prototypeGalleryImages(data)"
          :alt="data.title"
        />
        <SkmProductMedia v-else :src="null" :alt="data.title" aspect="4/3" />

        <div>
          <PrototypeProductBadges
            v-if="data.badges.length"
            :data="data"
            class="mb-4"
          />
          <p
            class="whitespace-pre-line text-sm leading-relaxed text-neutral-600"
          >
            {{ data.description }}
          </p>
          <div class="mt-6">
            <SkmButton variant="primary" to="/contacts">
              Запросить поставку
            </SkmButton>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <SkmTabs v-model="activeTab" :items="tabItems" />
        <div class="mt-6">
          <p
            v-if="activeTab === 'desc'"
            class="whitespace-pre-line text-sm leading-relaxed text-neutral-600"
          >
            {{ data.description }}
          </p>
          <SkmSpecList
            v-else-if="activeTab === 'specs' && data.specs.length"
            :items="data.specs"
          />
          <p v-else-if="activeTab === 'specs'" class="text-sm text-neutral-500">
            Характеристики пока не заполнены.
          </p>
          <PrototypeDocumentList
            v-else-if="activeTab === 'pdf'"
            :documents="data.documents"
          />
        </div>
      </div>

      <PrototypeSimilarGrid :items="data.similarProducts" />
    </SkmContainer>
  </SkmSection>
</template>
