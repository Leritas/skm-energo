import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { SkmButton, SkmSlideover } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmSlideover',
  component: SkmSlideover,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmSlideover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmSlideover, SkmButton },
    setup: () => ({ open: ref(false) }),
    template: `
      <div class="p-4">
        <SkmButton @click="open = true">Открыть</SkmButton>
        <SkmSlideover v-model:open="open" title="Меню" side="right">
          <template #body>
            <p class="text-sm text-neutral-600">Контент slideover.</p>
          </template>
        </SkmSlideover>
      </div>
    `,
  }),
}
