import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { SkmTabs } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmTabs',
  component: SkmTabs,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmTabs },
    setup: () => ({
      active: ref('desc'),
      items: [
        { label: 'Описание', value: 'desc', content: 'Описание товара для B2B-поставок.' },
        { label: 'Характеристики', value: 'specs', content: 'Таблица характеристик на PDP.' },
        { label: 'PDF', value: 'pdf', content: 'Ссылки на datasheet.' },
      ],
    }),
    template: `
      <div class="p-4">
        <SkmTabs v-model="active" :items="items" />
      </div>
    `,
  }),
}
