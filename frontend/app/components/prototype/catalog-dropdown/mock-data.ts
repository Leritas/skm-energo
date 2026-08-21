import type { PrototypeCatalogCategory } from './filter-prototype-tree';

/** PROTOTYPE — static fixture for /prototype/catalog-dropdown */
export const PROTOTYPE_CATALOG_DROPDOWN_DATA = {
  activeManufacturerSlug: null as string | null,
  manufacturers: [
    { slug: 'mersen', label: 'MERSEN' },
    { slug: 'casram', label: 'CASRAM' },
    { slug: 'lampar', label: 'Lampar' },
    { slug: 'hiitio', label: 'HIITIO' },
  ],
  categories: [
    {
      slug: 'predohraniteli',
      label: 'Предохранители, держатели и аксессуары',
      coverPhoto: null,
      manufacturerSlugs: ['mersen', 'casram', 'lampar'],
      children: [
        {
          slug: 'nizkovoltnye-predohraniteli',
          label: 'Низковольтные предохранители',
          coverPhoto: null,
          manufacturerSlugs: ['mersen', 'casram', 'lampar'],
          children: [
            {
              slug: 'plavkie-vstavki',
              label: 'Плавкие вставки',
              coverPhoto: null,
              manufacturerSlugs: ['mersen', 'lampar'],
              children: [
                {
                  slug: 'seriya-nh',
                  label: 'Серия NH',
                  coverPhoto: null,
                  manufacturerSlugs: ['mersen'],
                  children: [
                    {
                      slug: 'nh00',
                      label: 'NH00',
                      coverPhoto: null,
                      manufacturerSlugs: ['mersen'],
                    },
                    {
                      slug: 'nh1',
                      label: 'NH1',
                      coverPhoto: null,
                      manufacturerSlugs: ['mersen'],
                    },
                    {
                      slug: 'nh2',
                      label: 'NH2',
                      coverPhoto: null,
                      manufacturerSlugs: ['mersen'],
                    },
                  ],
                },
                {
                  slug: 'seriya-din',
                  label: 'DIN-рейка',
                  coverPhoto: null,
                  manufacturerSlugs: ['lampar'],
                },
              ],
            },
            {
              slug: 'derzhateli-nv',
              label: 'Держатели низковольтные',
              coverPhoto: null,
              manufacturerSlugs: ['mersen', 'casram'],
            },
          ],
        },
        {
          slug: 'plavkie-vn',
          label: 'Плавкие предохранители высокого напряжения',
          coverPhoto: null,
          manufacturerSlugs: ['casram'],
        },
      ],
    },
    {
      slug: 'zashchita-perenapryazheniya',
      label: 'Устройства защиты от перенапряжения',
      coverPhoto: null,
      manufacturerSlugs: ['mersen', 'hiitio'],
    },
    {
      slug: 'nizkovoltnye-rubilniki',
      label: 'Низковольтные рубильники',
      coverPhoto: null,
      manufacturerSlugs: ['mersen'],
    },
    {
      slug: 'vysokovoltnye-razediniteli',
      label: 'Высоковольтные разъединители и контакторы',
      coverPhoto: null,
      manufacturerSlugs: ['casram'],
    },
    {
      slug: 'kontaktory-i-puskateli',
      label: 'Контакторы и пускатели',
      coverPhoto: null,
      manufacturerSlugs: ['mersen', 'lampar'],
    },
    {
      slug: 'kommutacionnye-apparaty',
      label: 'Коммутационные аппараты',
      coverPhoto: null,
      manufacturerSlugs: ['lampar'],
    },
    {
      slug: 'ibp-i-elektropitanie',
      label: 'ИБП и системы электропитания',
      coverPhoto: null,
      manufacturerSlugs: ['hiitio'],
      children: [
        {
          slug: 'akkumulyatory',
          label: 'Аккумуляторные батареи',
          coverPhoto: null,
          manufacturerSlugs: ['hiitio'],
        },
        {
          slug: 'ibp',
          label: 'Источники бесперебойного питания',
          coverPhoto: null,
          manufacturerSlugs: ['hiitio'],
        },
        {
          slug: 'solnechnye-invertory',
          label: 'Солнечные инверторы',
          coverPhoto: null,
          manufacturerSlugs: ['hiitio'],
        },
      ],
    },
  ] satisfies PrototypeCatalogCategory[],
};
