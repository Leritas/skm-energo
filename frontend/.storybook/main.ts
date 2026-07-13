import type { StorybookConfig } from '@storybook/vue3-vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

const config: StorybookConfig = {
  stories: ['../app/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  async viteFinal(config) {
    config.plugins = config.plugins ?? []
    config.plugins.push(vue(), tailwindcss())
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': resolve(import.meta.dirname, '../app'),
      '@': resolve(import.meta.dirname, '../app'),
    }
    return config
  },
}

export default config
