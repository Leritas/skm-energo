import type { FormFieldProps } from '@nuxt/ui'

export type SkmFormTone = 'light' | 'brand'
export type SkmFieldVariant = 'default' | 'onBrand'

export const skmInputUi = {
  default: {
    base: 'bg-white text-neutral-900 placeholder:text-neutral-400 ring-neutral-200',
  },
  onBrand: {
    base: 'bg-white text-neutral-900 placeholder:text-neutral-400 ring-brand-purple-200/40',
  },
} as const

export const skmFormFieldUi: Record<
  SkmFormTone,
  NonNullable<FormFieldProps['ui']>
> = {
  light: {},
  brand: {
    label: 'text-brand-purple-100',
    hint: 'text-brand-purple-200',
    description: 'text-brand-purple-200',
    help: 'text-brand-purple-200',
    error: 'text-red-200',
  },
} as const

export type SkmPopoverVariant = 'default' | 'catalog'

export const skmPopoverContent = {
  default: {
    side: 'bottom' as const,
    sideOffset: 8,
  },
  catalog: {
    align: 'start' as const,
    class: '!bg-white p-0 shadow-lg ring-1 ring-neutral-100/80',
  },
} as const

export type SkmButtonTone = 'light' | 'brand'

/** Extra `:ui.base` classes for buttons on brand-purple surfaces */
export const skmButtonBrandUi = {
  primary: {
    base: '!bg-accent-500 !text-white hover:!bg-accent-600 disabled:!bg-accent-500 aria-disabled:!bg-accent-500',
  },
  secondary: {
    base: '!bg-white/12 !text-white hover:!bg-white/18 disabled:!bg-white/12',
  },
  outline: {
    base: '!bg-transparent ring-1 ring-inset !ring-white/45 !text-white hover:!bg-white/10',
  },
  ghost: {
    base: '!bg-transparent !text-white hover:!bg-white/10',
  },
} as const
