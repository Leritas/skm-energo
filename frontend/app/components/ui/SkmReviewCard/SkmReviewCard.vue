<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    author?: string
    dateLabel?: string
    text?: string
    rating?: number
    editMode?: boolean
  }>(),
  {
    author: undefined,
    dateLabel: undefined,
    text: undefined,
    rating: undefined,
    editMode: false,
  },
)

const emit = defineEmits<{
  submit: [{ rating: number; text: string }]
}>()

const draftText = ref(props.text ?? '')
const draftRating = ref(props.rating ?? 0)

function setRating(value: number) {
  draftRating.value = value
}

function handleSubmit() {
  if (draftRating.value < 1 || !draftText.value.trim()) {
    return
  }
  emit('submit', {
    rating: draftRating.value,
    text: draftText.value.trim(),
  })
}
</script>

<template>
  <article class="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
    <template v-if="!editMode">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-sm font-semibold text-neutral-950">
          {{ author }}
        </p>
        <time class="text-xs text-neutral-500">
          {{ dateLabel }}
        </time>
      </div>
      <p
        v-if="rating != null"
        class="mt-2 text-xs font-medium text-accent-600"
        aria-label="Оценка"
      >
        {{ '★'.repeat(rating) }}{{ '☆'.repeat(Math.max(0, 5 - rating)) }}
      </p>
      <p class="mt-3 text-sm leading-relaxed text-neutral-600">
        {{ text }}
      </p>
    </template>

    <template v-else>
      <p class="mb-3 text-sm font-semibold text-neutral-900">
        Оцените товар
      </p>
      <SkmFormField label="Отзыв">
        <SkmTextarea
          v-model="draftText"
          :rows="3"
          placeholder="Как прошла поставка?"
        />
      </SkmFormField>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div
          class="flex gap-1"
          role="group"
          aria-label="Оценка от 1 до 5"
        >
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="text-lg leading-none text-accent-600 transition-opacity hover:opacity-80"
            :aria-label="`${star} из 5`"
            :aria-pressed="draftRating === star"
            @click="setRating(star)"
          >
            {{ star <= draftRating ? '★' : '☆' }}
          </button>
        </div>
        <SkmButton
          type="button"
          :disabled="draftRating < 1 || !draftText.trim()"
          @click="handleSubmit"
        >
          Оценить
        </SkmButton>
      </div>
    </template>
  </article>
</template>
