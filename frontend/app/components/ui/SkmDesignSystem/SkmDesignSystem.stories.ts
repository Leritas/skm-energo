import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import {
  SkmAlert,
  SkmBadge,
  SkmBreadcrumbs,
  SkmButton,
  SkmCard,
  SkmCartLine,
  SkmCartSummary,
  SkmContainer,
  SkmEmpty,
  SkmFormField,
  SkmInput,
  SkmManufacturerCard,
  SkmModal,
  SkmNewsCard,
  SkmOrderCard,
  SkmPopover,
  SkmProductCard,
  SkmQtyInput,
  SkmSection,
  SkmSkeleton,
  SkmStepper,
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
      SkmAlert,
      SkmBadge,
      SkmBreadcrumbs,
      SkmButton,
      SkmCard,
      SkmCartLine,
      SkmCartSummary,
      SkmContainer,
      SkmEmpty,
      SkmFormField,
      SkmInput,
      SkmManufacturerCard,
      SkmModal,
      SkmNewsCard,
      SkmOrderCard,
      SkmPopover,
      SkmProductCard,
      SkmQtyInput,
      SkmSection,
      SkmSkeleton,
      SkmStepper,
      SkmTextarea,
    },
    setup: () => ({
      breadcrumbs: [
        { label: 'Главная', to: '/' },
        { label: 'Каталог', to: '/catalog' },
        { label: 'MERSEN' },
      ],
      modalOpen: ref(false),
      cartQty: ref(2),
    }),
    template: `
      <div class="space-y-12">
        <SkmSection>
          <SkmContainer>
            <SkmBreadcrumbs :items="breadcrumbs" />
            <h2 class="text-2xl font-semibold text-neutral-950">SKM Design System</h2>
            <p class="mt-2 max-w-2xl text-sm text-neutral-600">
              Обзор примитивов и доменных карточек UI Kit.
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
              <SkmButton variant="ghost" icon="i-lucide-search" aria-label="Поиск" />
              <SkmButton variant="primary" disabled>Disabled</SkmButton>
            </div>
          </SkmContainer>
        </SkmSection>

        <SkmSection>
          <SkmContainer>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">Badges</h3>
            <div class="mt-4 flex flex-wrap gap-2">
              <SkmBadge label="PDF" tone="neutral" />
              <SkmBadge label="Новинка" tone="accent" />
              <SkmBadge label="Под заказ" tone="warning" />
              <SkmBadge label="Готово" tone="success" />
              <SkmBadge label="Ошибка" tone="danger" />
            </div>
          </SkmContainer>
        </SkmSection>

        <SkmSection tone="muted">
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

        <SkmSection>
          <SkmContainer>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">Catalog &amp; News</h3>
            <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SkmProductCard
                title="Предохранитель NH00 160A"
                to="/product/nh00-160a"
                manufacturer="MERSEN"
                sku="NH00-160"
                :badges="['pdf', 'new']"
              />
              <SkmNewsCard
                title="Расширение ассортимента HIITIO"
                to="/news/hiitio-expand"
                date-label="15 июля 2026"
                excerpt="Новые линейки контакторов и реле."
              />
              <SkmManufacturerCard
                name="MERSEN"
                to="/catalog/mersen"
                :lines-count="4"
              />
            </div>
            <div class="mt-8 grid gap-4 md:grid-cols-2">
              <SkmEmpty
                title="Ничего не найдено"
                description="Измените параметры поиска."
              />
              <div class="space-y-3 rounded-xl border border-neutral-100 p-4">
                <SkmSkeleton class="h-32 w-full rounded-lg" />
                <SkmSkeleton class="h-4 w-2/3" />
                <SkmSkeleton class="h-4 w-1/2" />
              </div>
            </div>
          </SkmContainer>
        </SkmSection>

        <SkmSection tone="muted">
          <SkmContainer>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">Commerce &amp; Account</h3>
            <SkmStepper
              class="mt-4"
              :current="1"
              :steps="[
                { label: 'Корзина' },
                { label: 'Данные' },
                { label: 'Подтверждение' },
              ]"
            />
            <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_240px]">
              <SkmCartLine
                v-model:quantity="cartQty"
                title="Предохранитель NH00 160A"
                sku="NH00-160"
                to="/product/nh00-160a"
              />
              <SkmCartSummary :lines-count="1" />
            </div>
            <div class="mt-6 grid gap-4 md:grid-cols-2">
              <SkmOrderCard
                number="SKM-1042"
                date-label="18 июля 2026"
                status="processing"
              />
              <div class="space-y-3">
                <SkmAlert
                  title="Заявка отправлена"
                  description="Менеджер свяжется в рабочее время."
                  tone="success"
                  icon="i-lucide-check-circle"
                />
                <p class="text-xs text-neutral-500">
                  Toast: используйте <code class="rounded bg-neutral-100 px-1">useToast()</code>
                  Nuxt UI с едиными текстами («Заявка отправлена», «Ошибка отправки»).
                  Отдельный SkmToast не требуется.
                </p>
                <SkmQtyInput v-model="cartQty" />
              </div>
            </div>
          </SkmContainer>
        </SkmSection>

        <SkmSection>
          <SkmContainer>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">Overlays</h3>
            <div class="mt-4 flex flex-wrap gap-3">
              <SkmPopover variant="catalog">
                <SkmButton variant="outline">Popover catalog</SkmButton>
                <template #content>
                  <div class="w-56 py-2">
                    <div class="px-4 py-2 text-sm font-semibold text-neutral-900">Предохранители</div>
                    <div class="px-4 py-2 text-sm font-semibold text-neutral-900">Контакторы</div>
                  </div>
                </template>
              </SkmPopover>
              <SkmButton variant="primary" @click="modalOpen = true">Открыть modal</SkmButton>
              <SkmModal v-model:open="modalOpen" title="Заказать звонок">
                <template #body>
                  <p class="text-sm text-neutral-600">Демо SkmModal из Overview.</p>
                  <div class="mt-4 flex justify-end">
                    <SkmButton variant="outline" @click="modalOpen = false">Закрыть</SkmButton>
                  </div>
                </template>
              </SkmModal>
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
                <SkmButton tone="brand" variant="primary" type="button">Отправить</SkmButton>
              </div>
            </div>
          </SkmContainer>
        </SkmSection>
      </div>
    `,
  }),
}
