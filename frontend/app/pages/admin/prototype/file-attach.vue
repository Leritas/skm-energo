<script setup lang="ts">
import FileAttachVariantA from '~/components/admin/prototype/variants/FileAttachVariantA.vue';
import FileAttachVariantB from '~/components/admin/prototype/variants/FileAttachVariantB.vue';
import FileAttachVariantC from '~/components/admin/prototype/variants/FileAttachVariantC.vue';
import PrototypeSwitcher from '~/components/admin/prototype/PrototypeSwitcher.vue';
import { useFileAttachPrototype } from '~/components/admin/prototype/file-attach-mock';

definePageMeta({
  middleware: ['admin'],
});

useSeoMeta({
  title: 'PROTOTYPE #54 — Admin file attach',
  robots: 'noindex, nofollow',
});

const route = useRoute();
const router = useRouter();

const variants = [
  { key: 'A', label: 'Split form + files column' },
  { key: 'B', label: 'Stacked filmstrip + table' },
  { key: 'C', label: 'Sticky side rail' },
] as const;

type VariantKey = (typeof variants)[number]['key'];

const variant = computed<VariantKey>(() => {
  const raw = route.query.variant;
  const key = typeof raw === 'string' ? raw.toUpperCase() : 'A';
  return variants.some((item) => item.key === key) ? (key as VariantKey) : 'A';
});

onMounted(() => {
  if (!route.query.variant) {
    router.replace({ query: { ...route.query, variant: 'A' } });
  }
});

const proto = useFileAttachPrototype();
</script>

<template>
  <div class="min-h-screen bg-neutral-100 pb-24">
    <div
      class="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <strong>PROTOTYPE #54</strong> — admin attach UX (throwaway). Mock state
      in memory. Переключайте варианты: <code>?variant=A|B|C</code> или стрелки
      ← → внизу.
    </div>

    <div class="mx-auto max-w-6xl px-4 py-8">
      <SkmPageHeader
        title="Attach Photos & Documents"
        description="Три радикально разных layout для #54. Табы: товар / новость / категория."
      />

      <FileAttachVariantA v-if="variant === 'A'" :proto="proto" />
      <FileAttachVariantB v-else-if="variant === 'B'" :proto="proto" />
      <FileAttachVariantC v-else :proto="proto" />

      <section
        class="mt-8 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
      >
        <h2 class="text-sm font-semibold text-neutral-900">
          Последнее «persist» (mock)
        </h2>
        <p class="mt-2 text-sm text-neutral-600">
          {{ proto.lastPersistAction.value }}
        </p>
        <pre
          class="mt-4 overflow-x-auto rounded-lg bg-neutral-950 p-4 text-xs text-neutral-100"
          >{{ proto.stateSnapshot.value }}</pre>
      </section>
    </div>

    <PrototypeSwitcher :variants="[...variants]" :current="variant" />
  </div>
</template>
