import type { StorybookConfig } from '@storybook/vue3-vite'
import ui from '@nuxt/ui/vite'
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
    config.plugins.push(
      vue(),
      ui({
        dts: false,
        colorMode: false,
        ui: {
          colors: {
            primary: 'accent',
            neutral: 'neutral',
          },
        },
      }),
    )
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': resolve(import.meta.dirname, '../app'),
      '@': resolve(import.meta.dirname, '../app'),
      '@skm/components': resolve(import.meta.dirname, '../app/components'),
    }
    return config
  },
}

export default config
