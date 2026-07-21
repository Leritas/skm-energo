import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmAlert } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmAlert',
  component: SkmAlert,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    title: 'Заявка отправлена',
    description: 'Мы свяжемся с вами в рабочее время.',
    tone: 'success',
    icon: 'i-lucide-check-circle',
  },
  render: (args) => ({
    components: { SkmAlert },
    setup: () => ({ args }),
    template: '<div class="max-w-lg p-4"><SkmAlert v-bind="args" /></div>',
  }),
}
