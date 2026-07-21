import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmProductGallery } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmProductGallery',
  component: SkmProductGallery,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmProductGallery>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { images: [], alt: 'Товар без фото' },
  render: (args) => ({
    components: { SkmProductGallery },
    setup: () => ({ args }),
    template: '<div class="max-w-md p-4"><SkmProductGallery v-bind="args" /></div>',
  }),
}
