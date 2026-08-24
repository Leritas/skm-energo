<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import SkmButton from '../SkmButton/SkmButton.vue';

const props = withDefaults(
  defineProps<{
    min?: number;
    max?: number;
    disabled?: boolean;
  }>(),
  {
    min: 1,
    max: 99999,
    disabled: false,
  },
);

const model = defineModel<number>({ default: 1 });

const draft = ref(String(model.value));

watch(model, (value) => {
  draft.value = String(value);
});

const canDec = computed(() => !props.disabled && model.value > props.min);
const canInc = computed(() => !props.disabled && model.value < props.max);

function clamp(value: number) {
  return Math.min(props.max, Math.max(props.min, value));
}

function dec() {
  if (canDec.value) {
    model.value -= 1;
  }
}

function inc() {
  if (canInc.value) {
    model.value += 1;
  }
}

function commitDraft() {
  const parsed = Number.parseInt(draft.value.trim(), 10);
  if (Number.isNaN(parsed)) {
    draft.value = String(model.value);
    return;
  }
  model.value = clamp(parsed);
  draft.value = String(model.value);
}

function onDraftInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const digits = target.value.replace(/\D/g, '').slice(0, 5);

  if (!digits) {
    draft.value = '';
    return;
  }

  let parsed = Number.parseInt(digits, 10);
  if (parsed > props.max) {
    parsed = props.max;
  }

  draft.value = String(parsed);
  model.value = parsed;
}
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <SkmButton
      variant="outline"
      size="sm"
      :disabled="!canDec"
      aria-label="Уменьшить"
      @click="dec"
    >
      −
    </SkmButton>
    <input
      :value="draft"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      :disabled="disabled"
      aria-label="Количество"
      class="h-8 w-[3.625rem] rounded-md border border-neutral-200 bg-white px-1 text-center text-sm font-medium tabular-nums text-neutral-950 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
      @input="onDraftInput"
      @blur="commitDraft"
      @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
    />
    <SkmButton
      variant="outline"
      size="sm"
      :disabled="!canInc"
      aria-label="Увеличить"
      @click="inc"
    >
      +
    </SkmButton>
  </div>
</template>
