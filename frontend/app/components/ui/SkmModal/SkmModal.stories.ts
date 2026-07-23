import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { SkmButton, SkmModal } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmModal',
  component: SkmModal,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmModal, SkmButton },
    setup: () => {
      const open = ref(false)
      return { open }
    },
    template: `
      <div class="p-8">
        <SkmButton @click="open = true">Открыть модалку</SkmButton>
        <SkmModal v-model:open="open" title="Заказать звонок">
          <template #body>
            <p class="text-sm text-neutral-600">
              Оставьте контакты — мы перезвоним в рабочее время.
            </p>
            <div class="mt-4 flex justify-end gap-3">
              <SkmButton variant="outline" @click="open = false">Отмена</SkmButton>
              <SkmButton @click="open = false">Отправить</SkmButton>
            </div>
          </template>
        </SkmModal>
      </div>
    `,
  }),
}
