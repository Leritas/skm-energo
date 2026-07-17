import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmFormField, SkmInput } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmFormField',
  component: SkmFormField,
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['light', 'brand'],
    },
  },
} satisfies Meta<typeof SkmFormField>

export default meta
type Story = StoryObj<typeof meta>

export const Light: Story = {
  args: {
    tone: 'light',
    label: 'Имя',
    required: true,
  },
  render: (args) => ({
    components: { SkmFormField, SkmInput },
    setup: () => ({ args }),
    template: `
      <div class="max-w-sm p-4">
        <SkmFormField v-bind="args">
          <SkmInput placeholder="Ваше имя" />
        </SkmFormField>
      </div>
    `,
  }),
}

export const Brand: Story = {
  args: {
    tone: 'brand',
    label: 'Email',
    required: true,
  },
  render: (args) => ({
    components: { SkmFormField, SkmInput },
    setup: () => ({ args }),
    template: `
      <div class="storybook-dark-preview dark bg-brand-purple-950 p-8 rounded-xl max-w-sm">
        <SkmFormField v-bind="args">
          <SkmInput variant="onBrand" placeholder="email@example.com" />
        </SkmFormField>
      </div>
    `,
  }),
}

