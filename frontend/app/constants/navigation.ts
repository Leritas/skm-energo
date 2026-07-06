export interface CatalogChild {
  label: string
  to?: string
}

export interface CatalogItem {
  label: string
  to?: string
  children?: CatalogChild[]
}

export const CATALOG_TREE: CatalogItem[] = [
  {
    label: 'MERSEN',
    to: '/catalog/mersen',
    children: [
      { label: 'Предохранители, держатели и аксессуары' },
      { label: 'Устройства защиты от перенапряжения' },
      { label: 'Низковольтные рубильники' },
      { label: 'Высоковольтные разъединители и контакторы' },
      { label: 'Плавкие предохранители высокого напряжения' },
      { label: 'Контакторы и пускатели' },
      { label: 'Коммутационные аппараты' },
      { label: 'Шины и соединители' },
      { label: 'Аксессуары для электрооборудования' },
    ],
  },
  { label: 'CASRAM', to: '/catalog/casram' },
  { label: 'Lampar', to: '/catalog/lampar' },
  {
    label: 'HIITIO',
    to: '/catalog/hiitio',
    children: [
      { label: 'Аккумуляторные батареи' },
      { label: 'Источники бесперебойного питания' },
      { label: 'Системы электропитания' },
      { label: 'Солнечные инверторы' },
      { label: 'Контроллеры заряда' },
      { label: 'PDF-каталог' },
    ],
  },
]

export interface NavItem {
  label: string
  to: string
  children?: CatalogItem[]
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Главная', to: '/' },
  { label: 'Продукция', to: '/catalog', children: CATALOG_TREE },
  { label: 'Виды работ', to: '/services' },
  { label: 'Новости', to: '/news' },
  { label: 'Контакты', to: '/contacts' },
]

export const PRODUCT_DIRECTIONS = [
  {
    title: 'Предохранители, держатели и аксессуары',
    description: 'Комплексные решения для защиты электрооборудования',
    to: '/catalog',
  },
  {
    title: 'Устройства защиты от перенапряжения',
    description: 'Надёжная защита от импульсных перенапряжений',
    to: '/catalog',
  },
  {
    title: 'Низковольтные рубильники',
    description: 'Коммутационные аппараты для низковольтных сетей',
    to: '/catalog',
  },
  {
    title: 'Высоковольтные разъединители и контакторы',
    description: 'Оборудование для высоковольтных распределительных сетей',
    to: '/catalog',
  },
] as const
