import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmBadge } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmBadge',
  component: SkmBadge,
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'accent', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof SkmBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'PDF', tone: 'neutral' },
  render: (args) => ({
    components: { SkmBadge },
    setup: () => ({ args }),
    template: '<SkmBadge v-bind="args" />',
  }),
}

export const AllTones: Story = {
  render: () => ({
    components: { SkmBadge },
    template: `
      <div class="flex flex-wrap gap-2 p-4">
        <SkmBadge label="PDF" tone="neutral" />
        <SkmBadge label="Новинка" tone="accent" />
        <SkmBadge label="Готово" tone="success" />
        <SkmBadge label="Под заказ" tone="warning" />
        <SkmBadge label="Ошибка" tone="danger" />
      </div>
    `,
  }),
}
