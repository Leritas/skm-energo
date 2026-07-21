export type SkmProductCardBadge = 'pdf' | 'onRequest' | 'new'

export interface SkmProductCardProps {
  title: string
  to: string
  imageSrc?: string | null
  imageAlt?: string
  manufacturer?: string
  sku?: string
  badges?: SkmProductCardBadge[]
  density?: 'grid' | 'list'
}
