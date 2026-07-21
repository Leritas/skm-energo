import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmFileLink } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmFileLink',
  component: SkmFileLink,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmFileLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    href: '/files/catalog.pdf',
    filename: 'catalog-mersen.pdf',
    sizeLabel: '2.4 МБ',
  },
  render: (args) => ({
    components: { SkmFileLink },
    setup: () => ({ args }),
    template: '<div class="p-4"><SkmFileLink v-bind="args" /></div>',
  }),
}
