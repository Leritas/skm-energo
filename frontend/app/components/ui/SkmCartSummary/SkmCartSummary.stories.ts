import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmCartSummary } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmCartSummary',
  component: SkmCartSummary,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmCartSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { linesCount: 3 },
  render: (args) => ({
    components: { SkmCartSummary },
    setup: () => ({ args }),
    template: '<div class="max-w-sm p-4"><SkmCartSummary v-bind="args" /></div>',
  }),
}
