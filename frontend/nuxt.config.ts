// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath, URL } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  css: ['~/assets/css/main.css'],
  alias: {
    '@skm/components': fileURLToPath(new URL('./app/components', import.meta.url)),
  },
  colorMode: {
    preference: 'light',
    fallback: 'light',
    storageKey: 'skm-energo-color-mode',
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      // Keep barrel .ts exports for @skm/components; only auto-import SFCs.
      extensions: ['.vue'],
    },
  ],
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/sitemap',
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://skmenergo.ru',
    },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://skmenergo.ru',
    name: 'СКМ-Энергосервис',
  },
  sitemap: {
    exclude: ['/admin/**'],
  },
  devServer: {
    port: 3000,
  },
  app: {
    head: {
      title: 'СКМ-Энергосервис',
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'ООО СКМ-Энергосервис — поставка высоковольтных компонентов и электрооборудования',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
})
