import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { SkmPagination } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmPagination',
  component: SkmPagination,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmPagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmPagination },
    setup: () => ({ page: ref(1) }),
    template: `
      <div class="p-4">
        <SkmPagination v-model:page="page" :total="96" :items-per-page="12" />
      </div>
    `,
  }),
}
