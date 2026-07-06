import type { Meta, StoryObj } from '@storybook/vue3'
import AppBreadcrumbs from './AppBreadcrumbs.vue'

const meta = {
  title: 'UI/AppBreadcrumbs',
  component: AppBreadcrumbs,
  tags: ['autodocs'],
} satisfies Meta<typeof AppBreadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Главная', to: '/' },
      { label: 'Каталог' },
    ],
  },
}

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'Главная', to: '/' },
      { label: 'Каталог', to: '/catalog' },
      { label: 'MERSEN' },
    ],
  },
}

export const FourLevels: Story = {
  args: {
    items: [
      { label: 'Главная', to: '/' },
      { label: 'Каталог', to: '/catalog' },
      { label: 'MERSEN', to: '/catalog/mersen' },
      { label: 'Предохранители' },
    ],
  },
}
