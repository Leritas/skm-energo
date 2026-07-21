import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmProductCard } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmProductCard',
  component: SkmProductCard,
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'select',
      options: ['grid', 'list'],
    },
  },
} satisfies Meta<typeof SkmProductCard>

export default meta
type Story = StoryObj<typeof meta>

const base = {
  title: 'Предохранитель NH00 160A',
  to: '/product/nh00-160a',
  manufacturer: 'MERSEN',
  sku: 'NH00-160',
}

export const Grid: Story = {
  args: { ...base, density: 'grid' },
  render: (args) => ({
    components: { SkmProductCard },
    setup: () => ({ args }),
    template: '<div class="max-w-xs p-4"><SkmProductCard v-bind="args" /></div>',
  }),
}

export const List: Story = {
  args: { ...base, density: 'list', badges: ['pdf'] },
  render: (args) => ({
    components: { SkmProductCard },
    setup: () => ({ args }),
    template: '<div class="max-w-xl p-4"><SkmProductCard v-bind="args" /></div>',
  }),
}

export const NoImage: Story = {
  args: { ...base, imageSrc: null },
  render: (args) => ({
    components: { SkmProductCard },
    setup: () => ({ args }),
    template: '<div class="max-w-xs p-4"><SkmProductCard v-bind="args" /></div>',
  }),
}

export const WithBadges: Story = {
  args: {
    ...base,
    badges: ['pdf', 'onRequest', 'new'],
  },
  render: (args) => ({
    components: { SkmProductCard },
    setup: () => ({ args }),
    template: '<div class="max-w-xs p-4"><SkmProductCard v-bind="args" /></div>',
  }),
}
