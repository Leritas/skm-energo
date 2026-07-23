import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmOrderCard } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmOrderCard',
  component: SkmOrderCard,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmOrderCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    number: 'SKM-1042',
    dateLabel: '18 июля 2026',
    status: 'processing',
    to: '/account/orders/1042',
  },
  render: (args) => ({
    components: { SkmOrderCard },
    setup: () => ({ args }),
    template: '<div class="max-w-md p-4"><SkmOrderCard v-bind="args" /></div>',
  }),
}
