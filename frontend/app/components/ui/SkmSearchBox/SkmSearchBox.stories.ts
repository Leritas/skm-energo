import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { SkmSearchBox } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmSearchBox',
  component: SkmSearchBox,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmSearchBox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmSearchBox },
    setup: () => ({ query: ref('') }),
    template: `
      <div class="max-w-md p-4">
        <SkmSearchBox v-model="query" placeholder="Поиск по каталогу" />
      </div>
    `,
  }),
}
