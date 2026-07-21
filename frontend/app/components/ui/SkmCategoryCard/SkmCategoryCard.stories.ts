import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmCategoryCard } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmCategoryCard',
  component: SkmCategoryCard,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmCategoryCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Предохранители',
    to: '/catalog/fuses',
    description: 'NH, цилиндрические и специальные серии',
  },
  render: (args) => ({
    components: { SkmCategoryCard },
    setup: () => ({ args }),
    template: '<div class="max-w-xs p-4"><SkmCategoryCard v-bind="args" /></div>',
  }),
}
