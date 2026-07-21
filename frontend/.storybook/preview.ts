import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import ui from '@nuxt/ui/vue-plugin'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import '../app/assets/css/main.css'

const NuxtLinkStub = defineComponent({
  name: 'NuxtLink',
  props: {
    to: { type: [String, Object], default: '#' },
  },
  setup(props, { slots }) {
    return () => {
      const content = slots.default ? slots.default() : undefined
      const href =
        typeof props.to === 'string'
          ? props.to
          : '#'
      return h('a', { href, class: 'storybook-nuxt-link' }, content)
    }
  },
})

/** UButton `to` uses vue-router RouterLink — needs a router in Storybook. */
const storybookRouter = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', name: 'story', component: { render: () => null } }],
})

setup((app) => {
  app.use(ui)
  app.use(storybookRouter)
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
