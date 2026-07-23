import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { SkmCartLine } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmCartLine',
  component: SkmCartLine,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmCartLine>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmCartLine },
    setup: () => ({ qty: ref(2) }),
    template: `
      <div class="max-w-lg p-4">
        <SkmCartLine
          v-model:quantity="qty"
          title="Предохранитель NH00 160A"
          to="/product/nh00-160a"
          sku="NH00-160"
        />
      </div>
    `,
  }),
}
