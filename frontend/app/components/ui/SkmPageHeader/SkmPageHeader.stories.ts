import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmBreadcrumbs, SkmPageHeader } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmPageHeader',
  component: SkmPageHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmPageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Каталог продукции',
    description: 'Оборудование ведущих производителей для промышленных применений.',
  },
  render: (args) => ({
    components: { SkmPageHeader, SkmBreadcrumbs },
    setup: () => ({
      args,
      breadcrumbs: [
        { label: 'Главная', to: '/' },
        { label: 'Каталог' },
      ],
    }),
    template: `
      <div class="p-6">
        <SkmPageHeader v-bind="args">
          <template #breadcrumbs>
            <SkmBreadcrumbs :items="breadcrumbs" />
          </template>
        </SkmPageHeader>
      </div>
    `,
  }),
}
