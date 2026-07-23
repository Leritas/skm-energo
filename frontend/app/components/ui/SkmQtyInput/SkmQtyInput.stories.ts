import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { SkmQtyInput } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmQtyInput',
  component: SkmQtyInput,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmQtyInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmQtyInput },
    setup: () => ({ qty: ref(1) }),
    template: '<div class="p-4"><SkmQtyInput v-model="qty" /></div>',
  }),
}
