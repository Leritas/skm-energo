import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmButton, SkmEmpty } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmEmpty',
  component: SkmEmpty,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmEmpty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Ничего не найдено',
    description: 'Попробуйте изменить параметры поиска или фильтры.',
  },
  render: (args) => ({
    components: { SkmEmpty, SkmButton },
    setup: () => ({ args }),
    template: `
      <SkmEmpty v-bind="args">
        <template #actions>
          <SkmButton variant="outline">Сбросить фильтры</SkmButton>
        </template>
      </SkmEmpty>
    `,
  }),
}
