import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import ui from '@nuxt/ui/vue-plugin'
import { defineComponent, h } from 'vue'
import '../app/assets/css/main.css'

const NuxtLinkStub = defineComponent({
  name: 'NuxtLink',
  props: {
    to: { type: String, default: '#' },
  },
  setup(props, { slots }) {
    return () => {
      const content = slots.default ? slots.default() : undefined
      return h('a', { href: props.to, class: 'storybook-nuxt-link' }, content)
    }
  },
})

setup((app) => {
  app.use(ui)
  app.component('NuxtLink', NuxtLinkStub)
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
  },
}

export default preview
