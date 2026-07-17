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

