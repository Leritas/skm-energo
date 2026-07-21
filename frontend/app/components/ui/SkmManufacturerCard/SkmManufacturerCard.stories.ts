import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmManufacturerCard } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmManufacturerCard',
  component: SkmManufacturerCard,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmManufacturerCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'MERSEN',
    to: '/catalog/mersen',
    linesCount: 4,
  },
  render: (args) => ({
    components: { SkmManufacturerCard },
    setup: () => ({ args }),
    template: '<div class="max-w-xs p-4"><SkmManufacturerCard v-bind="args" /></div>',
  }),
}
