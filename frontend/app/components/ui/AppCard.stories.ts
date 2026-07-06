import type { Meta, StoryObj } from '@storybook/vue3'
import AppCard from './AppCard.vue'

const meta = {
  title: 'UI/AppCard',
  component: AppCard,
  tags: ['autodocs'],
} satisfies Meta<typeof AppCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Предохранители, держатели и аксессуары',
    description: 'Комплексные решения для защиты электрооборудования',
  },
  render: (args) => ({
    components: { AppCard },
    setup: () => ({ args }),
    template: '<div class="max-w-sm p-4"><AppCard v-bind="args" /></div>',
  }),
}

export const WithLink: Story = {
  args: {
    title: 'Низковольтные рубильники',
    description: 'Коммутационные аппараты для низковольтных сетей',
    to: '/catalog',
  },
  render: (args) => ({
    components: { AppCard },
    setup: () => ({ args }),
    template: '<div class="max-w-sm p-4"><AppCard v-bind="args" /></div>',
  }),
}

export const DarkTheme: Story = {
  render: () => ({
    components: { AppCard },
    template: `
      <div class="dark bg-brand-purple-950 p-8 rounded-xl max-w-sm">
        <AppCard
          title="Высоковольтные разъединители"
          description="Оборудование для высоковольтных распределительных сетей"
        />
      </div>
    `,
  }),
}
