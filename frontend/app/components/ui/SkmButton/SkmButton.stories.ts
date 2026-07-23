import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmButton } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmButton',
  component: SkmButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    tone: {
      control: 'select',
      options: ['light', 'brand'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof SkmButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => ({
    components: { SkmButton },
    setup: () => ({ args }),
    template: '<SkmButton v-bind="args">Заказать звонок</SkmButton>',
  }),
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => ({
    components: { SkmButton },
    setup: () => ({ args }),
    template: '<SkmButton v-bind="args">Подробнее</SkmButton>',
  }),
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args) => ({
    components: { SkmButton },
    setup: () => ({ args }),
    template: '<SkmButton v-bind="args">Связаться</SkmButton>',
  }),
}

export const GhostIcon: Story = {
  args: {
    variant: 'ghost',
    icon: 'i-lucide-search',
  },
  render: (args) => ({
    components: { SkmButton },
    setup: () => ({ args }),
    template: '<SkmButton v-bind="args" aria-label="Поиск" />',
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { SkmButton },
    template: `
      <div class="flex flex-wrap gap-3 p-4">
        <SkmButton variant="primary">Primary</SkmButton>
        <SkmButton variant="secondary">Secondary</SkmButton>
        <SkmButton variant="outline">Outline</SkmButton>
        <SkmButton variant="ghost" icon="i-lucide-search" aria-label="Поиск" />
        <SkmButton variant="primary" disabled>Disabled</SkmButton>
      </div>
    `,
  }),
}

export const OnBrand: Story = {
  render: () => ({
    components: { SkmButton },
    template: `
      <div class="rounded-xl bg-brand-purple-950 p-8">
        <p class="mb-4 text-sm text-brand-purple-200">
          Кнопки на brand-поверхности — tone=&quot;brand&quot;
        </p>
        <div class="flex flex-wrap gap-3">
          <SkmButton tone="brand" variant="primary">Primary CTA</SkmButton>
          <SkmButton tone="brand" variant="secondary">Secondary</SkmButton>
          <SkmButton tone="brand" variant="outline">Outline</SkmButton>
          <SkmButton tone="brand" variant="ghost" icon="i-lucide-search" aria-label="Поиск" />
        </div>
      </div>
    `,
  }),
}
