import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { SkmButton, SkmConfirmModal } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmConfirmModal',
  component: SkmConfirmModal,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmConfirmModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmConfirmModal, SkmButton },
    setup: () => ({ open: ref(false) }),
    template: `
      <div class="p-4">
        <SkmButton @click="open = true">Удалить</SkmButton>
        <SkmConfirmModal
          v-model:open="open"
          title="Удалить позицию?"
          description="Товар будет убран из корзины."
          confirm-label="Удалить"
          confirm-tone="danger"
        />
      </div>
    `,
  }),
}
