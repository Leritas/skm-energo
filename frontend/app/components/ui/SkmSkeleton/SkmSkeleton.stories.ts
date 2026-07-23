import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmSkeleton } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmSkeleton',
  component: SkmSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmSkeleton },
    template: `
      <div class="space-y-3 p-4">
        <SkmSkeleton class="h-40 w-full rounded-xl" />
        <SkmSkeleton class="h-4 w-2/3" />
        <SkmSkeleton class="h-4 w-1/2" />
      </div>
    `,
  }),
}
