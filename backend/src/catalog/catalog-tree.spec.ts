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
    coverPhoto: null,
    children: [
      {
        slug: 'nizkovoltnye-predohraniteli',
        label: 'Низковольтные',
        coverPhoto: null,
      },
      { slug: 'plavkie-vn', label: 'Плавкие ВН', coverPhoto: null },
    ],
  },
  {
    slug: 'ibp-i-elektropitanie',
    label: 'ИБП',
    coverPhoto: null,
    children: [
      { slug: 'akkumulyatory', label: 'АКБ', coverPhoto: null },
      { slug: 'ibp', label: 'ИБП', coverPhoto: null },
      { slug: 'solnechnye-invertory', label: 'Инверторы', coverPhoto: null },
    ],
  },
  { slug: 'aksessuary', label: 'Аксессуары', coverPhoto: null },
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

  it('prunes empty leaf categories with no matching products', () => {
    const tree = filterVisibleCategoryTree(categories, products, null);
    const ibp = tree.find((item) => item.slug === 'ibp-i-elektropitanie');
    expect(ibp?.children?.map((child) => child.slug)).toEqual(['akkumulyatory']);
    expect(
      categories
        .find((item) => item.slug === 'ibp-i-elektropitanie')
        ?.children?.map((child) => child.slug),
    ).toEqual(['akkumulyatory', 'ibp', 'solnechnye-invertory']);
  });

  it('keeps parent when products exist only in a child category', () => {
    const tree = filterVisibleCategoryTree(categories, products, 'hiitio');
    expect(tree.map((item) => item.slug)).toEqual(['ibp-i-elektropitanie']);
    expect(tree[0]?.children?.map((child) => child.slug)).toEqual([
      'akkumulyatory',
    ]);
  });

  it('returns empty tree when manufacturer has no products', () => {
    const tree = filterVisibleCategoryTree(categories, products, 'unknown-mfr');
    expect(tree).toEqual([]);
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
