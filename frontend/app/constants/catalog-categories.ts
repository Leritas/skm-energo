export interface CatalogCategory {
  slug: string
  label: string
  children?: CatalogCategory[]
}

/** Normalized category tree (ref: legacy site line names). Rebuild planned for Stage 2+. */
export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    slug: 'predohraniteli',
    label: 'Предохранители, держатели и аксессуары',
    children: [
      { slug: 'nizkovoltnye-predohraniteli', label: 'Низковольтные предохранители' },
      { slug: 'plavkie-vn', label: 'Плавкие предохранители высокого напряжения' },
    ],
  },
  {
    slug: 'zashchita-perenapryazheniya',
    label: 'Устройства защиты от перенапряжения',
  },
  {
    slug: 'nizkovoltnye-rubilniki',
    label: 'Низковольтные рубильники',
  },
  {
    slug: 'vysokovoltnye-razediniteli',
    label: 'Высоковольтные разъединители и контакторы',
  },
  {
    slug: 'kontaktory-i-puskateli',
    label: 'Контакторы и пускатели',
  },
  {
    slug: 'kommutacionnye-apparaty',
    label: 'Коммутационные аппараты',
  },
  {
    slug: 'shiny-i-soediniteli',
    label: 'Шины и соединители',
  },
  {
    slug: 'aksessuary',
    label: 'Аксессуары для электрооборудования',
  },
  {
    slug: 'ibp-i-elektropitanie',
    label: 'ИБП и системы электропитания',
    children: [
      { slug: 'akkumulyatory', label: 'Аккумуляторные батареи' },
      { slug: 'ibp', label: 'Источники бесперебойного питания' },
      { slug: 'solnechnye-invertory', label: 'Солнечные инверторы' },
    ],
  },
]
