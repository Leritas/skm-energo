import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmNewsCard } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmNewsCard',
  component: SkmNewsCard,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmNewsCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Расширение ассортимента HIITIO',
    to: '/news/hiitio-expand',
    dateLabel: '15 июля 2026',
    excerpt:
      'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
  },
  render: (args) => ({
    components: { SkmNewsCard },
    setup: () => ({ args }),
    template: '<div class="max-w-sm p-4"><SkmNewsCard v-bind="args" /></div>',
  }),
}
