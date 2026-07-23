import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmContainer } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmContainer',
  component: SkmContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmContainer },
    template: `
      <SkmContainer>
        <div class="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-neutral-500">
          Content area (max-w-7xl)
        </div>
      </SkmContainer>
    `,
  }),
}

