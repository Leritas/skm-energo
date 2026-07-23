import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmOrderStatusBadge } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmOrderStatusBadge',
  component: SkmOrderStatusBadge,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmOrderStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {
  render: () => ({
    components: { SkmOrderStatusBadge },
    template: `
      <div class="flex flex-wrap gap-2 p-4">
        <SkmOrderStatusBadge status="pending" />
        <SkmOrderStatusBadge status="processing" />
        <SkmOrderStatusBadge status="shipped" />
        <SkmOrderStatusBadge status="completed" />
        <SkmOrderStatusBadge status="cancelled" />
      </div>
    `,
  }),
}
