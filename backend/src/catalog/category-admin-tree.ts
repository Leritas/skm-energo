export interface CategoryParentRef {
  id: number;
  parentId: number | null;
}

export function getDescendantCategoryIds(
  categories: CategoryParentRef[],
  categoryId: number,
): number[] {
  const childrenByParent = new Map<number, number[]>();

  for (const category of categories) {
    if (category.parentId === null) {
      continue;
    }
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category.id);
    childrenByParent.set(category.parentId, siblings);
  }

  const descendants: number[] = [];

  function collect(id: number) {
    const children = childrenByParent.get(id) ?? [];
    for (const childId of children) {
      descendants.push(childId);
      collect(childId);
    }
  }

  collect(categoryId);
  return descendants;
}

export function wouldCreateCategoryCycle(
  categories: CategoryParentRef[],
  categoryId: number,
  newParentId: number | null,
): boolean {
  if (newParentId === null) {
    return false;
  }
  if (newParentId === categoryId) {
    return true;
  }
  return getDescendantCategoryIds(categories, categoryId).includes(newParentId);
}
