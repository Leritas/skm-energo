<script setup lang="ts">
import { MAIN_NAV } from '~/constants/navigation'
import { SITE } from '~/constants/site'

const year = new Date().getFullYear()

const footerNav = MAIN_NAV.filter((item) => item.to !== '/')
</script>

<template>
  <footer class="border-t border-neutral-100 bg-white">
    <AppContainer>
      <div class="grid gap-10 py-12 md:grid-cols-3">
        <!-- About -->
        <div>
          <img
            src="/logo.jpg"
            alt="СКМ-Энергосервис"
            class="mb-4 h-10 w-auto"
          />
          <p class="text-sm leading-relaxed text-neutral-500">
            {{ SITE.tagline }}
          </p>
        </div>

        <!-- Navigation -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-900">
            Навигация
          </h3>
          <ul class="space-y-2">
            <li v-for="item in footerNav" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="text-sm text-neutral-500 transition-colors hover:text-accent-600"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contacts -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-900">
            Контакты
          </h3>
          <ul class="space-y-2 text-sm text-neutral-500">
            <li>
              <a
                :href="SITE.phoneHref"
                class="hover:text-accent-600 transition-colors"
              >
                {{ SITE.phone }}
              </a>
            </li>
            <li>
              <a
                :href="`mailto:${SITE.email}`"
                class="hover:text-accent-600 transition-colors"
              >
                {{ SITE.email }}
              </a>
            </li>
            <li>{{ SITE.address }}</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-neutral-100 py-6 text-center text-xs text-neutral-400">
        © {{ year }} {{ SITE.legalName }}
      </div>
    </AppContainer>
  </footer>
</template>
