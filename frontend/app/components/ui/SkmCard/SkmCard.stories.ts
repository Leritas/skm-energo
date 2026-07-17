import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmCard } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmCard',
  component: SkmCard,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Предохранители, держатели и аксессуары',
    description: 'Комплексные решения для защиты электрооборудования',
  },
  render: (args) => ({
    components: { SkmCard },
    setup: () => ({ args }),
    template: '<div class="max-w-sm p-4"><SkmCard v-bind="args" /></div>',
  }),
}

export const WithLink: Story = {
  args: {
    title: 'Низковольтные рубильники',
    description: 'Коммутационные аппараты для низковольтных сетей',
    to: '/catalog',
  },
  render: (args) => ({
    components: { SkmCard },
    setup: () => ({ args }),
    template: '<div class="max-w-sm p-4"><SkmCard v-bind="args" /></div>',
  }),
}

export const DarkTheme: Story = {
  render: () => ({
    components: { SkmCard },
    template: `
      <div class="storybook-dark-preview dark bg-brand-purple-950 p-8 rounded-xl max-w-sm">
        <SkmCard
          title="Высоковольтные разъединители"
          description="Оборудование для высоковольтных распределительных сетей"
        />
      </div>
    `,
  }),
}

