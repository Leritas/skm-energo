import type { Meta, StoryObj } from '@storybook/vue3'
import AppContainer from './AppContainer.vue'

const meta = {
  title: 'UI/AppContainer',
  component: AppContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof AppContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { AppContainer },
    template: `
      <AppContainer>
        <div class="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-neutral-500">
          Content area (max-w-7xl)
        </div>
      </AppContainer>
    `,
  }),
}
