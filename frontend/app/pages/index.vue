<script setup lang="ts">
const config = useRuntimeConfig()

interface HealthResponse {
  status: string
  timestamp: string
}

const { data: health, error } = await useFetch<HealthResponse>(
  `${config.public.apiBase}/health`,
)
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-16">
    <section class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <p class="text-sm font-medium uppercase tracking-wide text-blue-700">
        SKM-Energo
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight">
        СКМ-Энергосервис
      </h1>
      <p class="mt-4 max-w-2xl text-lg text-slate-600">
        Новый сайт компании: каталог высоковольтных компонентов, e-commerce и
        админ-панель. Контент добавляется через CMS — старый сайт используется
        только как референс.
      </p>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl border border-slate-200 p-4">
          <h2 class="font-semibold">Frontend</h2>
          <p class="mt-1 text-sm text-slate-600">Nuxt SSR (Vue 3)</p>
          <p class="mt-2 text-xs text-green-700">Рендеринг: server-side</p>
        </div>
        <div class="rounded-xl border border-slate-200 p-4">
          <h2 class="font-semibold">Backend API</h2>
          <p v-if="health" class="mt-1 text-sm text-green-700">
            {{ health.status }} — {{ health.timestamp }}
          </p>
          <p v-else class="mt-1 text-sm text-amber-700">
            API недоступен{{ error ? `: ${error.message}` : '' }}
          </p>
        </div>
      </div>

      <nav class="mt-8 flex flex-wrap gap-3">
        <NuxtLink
          to="/catalog"
          class="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Каталог
        </NuxtLink>
        <NuxtLink
          to="/admin"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Админка
        </NuxtLink>
      </nav>
    </section>
  </div>
</template>
