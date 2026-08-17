export interface NavItem {
  label: string
  to: string
  children?: boolean
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Главная', to: '/' },
  { label: 'Продукция', to: '/catalog', children: true },
  { label: 'Услуги', to: '/services' },
  { label: 'Новости', to: '/news' },
  { label: 'Контакты', to: '/contacts' },
]

export const PRODUCT_DIRECTIONS = [
  {
    title: 'Предохранители, держатели и аксессуары',
    description: 'Комплексные решения для защиты электрооборудования',
    to: '/catalog/predohraniteli',
  },
  {
    title: 'Устройства защиты от перенапряжения',
    description: 'Надёжная защита от импульсных перенапряжений',
    to: '/catalog/zashchita-perenapryazheniya',
  },
  {
    title: 'Низковольтные рубильники',
    description: 'Коммутационные аппараты для низковольтных сетей',
    to: '/catalog/nizkovoltnye-rubilniki',
  },
  {
    title: 'Высоковольтные разъединители и контакторы',
    description: 'Оборудование для высоковольтных распределительных сетей',
    to: '/catalog/vysokovoltnye-razediniteli',
  },
] as const
