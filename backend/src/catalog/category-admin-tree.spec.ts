import {
  getDescendantCategoryIds,
  wouldCreateCategoryCycle,
} from './category-admin-tree';

const tree = [
  { id: 1, parentId: null },
  { id: 2, parentId: 1 },
  { id: 3, parentId: 1 },
  { id: 4, parentId: 2 },
  { id: 5, parentId: null },
];

describe('getDescendantCategoryIds', () => {
  it('returns nested descendants without the category itself', () => {
    expect(getDescendantCategoryIds(tree, 1)).toEqual([2, 4, 3]);
  });

  it('returns an empty list for a leaf', () => {
    expect(getDescendantCategoryIds(tree, 4)).toEqual([]);
  });
});

describe('wouldCreateCategoryCycle', () => {
  it('allows moving a node to the root', () => {
    expect(wouldCreateCategoryCycle(tree, 2, null)).toBe(false);
  });

  it('rejects a category as its own parent', () => {
    expect(wouldCreateCategoryCycle(tree, 2, 2)).toBe(true);
  });

  it('rejects a descendant as the new parent', () => {
    expect(wouldCreateCategoryCycle(tree, 1, 4)).toBe(true);
  });

  it('allows a sibling or unrelated node as the new parent', () => {
    expect(wouldCreateCategoryCycle(tree, 2, 3)).toBe(false);
    expect(wouldCreateCategoryCycle(tree, 2, 5)).toBe(false);
  });
});
