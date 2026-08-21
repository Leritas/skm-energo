<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  variants: Array<{ key: string; name: string }>;
  current: string;
}>();

const route = useRoute();
const router = useRouter();

const isDev = import.meta.dev;

const currentVariant = computed(
  () =>
    props.variants.find((variant) => variant.key === props.current) ??
    props.variants[0],
);

function cycle(delta: number) {
  const index = props.variants.findIndex(
    (variant) => variant.key === props.current,
  );
  const nextIndex =
    (index + delta + props.variants.length) % props.variants.length;
  const next = props.variants[nextIndex];
  if (!next) {
    return;
  }
  router.replace({ query: { ...route.query, variant: next.key } });
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(target.closest('input, textarea, [contenteditable="true"]'));
}

function onKeydown(event: KeyboardEvent) {
  if (isEditableTarget(event.target)) {
    return;
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    cycle(-1);
  }
  if (event.key === 'ArrowRight') {
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
    class="fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-2 py-2 text-sm text-white shadow-2xl"
    role="toolbar"
    aria-label="Переключатель вариантов прототипа"
  >
    <button
      type="button"
      class="flex size-9 items-center justify-center rounded-full transition hover:bg-white/10"
      aria-label="Предыдущий вариант"
      @click="cycle(-1)"
    >
      <UIcon name="i-lucide-chevron-left" class="size-5" />
    </button>
    <div class="min-w-[14rem] px-2 text-center">
      <span class="font-mono text-accent-400">{{ currentVariant?.key }}</span>
      <span class="mx-1.5 text-neutral-500">—</span>
      <span>{{ currentVariant?.name }}</span>
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
