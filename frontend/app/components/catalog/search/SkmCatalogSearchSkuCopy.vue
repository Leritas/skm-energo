<script setup lang="ts">
const props = defineProps<{
  sku: string;
}>();

const copied = ref(false);

let resetTimer: ReturnType<typeof setTimeout> | null = null;

async function copySku(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();

  try {
    await navigator.clipboard.writeText(props.sku);
    copied.value = true;
    if (resetTimer) {
      clearTimeout(resetTimer);
    }
    resetTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    copied.value = false;
  }
}

onUnmounted(() => {
  if (resetTimer) {
    clearTimeout(resetTimer);
  }
});
</script>

<template>
  <button
    type="button"
    class="inline-flex cursor-pointer items-center gap-1 text-xs text-neutral-600 transition hover:text-neutral-800"
    :aria-label="copied ? 'Артикул скопирован' : `Скопировать артикул ${sku}`"
    @click="copySku"
  >
    <span
      >Арт.&nbsp;<span class="font-mono">{{ sku }}</span></span
    >
    <UIcon
      :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      class="size-3.5 shrink-0 transition"
      :class="copied ? 'text-green-600' : 'text-neutral-600'"
    />
  </button>
</template>
