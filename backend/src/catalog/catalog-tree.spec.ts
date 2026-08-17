import {
  filterProductsByCatalogFilter,
  filterVisibleCategoryTree,
  type CatalogCategoryNode,
  type CatalogProductRef,
} from './catalog-tree';

const categories: CatalogCategoryNode[] = [
  {
    slug: 'predohraniteli',
    label: 'Предохранители',
    children: [
      { slug: 'nizkovoltnye-predohraniteli', label: 'Низковольтные' },
      { slug: 'plavkie-vn', label: 'Плавкие ВН' },
    ],
  },
  {
    slug: 'ibp-i-elektropitanie',
    label: 'ИБП',
    children: [
      { slug: 'akkumulyatory', label: 'АКБ' },
      { slug: 'ibp', label: 'ИБП' },
      { slug: 'solnechnye-invertory', label: 'Инверторы' },
    ],
  },
  { slug: 'aksessuary', label: 'Аксессуары' },
];

const products: CatalogProductRef[] = [
  {
    slug: 'nh00-160a',
    categorySlug: 'nizkovoltnye-predohraniteli',
    manufacturerSlug: 'mersen',
  },
  {
    slug: 'fuse-link-6kv',
    categorySlug: 'plavkie-vn',
    manufacturerSlug: 'casram',
  },
  {
    slug: 'lamp-led',
    categorySlug: 'aksessuary',
    manufacturerSlug: 'lampar',
  },
  {
    slug: 'battery-12v100',
    categorySlug: 'akkumulyatory',
    manufacturerSlug: 'hiitio',
  },
];

describe('filterVisibleCategoryTree', () => {
  it('returns full tree when no manufacturer filter is active', () => {
    const tree = filterVisibleCategoryTree(categories, products, null);
    expect(tree.map((item) => item.slug)).toEqual([
      'predohraniteli',
      'ibp-i-elektropitanie',
      'aksessuary',
    ]);
    expect(
      tree.find((item) => item.slug === 'ibp-i-elektropitanie')?.children?.map(
        (child) => child.slug,
      ),
    ).toEqual(['akkumulyatory']);
  });

  it('hides empty branches when filtering by manufacturer', () => {
    const tree = filterVisibleCategoryTree(categories, products, 'mersen');
    expect(tree.map((item) => item.slug)).toEqual(['predohraniteli']);
    expect(tree[0]?.children?.map((child) => child.slug)).toEqual([
      'nizkovoltnye-predohraniteli',
    ]);
  });
});

describe('filterProductsByCatalogFilter', () => {
  it('filters by category slug including descendants', () => {
    const result = filterProductsByCatalogFilter(
      products,
      categories,
      'predohraniteli',
      null,
    );
    expect(result.map((item) => item.slug)).toEqual([
      'nh00-160a',
      'fuse-link-6kv',
    ]);
  });

  it('filters by manufacturer slug', () => {
    const result = filterProductsByCatalogFilter(
      products,
      categories,
      null,
      'hiitio',
    );
    expect(result.map((item) => item.slug)).toEqual(['battery-12v100']);
  });
});
