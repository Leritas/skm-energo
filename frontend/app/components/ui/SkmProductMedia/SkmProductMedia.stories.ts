import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmProductMedia } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmProductMedia',
  component: SkmProductMedia,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmProductMedia>

export default meta
type Story = StoryObj<typeof meta>

export const Placeholder: Story = {
  args: { alt: 'Товар без фото' },
  render: (args) => ({
    components: { SkmProductMedia },
    setup: () => ({ args }),
    template: '<div class="max-w-xs p-4"><SkmProductMedia v-bind="args" /></div>',
  }),
}

export const Square: Story = {
  args: { alt: 'Квадрат', aspect: '1/1' },
  render: (args) => ({
    components: { SkmProductMedia },
    setup: () => ({ args }),
    template: '<div class="max-w-xs p-4"><SkmProductMedia v-bind="args" /></div>',
  }),
}
