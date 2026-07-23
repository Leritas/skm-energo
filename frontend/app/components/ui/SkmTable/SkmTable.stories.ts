import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmTable } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmTable',
  component: SkmTable,
  tags: ['autodocs'],
} satisfies Meta<typeof SkmTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SkmTable },
    setup: () => ({
      data: [
        { label: 'Ток', value: '160 A' },
        { label: 'Напряжение', value: '690 V' },
      ],
      columns: [
        { accessorKey: 'label', header: 'Параметр' },
        { accessorKey: 'value', header: 'Значение' },
      ],
    }),
    template: `
      <div class="p-4">
        <SkmTable :data="data" :columns="columns" />
      </div>
    `,
  }),
}
