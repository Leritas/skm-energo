export interface CatalogCategoryNode {
  slug: string;
  label: string;
  children?: CatalogCategoryNode[];
}

export interface CatalogProductRef {
  slug: string;
  categorySlug: string;
  manufacturerSlug: string;
}

function findCategoryPath(
  categories: CatalogCategoryNode[],
  targetSlug: string,
  trail: CatalogCategoryNode[] = [],
): CatalogCategoryNode[] | null {
  for (const category of categories) {
    const nextTrail = [...trail, category];
    if (category.slug === targetSlug) {
      return nextTrail;
    }
    if (category.children?.length) {
      const found = findCategoryPath(category.children, targetSlug, nextTrail);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function getDescendantCategorySlugs(
  categories: CatalogCategoryNode[],
  categorySlug: string,
): string[] {
  const path = findCategoryPath(categories, categorySlug);
  if (!path) {
    return [categorySlug];
  }

  const node = path[path.length - 1];
  const slugs: string[] = [node.slug];

  function collect(children: CatalogCategoryNode[] | undefined) {
    if (!children) {
      return;
    }
    for (const child of children) {
      slugs.push(child.slug);
      collect(child.children);
    }
  }

  collect(node.children);
  return slugs;
}

function productMatchesManufacturer(
  product: CatalogProductRef,
  manufacturerSlug: string | null,
): boolean {
  return !manufacturerSlug || product.manufacturerSlug === manufacturerSlug;
}

function categoryHasProducts(
  category: CatalogCategoryNode,
  categories: CatalogCategoryNode[],
  products: CatalogProductRef[],
  manufacturerSlug: string | null,
): boolean {
  const slugs = getDescendantCategorySlugs(categories, category.slug);
  return products.some(
    (product) =>
      slugs.includes(product.categorySlug)
      && productMatchesManufacturer(product, manufacturerSlug),
  );
}

export function filterVisibleCategoryTree(
  categories: CatalogCategoryNode[],
  products: CatalogProductRef[],
  manufacturerSlug: string | null,
): CatalogCategoryNode[] {
  function filterTree(nodes: CatalogCategoryNode[]): CatalogCategoryNode[] {
    const filtered: CatalogCategoryNode[] = [];

    for (const category of nodes) {
      const children = category.children
        ? filterTree(category.children)
        : undefined;
      const hasProducts = categoryHasProducts(
        category,
        categories,
        products,
        manufacturerSlug,
      );

      if (!hasProducts && !children?.length) {
        continue;
      }

      filtered.push({
        slug: category.slug,
        label: category.label,
        children: children?.length ? children : undefined,
      });
    }

    return filtered;
  }

  return filterTree(categories);
}

export function filterProductsByCatalogFilter(
  products: CatalogProductRef[],
  categories: CatalogCategoryNode[],
  categorySlug: string | null,
  manufacturerSlug: string | null,
): CatalogProductRef[] {
  return products.filter((product) => {
    if (!productMatchesManufacturer(product, manufacturerSlug)) {
      return false;
    }
    if (!categorySlug) {
      return true;
    }
    return getDescendantCategorySlugs(categories, categorySlug).includes(
      product.categorySlug,
    );
  });
}
