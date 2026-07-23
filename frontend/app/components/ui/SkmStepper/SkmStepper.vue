<script setup lang="ts">
import type { SkmStepperStep } from './types'

defineProps<{
  steps: SkmStepperStep[]
  current: number
}>()
</script>

<template>
  <ol class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
    <li
      v-for="(step, index) in steps"
      :key="step.label"
      class="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center"
    >
      <div class="flex items-center gap-3 sm:flex-col sm:gap-2">
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          :class="
            index < current
              ? 'bg-accent-500 text-white'
              : index === current
                ? 'bg-brand-purple-950 text-white'
                : 'bg-neutral-100 text-neutral-400'
          "
        >
          {{ index + 1 }}
        </span>
        <div>
          <p
            class="text-sm font-medium"
            :class="index <= current ? 'text-neutral-950' : 'text-neutral-400'"
          >
            {{ step.label }}
          </p>
          <p
            v-if="step.description"
            class="mt-0.5 text-xs text-neutral-500"
          >
            {{ step.description }}
          </p>
        </div>
      </div>
      <div
        v-if="index < steps.length - 1"
        class="mt-4 hidden h-px flex-1 bg-neutral-200 sm:mt-0 sm:block sm:w-full"
        aria-hidden="true"
      />
    </li>
  </ol>
</template>
