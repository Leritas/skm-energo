import type { SkmOrderStatus } from '~/components/ui/SkmOrderStatusBadge/types'

export type ProfileOrderMock = {
  number: string
  dateLabel: string
  status: SkmOrderStatus
  totalLabel?: string
}

export type ProfilePurchasedItem = {
  id: string
  name: string
  description: string
  to: string
  review: null | { rating: number; text: string; dateLabel: string }
}

export type ProfileFavoriteItem = {
  id: string
  name: string
  description: string
  to: string
}

export const PROFILE_ACTIVE_ORDERS: ProfileOrderMock[] = [
  { number: 'SKM-1042', dateLabel: '18 июля 2026', status: 'processing' },
  { number: 'SKM-1045', dateLabel: '22 июля 2026', status: 'processing', totalLabel: 'по запросу' },
]

export const PROFILE_COMPLETED_ORDERS: ProfileOrderMock[] = [
  { number: 'SKM-1038', dateLabel: '5 июля 2026', status: 'completed' },
  { number: 'SKM-1021', dateLabel: '12 июня 2026', status: 'completed' },
]

export const PROFILE_PURCHASED_ITEMS: ProfilePurchasedItem[] = [
  {
    id: 'p1',
    name: 'Предохранитель MERSEN NH 160A',
    description: 'Заказ SKM-1038',
    to: '/product/mersen-nh-160a',
    review: {
      rating: 5,
      text: 'Оперативная поставка, документы в порядке.',
      dateLabel: '8 июля 2026',
    },
  },
  {
    id: 'p2',
    name: 'Рубильник HIITIO 250A',
    description: 'Заказ SKM-1021',
    to: '/product/hiitio-250a',
    review: null,
  },
]

export const PROFILE_FAVORITES: ProfileFavoriteItem[] = [
  {
    id: 'f1',
    name: 'Контактор CASRAM C9',
    description: 'Низковольтный контактор',
    to: '/product/casram-c9',
  },
  {
    id: 'f2',
    name: 'Разъединитель Lampar 400A',
    description: 'Силовой разъединитель',
    to: '/product/lampar-400a',
  },
]
