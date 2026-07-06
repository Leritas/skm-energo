import type { Meta, StoryObj } from '@storybook/vue3'

/**
 * AppButton design tokens — visual reference for Storybook.
 * Production component wraps Nuxt UI UButton (requires Nuxt runtime).
 */
const meta = {
  title: 'UI/AppButton',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const variantClasses = {
  primary:
    'inline-flex items-center justify-center rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600',
  secondary:
    'inline-flex items-center justify-center rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200',
  outline:
    'inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-400',
} as const

export const Primary: Story = {
  render: () => ({
    template: `<button class="${variantClasses.primary}">Заказать звонок</button>`,
  }),
}

export const Secondary: Story = {
  render: () => ({
    template: `<button class="${variantClasses.secondary}">Подробнее</button>`,
  }),
}

export const Outline: Story = {
  render: () => ({
    template: `<button class="${variantClasses.outline}">Связаться</button>`,
  }),
}

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-3 p-4">
        <button class="${variantClasses.primary}">Primary</button>
        <button class="${variantClasses.secondary}">Secondary</button>
        <button class="${variantClasses.outline}">Outline</button>
      </div>
    `,
  }),
}

export const DarkTheme: Story = {
  render: () => ({
    template: `
      <div class="dark bg-brand-purple-950 p-8 rounded-xl">
        <div class="flex flex-wrap gap-3">
          <button class="${variantClasses.primary}">Primary CTA</button>
          <button class="${variantClasses.secondary}">Secondary</button>
          <button class="${variantClasses.outline}">Outline</button>
        </div>
      </div>
    `,
  }),
}
