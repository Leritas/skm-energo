import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmSpecList } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmSpecList',
  component: SkmSpecList,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmSpecList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Номинальный ток', value: '160 A' },
      { label: 'Напряжение', value: '690 V AC' },
      { label: 'Серия', value: 'NH00' },
    ],
  },
  render: (args) => ({
    components: { SkmSpecList },
    setup: () => ({ args }),
    template: '<div class="max-w-lg p-4"><SkmSpecList v-bind="args" /></div>',
  }),
}
