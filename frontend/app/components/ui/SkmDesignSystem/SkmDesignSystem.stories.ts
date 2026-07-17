import type { Meta, StoryObj } from '@storybook/vue3'
import {
  SkmBreadcrumbs,
  SkmButton,
  SkmCard,
  SkmContainer,
  SkmFormField,
  SkmInput,
  SkmSection,
  SkmTextarea,
} from '@skm/components'

const meta = {
  title: 'SKM Design System/Overview',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    components: {
      SkmBreadcrumbs,
      SkmButton,
      SkmCard,
      SkmContainer,
      SkmFormField,
      SkmInput,
      SkmSection,
      SkmTextarea,
    },
    setup: () => ({
      breadcrumbs: [
        { label: 'Главная', to: '/' },
        { label: 'Каталог', to: '/catalog' },
        { label: 'MERSEN' },
      ],
    }),
    template: `
      <div class="space-y-12">
        <SkmSection>
          <SkmContainer>
            <SkmBreadcrumbs :items="breadcrumbs" />
            <h2 class="text-2xl font-semibold text-neutral-950">SKM Design System</h2>
            <p class="mt-2 max-w-2xl text-sm text-neutral-600">
              Обзор основных примитивов UI Kit: кнопки, форма, карточки и layout-примитивы.
            </p>
          </SkmContainer>
        </SkmSection>

        <SkmSection tone="muted">
          <SkmContainer>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">Buttons</h3>
            <div class="mt-4 flex flex-wrap gap-3">
              <SkmButton variant="primary">Primary</SkmButton>
              <SkmButton variant="secondary">Secondary</SkmButton>
              <SkmButton variant="outline">Outline</SkmButton>
              <SkmButton variant="primary" disabled>Disabled</SkmButton>
            </div>
          </SkmContainer>
        </SkmSection>

        <SkmSection>
          <SkmContainer>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">Cards</h3>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <SkmCard
                title="Предохранители, держатели и аксессуары"
                description="Комплексные решения для защиты электрооборудования"
              />
              <SkmCard
                title="Низковольтные рубильники"
                description="Коммутационные аппараты для низковольтных сетей"
                to="/catalog"
              />
            </div>
          </SkmContainer>
        </SkmSection>

        <SkmSection tone="brand">
          <SkmContainer>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-brand-purple-100">Form (on brand)</h3>
            <div class="mt-4 max-w-md space-y-4 rounded-xl bg-brand-purple-900/25 p-6 ring-1 ring-brand-purple-800/40">
              <SkmFormField tone="brand" label="Имя" required>
                <SkmInput variant="onBrand" placeholder="Ваше имя" />
              </SkmFormField>
              <SkmFormField tone="brand" label="Email" required>
                <SkmInput variant="onBrand" type="email" placeholder="email@example.com" />
              </SkmFormField>
              <SkmFormField tone="brand" label="Сообщение" required>
                <SkmTextarea variant="onBrand" :rows="4" placeholder="Ваш вопрос или комментарий" />
              </SkmFormField>
              <div class="pt-2">
                <SkmButton variant="primary" type="button">Отправить</SkmButton>
              </div>
            </div>
          </SkmContainer>
        </SkmSection>
      </div>
    `,
  }),
}

