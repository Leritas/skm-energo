<script setup lang="ts">
const props = defineProps<{
  variants: Array<{ key: string; label: string }>;
  current: string;
}>();

const isDev = import.meta.dev;

const route = useRoute();
const router = useRouter();

const currentIndex = computed(() =>
  props.variants.findIndex((v) => v.key === props.current),
);

const currentLabel = computed(() => {
  const match = props.variants.find((v) => v.key === props.current);
  return match ? `${match.key} — ${match.label}` : props.current;
});

function cycle(delta: number) {
  const len = props.variants.length;
  if (len === 0) {
    return;
  }
  const nextIndex = (currentIndex.value + delta + len) % len;
  const next = props.variants[nextIndex]?.key ?? props.variants[0]!.key;
  router.replace({
    query: { ...route.query, variant: next },
  });
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  ) {
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

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div
    v-if="isDev"
    class="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white shadow-2xl"
    role="toolbar"
    aria-label="Переключатель вариантов прототипа"
  >
    <button
      type="button"
      class="rounded-full px-2 py-1 hover:bg-neutral-800"
      aria-label="Предыдущий вариант"
      @click="cycle(-1)"
    >
      ←
    </button>
    <span class="min-w-[14rem] text-center font-medium">{{
      currentLabel
    }}</span>
    <button
      type="button"
      class="rounded-full px-2 py-1 hover:bg-neutral-800"
      aria-label="Следующий вариант"
      @click="cycle(1)"
    >
      →
    </button>
  </div>
</template>
