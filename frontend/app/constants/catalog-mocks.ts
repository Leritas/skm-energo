import type { CatalogManufacturer, ProductBadge } from '~/types/catalog';

export type Manufacturer = CatalogManufacturer;
export type { ProductBadge };

export interface MockProduct {
  slug: string;
  title: string;
  manufacturerSlug: string;
  categorySlug: string;
  sku: string;
  description: string;
  specs: Array<{ label: string; value: string }>;
  badges?: ProductBadge[];
  similarSlugs?: string[];
}

export const MANUFACTURERS: Manufacturer[] = [
  { slug: 'mersen', label: 'MERSEN' },
  { slug: 'casram', label: 'CASRAM' },
  { slug: 'lampar', label: 'Lampar' },
  { slug: 'hiitio', label: 'HIITIO' },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    slug: 'nh00-160a',
    title: 'Предохранитель NH00 160A',
    manufacturerSlug: 'mersen',
    categorySlug: 'nizkovoltnye-predohraniteli',
    sku: 'NH00-160',
    description:
      'Низковольтный предохранитель серии NH00 для промышленных распределительных щитов. Поставка под заказ, datasheet в PDF.',
    specs: [
      { label: 'Номинальный ток', value: '160 A' },
      { label: 'Напряжение', value: '690 V AC' },
      { label: 'Серия', value: 'NH00' },
    ],
    badges: ['pdf'],
    similarSlugs: ['fuse-link-6kv'],
  },
  {
    slug: 'nh1-250a',
    title: 'Предохранитель NH1 250A',
    manufacturerSlug: 'mersen',
    categorySlug: 'nizkovoltnye-predohraniteli',
    sku: 'NH1-250',
    description: 'Плавкий предохранитель NH1 для силовых цепей до 250 A.',
    specs: [
      { label: 'Номинальный ток', value: '250 A' },
      { label: 'Напряжение', value: '690 V AC' },
    ],
  },
  {
    slug: 'holder-nh1',
    title: 'Держатель NH1',
    manufacturerSlug: 'mersen',
    categorySlug: 'nizkovoltnye-predohraniteli',
    sku: 'H-NH1',
    description: 'Держатель для плавких вставок серии NH1.',
    specs: [{ label: 'Серия', value: 'NH1' }],
    badges: ['pdf'],
  },
  {
    slug: 'fuse-link-10kv',
    title: 'Плавкий предохранитель 10 kV',
    manufacturerSlug: 'mersen',
    categorySlug: 'plavkie-vn',
    sku: 'FL-10KV',
    description:
      'Высоковольтный плавкий предохранитель для распределительных сетей 10 kV.',
    specs: [{ label: 'Напряжение', value: '10 kV' }],
    badges: ['pdf', 'onRequest'],
    similarSlugs: ['fuse-link-6kv'],
  },
  {
    slug: 'fuse-link-6kv',
    title: 'Плавкий предохранитель 6 kV',
    manufacturerSlug: 'casram',
    categorySlug: 'plavkie-vn',
    sku: 'CAS-FL-6',
    description: 'Плавкий предохранитель CASRAM для сетей 6 kV.',
    specs: [{ label: 'Напряжение', value: '6 kV' }],
    badges: ['onRequest'],
    similarSlugs: ['fuse-link-10kv'],
  },
  {
    slug: 'spd-t2-40',
    title: 'SPD Type 2 40kA',
    manufacturerSlug: 'casram',
    categorySlug: 'zashchita-perenapryazheniya',
    sku: 'SPD-T2-40',
    description: 'Устройство защиты от импульсных перенапряжений типа 2.',
    specs: [{ label: 'Ток', value: '40 kA' }],
    similarSlugs: ['spd-t1-25'],
  },
  {
    slug: 'spd-t1-25',
    title: 'SPD Type 1 25kA',
    manufacturerSlug: 'mersen',
    categorySlug: 'zashchita-perenapryazheniya',
    sku: 'SPD-T1-25',
    description: 'Устройство защиты от перенапряжений класса T1.',
    specs: [{ label: 'Ток', value: '25 kA' }],
    badges: ['pdf'],
    similarSlugs: ['spd-t2-40'],
  },
  {
    slug: 'switch-250',
    title: 'Рубильник 250A 3P',
    manufacturerSlug: 'mersen',
    categorySlug: 'nizkovoltnye-rubilniki',
    sku: 'SW-250-3P',
    description: 'Трёхполюсный рубильник на 250 A для силовых щитов.',
    specs: [{ label: 'Номинальный ток', value: '250 A' }],
    badges: ['pdf', 'onRequest'],
  },
  {
    slug: 'switch-400-hiitio',
    title: 'Рубильник 400A 3P',
    manufacturerSlug: 'hiitio',
    categorySlug: 'nizkovoltnye-rubilniki',
    sku: 'HI-SW-400',
    description: 'Коммутационный рубильник HIITIO для промышленных нагрузок.',
    specs: [{ label: 'Номинальный ток', value: '400 A' }],
    badges: ['new'],
  },
  {
    slug: 'disconnector-12kv',
    title: 'Разъединитель 12 kV',
    manufacturerSlug: 'mersen',
    categorySlug: 'vysokovoltnye-razediniteli',
    sku: 'DS-12',
    description:
      'Высоковольтный разъединитель для распределительных устройств.',
    specs: [{ label: 'Напряжение', value: '12 kV' }],
    badges: ['onRequest'],
  },
  {
    slug: 'c09-220',
    title: 'Контактор C09 220V',
    manufacturerSlug: 'hiitio',
    categorySlug: 'kontaktory-i-puskateli',
    sku: 'C09-220',
    description: 'Модульный контактор для цепей управления 220 V.',
    specs: [{ label: 'Напряжение катушки', value: '220 V AC' }],
    badges: ['new'],
    similarSlugs: ['c12-380', 'contactor-casram'],
  },
  {
    slug: 'c12-380',
    title: 'Контактор C12 380V',
    manufacturerSlug: 'mersen',
    categorySlug: 'kontaktory-i-puskateli',
    sku: 'C12-380',
    description: 'Силовой контактор MERSEN для промышленных пускателей.',
    specs: [{ label: 'Напряжение катушки', value: '380 V AC' }],
    similarSlugs: ['c09-220', 'contactor-casram'],
  },
  {
    slug: 'contactor-casram',
    title: 'Контактор CAS-C25',
    manufacturerSlug: 'casram',
    categorySlug: 'kontaktory-i-puskateli',
    sku: 'CAS-C25',
    description: 'Контактор CASRAM серии C для цепей до 25 A.',
    specs: [{ label: 'Номинальный ток', value: '25 A' }],
    similarSlugs: ['c09-220', 'c12-380'],
  },
  {
    slug: 'lamp-led',
    title: 'Лампа сигнальная LED',
    manufacturerSlug: 'lampar',
    categorySlug: 'aksessuary',
    sku: 'LED-22',
    description: 'Сигнальная LED-лампа для щитового оборудования.',
    specs: [{ label: 'Напряжение', value: '24 V DC' }],
    badges: ['new'],
  },
  {
    slug: 'busbar-630',
    title: 'Шина медная 630A',
    manufacturerSlug: 'mersen',
    categorySlug: 'shiny-i-soediniteli',
    sku: 'BB-630',
    description: 'Медная шина для силовых распределительных щитов.',
    specs: [{ label: 'Номинальный ток', value: '630 A' }],
  },
  {
    slug: 'accessory-kit',
    title: 'Комплект аксессуаров для предохранителей',
    manufacturerSlug: 'casram',
    categorySlug: 'aksessuary',
    sku: 'CAS-AK-01',
    description:
      'Набор креплений и контактных элементов для держателей CASRAM.',
    specs: [{ label: 'Совместимость', value: 'CASRAM NH' }],
  },
  {
    slug: 'ibp-10kva',
    title: 'ИБП 10 kVA',
    manufacturerSlug: 'hiitio',
    categorySlug: 'ibp',
    sku: 'HI-UPS-10',
    description: 'Источник бесперебойного питания для промышленной автоматики.',
    specs: [{ label: 'Мощность', value: '10 kVA' }],
    badges: ['onRequest'],
  },
  {
    slug: 'battery-12v100',
    title: 'АКБ 12V 100Ah',
    manufacturerSlug: 'hiitio',
    categorySlug: 'akkumulyatory',
    sku: 'HI-BAT-100',
    description:
      'Свинцово-кислотная аккумуляторная батарея для систем резервного питания.',
    specs: [
      { label: 'Напряжение', value: '12 V' },
      { label: 'Ёмкость', value: '100 Ah' },
    ],
  },
];
