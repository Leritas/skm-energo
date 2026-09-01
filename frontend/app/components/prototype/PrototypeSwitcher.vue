<script setup lang="ts">
export type PrototypeVariantOption = {
  key: string;
  name: string;
};

const props = defineProps<{
  variants: readonly PrototypeVariantOption[];
  current: string;
}>();

const isDev = import.meta.dev;

const route = useRoute();
const router = useRouter();

const currentMeta = computed(
  () =>
    props.variants.find((variant) => variant.key === props.current) ??
    props.variants[0]!,
);

function cycle(delta: number) {
  const keys = props.variants.map((variant) => variant.key);
  const index = keys.indexOf(props.current);
  const nextIndex = (index + delta + keys.length) % keys.length;
  const nextKey = keys[nextIndex]!;

  void router.replace({
    query: { ...route.query, variant: nextKey },
  });
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    target.closest('input, textarea, [contenteditable="true"]')
  ) {
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    cycle(-1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    cycle(1);
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div
    v-if="isDev"
    class="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-2 text-white shadow-2xl"
    role="toolbar"
    aria-label="Переключение вариантов прототипа"
  >
    <button
      type="button"
      class="flex size-9 items-center justify-center rounded-full transition hover:bg-white/10"
      aria-label="Предыдущий вариант"
      @click="cycle(-1)"
    >
      <UIcon name="i-lucide-chevron-left" class="size-5" />
    </button>

    <div class="min-w-[220px] px-3 text-center text-sm">
      <span class="font-mono font-semibold text-accent-400">{{
        currentMeta.key
      }}</span>
      <span class="text-neutral-400"> · </span>
      <span>{{ currentMeta.name }}</span>
    </div>

    <button
      type="button"
      class="flex size-9 items-center justify-center rounded-full transition hover:bg-white/10"
      aria-label="Следующий вариант"
      @click="cycle(1)"
    >
      <UIcon name="i-lucide-chevron-right" class="size-5" />
    </button>
  </div>
</template>
