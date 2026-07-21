import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmReviewCard } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmReviewCard',
  component: SkmReviewCard,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmReviewCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    author: 'ООО «ЭнергоСнаб»',
    dateLabel: '10 июня 2026',
    rating: 5,
    text: 'Оперативная поставка предохранителей MERSEN, документы в порядке.',
  },
  render: (args) => ({
    components: { SkmReviewCard },
    setup: () => ({ args }),
    template: '<div class="max-w-md p-4"><SkmReviewCard v-bind="args" /></div>',
  }),
}
