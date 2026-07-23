import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmTextarea } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmTextarea',
  component: SkmTextarea,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'onBrand'],
    },
  },
} satisfies Meta<typeof SkmTextarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    placeholder: 'Ваш вопрос или комментарий',
    rows: 4,
  },
  render: (args) => ({
    components: { SkmTextarea },
    setup: () => ({ args }),
    template:
      '<div class="max-w-sm p-4"><SkmTextarea v-bind="args" /></div>',
  }),
}

export const OnBrand: Story = {
  args: {
    variant: 'onBrand',
    placeholder: 'Сообщение',
    rows: 4,
  },
  render: (args) => ({
    components: { SkmTextarea },
    setup: () => ({ args }),
    template: `
      <div class="storybook-dark-preview dark bg-brand-purple-950 p-8 rounded-xl max-w-sm">
        <SkmTextarea v-bind="args" />
      </div>
    `,
  }),
}

