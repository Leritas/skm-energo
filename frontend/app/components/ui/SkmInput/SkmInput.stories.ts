import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmInput } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmInput',
  component: SkmInput,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'onBrand'],
    },
  },
} satisfies Meta<typeof SkmInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    placeholder: 'Ваше имя',
  },
  render: (args) => ({
    components: { SkmInput },
    setup: () => ({ args }),
    template: '<div class="max-w-sm p-4"><SkmInput v-bind="args" /></div>',
  }),
}

export const OnBrand: Story = {
  args: {
    variant: 'onBrand',
    placeholder: 'email@example.com',
  },
  render: (args) => ({
    components: { SkmInput },
    setup: () => ({ args }),
    template: `
      <div class="storybook-dark-preview dark bg-brand-purple-950 p-8 rounded-xl max-w-sm">
        <SkmInput v-bind="args" />
      </div>
    `,
  }),
}

