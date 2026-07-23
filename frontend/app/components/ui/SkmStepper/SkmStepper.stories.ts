import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmStepper } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmStepper',
  component: SkmStepper,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmStepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    current: 1,
    steps: [
      { label: 'Корзина' },
      { label: 'Данные' },
      { label: 'Подтверждение' },
    ],
  },
  render: (args) => ({
    components: { SkmStepper },
    setup: () => ({ args }),
    template: '<div class="p-6"><SkmStepper v-bind="args" /></div>',
  }),
}
