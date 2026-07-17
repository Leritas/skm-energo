import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmButton, SkmPopover } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmPopover',
  component: SkmPopover,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'catalog'],
    },
  },
} satisfies Meta<typeof SkmPopover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => ({
    components: { SkmPopover, SkmButton },
    setup: () => ({ args }),
    template: `
      <div class="p-8">
        <SkmPopover v-bind="args">
          <SkmButton variant="outline">Открыть</SkmButton>
          <template #content>
            <div class="p-4 text-sm text-neutral-700">
              Содержимое popover
            </div>
          </template>
        </SkmPopover>
      </div>
    `,
  }),
}

export const Catalog: Story = {
  args: {
    variant: 'catalog',
  },
  render: (args) => ({
    components: { SkmPopover },
    setup: () => ({ args }),
    template: `
      <div class="p-8">
        <SkmPopover v-bind="args">
          <button
            type="button"
            class="text-sm font-medium text-neutral-700 hover:text-accent-600"
          >
            Продукция
          </button>
          <template #content>
            <div class="w-72 py-2">
              <a
                href="#"
                class="block px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-brand-purple-50 hover:text-accent-600"
              >
                Предохранители
              </a>
              <a
                href="#"
                class="block px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-brand-purple-50 hover:text-accent-600"
              >
                Контакторы
              </a>
            </div>
          </template>
        </SkmPopover>
      </div>
    `,
  }),
}
