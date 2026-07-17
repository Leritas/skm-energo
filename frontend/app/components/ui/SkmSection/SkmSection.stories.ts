import type { Meta, StoryObj } from '@storybook/vue3'
import { SkmSection, SkmContainer } from '@skm/components'

const meta = {
  title: 'SKM Design System/SkmSection',
  component: SkmSection,
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['light', 'muted', 'brand'],
    },
    alt: { control: 'boolean' },
  },
} satisfies Meta<typeof SkmSection>

export default meta
type Story = StoryObj<typeof meta>

export const Light: Story = {
  args: { tone: 'light' },
  render: (args) => ({
    components: { SkmSection, SkmContainer },
    setup: () => ({ args }),
    template: `
      <SkmSection v-bind="args">
        <SkmContainer>
          <div class="rounded-lg border border-neutral-200 bg-white p-6">
            <div class="text-sm font-semibold text-neutral-900">Section content</div>
            <div class="mt-1 text-sm text-neutral-600">tone=light</div>
          </div>
        </SkmContainer>
      </SkmSection>
    `,
  }),
}

export const Muted: Story = {
  args: { tone: 'muted' },
  render: (args) => ({
    components: { SkmSection, SkmContainer },
    setup: () => ({ args }),
    template: `
      <SkmSection v-bind="args">
        <SkmContainer>
          <div class="rounded-lg border border-neutral-200 bg-white p-6">
            <div class="text-sm font-semibold text-neutral-900">Section content</div>
            <div class="mt-1 text-sm text-neutral-600">tone=muted</div>
          </div>
        </SkmContainer>
      </SkmSection>
    `,
  }),
}

export const Brand: Story = {
  args: { tone: 'brand' },
  render: (args) => ({
    components: { SkmSection, SkmContainer },
    setup: () => ({ args }),
    template: `
      <SkmSection v-bind="args">
        <SkmContainer>
          <div class="rounded-lg border border-brand-purple-800/40 bg-brand-purple-900/30 p-6">
            <div class="text-sm font-semibold text-white">Section content</div>
            <div class="mt-1 text-sm text-brand-purple-200">tone=brand</div>
          </div>
        </SkmContainer>
      </SkmSection>
    `,
  }),
}

