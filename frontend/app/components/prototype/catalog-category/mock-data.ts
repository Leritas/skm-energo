import type { PrototypeCatalogCategoryPageData } from './types';

/** PROTOTYPE — static fixture for /prototype/catalog-category */
export const PROTOTYPE_CATALOG_CATEGORY_DATA: PrototypeCatalogCategoryPageData =
  {
    title: 'Предохранители, держатели и аксессуары',
    description:
      'Низко- и высоковольтные предохранители, держатели и комплектующие. Поставка под заказ, техническая документация.',
    breadcrumbs: [
      { label: 'Каталог', to: '/catalog' },
      { label: 'Предохранители, держатели и аксессуары' },
    ],
    subcategories: [
      {
        slug: 'nizkovoltnye-predohraniteli',
        label: 'Низковольтные предохранители',
        coverUrl: 'https://picsum.photos/seed/nv-pred/800/600',
      },
      {
        slug: 'plavkie-vn',
        label: 'Плавкие предохранители высокого напряжения',
        coverUrl: 'https://picsum.photos/seed/vn-pred/800/600',
      },
      {
        slug: 'derzhateli',
        label: 'Держатели и аксессуары',
        coverUrl: null,
      },
    ],
    products: [
      {
        slug: 'nh00-160a',
        title: 'Предохранитель NH00 160A',
        subcategorySlug: 'nizkovoltnye-predohraniteli',
        manufacturer: 'MERSEN',
        sku: 'NH00-160',
        badges: ['pdf'],
        imageUrl: 'https://picsum.photos/seed/nh00/400/400',
      },
      {
        slug: 'nh1-250a',
        title: 'Предохранитель NH1 250A',
        subcategorySlug: 'nizkovoltnye-predohraniteli',
        manufacturer: 'MERSEN',
        sku: 'NH1-250',
        badges: [],
        imageUrl: 'https://picsum.photos/seed/nh1/400/400',
      },
      {
        slug: 'holder-nh1',
        title: 'Держатель NH1',
        subcategorySlug: 'derzhateli',
        manufacturer: 'MERSEN',
        sku: 'H-NH1',
        badges: ['onRequest'],
        imageUrl: null,
      },
      {
        slug: 'fuse-link-10kv',
        title: 'Плавкий предохранитель 10 kV',
        subcategorySlug: 'plavkie-vn',
        manufacturer: 'CASRAM',
        sku: 'FL-10KV',
        badges: ['pdf', 'new'],
        imageUrl: 'https://picsum.photos/seed/fl10/400/400',
      },
      {
        slug: 'fuse-link-6kv',
        title: 'Плавкий предохранитель 6 kV',
        subcategorySlug: 'plavkie-vn',
        manufacturer: 'CASRAM',
        sku: 'FL-6KV',
        badges: [],
        imageUrl: 'https://picsum.photos/seed/fl6/400/400',
      },
      {
        slug: 'nh2-400a',
        title: 'Предохранитель NH2 400A',
        subcategorySlug: 'nizkovoltnye-predohraniteli',
        manufacturer: 'Lampar',
        sku: 'NH2-400',
        badges: ['pdf'],
        imageUrl: 'https://picsum.photos/seed/nh2/400/400',
      },
    ],
  };
