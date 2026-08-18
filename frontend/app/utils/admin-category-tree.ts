import type { AdminCategoryDto } from '@skm/specs';

export interface AdminCategoryTreeNode {
  category: AdminCategoryDto;
  children: AdminCategoryTreeNode[];
}

export interface AdminCategoryTreeRow {
  category: AdminCategoryDto;
  depth: number;
  hasChildren: boolean;
}

export interface AdminCategoryParentOption {
  value: number;
  label: string;
}

function compareCategoryName(left: AdminCategoryDto, right: AdminCategoryDto) {
  return left.name.localeCompare(right.name, 'ru');
}

export function getDescendantCategoryIds(
  categories: AdminCategoryDto[],
  categoryId: number,
): number[] {
  const descendants: number[] = [];

  function walk(parentId: number) {
    for (const category of categories) {
      if (category.parentId === parentId) {
        descendants.push(category.id);
        walk(category.id);
      }
    }
  }

  walk(categoryId);
  return descendants;
}

export function buildAdminCategoryForest(
  categories: AdminCategoryDto[],
): AdminCategoryTreeNode[] {
  const byParent = new Map<number | null, AdminCategoryDto[]>();
  const ids = new Set(categories.map((category) => category.id));

  for (const category of categories) {
    const parentId =
      category.parentId !== null && ids.has(category.parentId)
        ? category.parentId
        : null;
    const siblings = byParent.get(parentId) ?? [];
    siblings.push(category);
    byParent.set(parentId, siblings);
  }

  function attach(parentId: number | null): AdminCategoryTreeNode[] {
    const siblings = byParent.get(parentId) ?? [];
    return [...siblings].sort(compareCategoryName).map((category) => ({
      category,
      children: attach(category.id),
    }));
  }

  return attach(null);
}

export function filterAdminCategoryForest(
  forest: AdminCategoryTreeNode[],
  query: string,
): AdminCategoryTreeNode[] {
  const term = query.trim().toLowerCase();
  if (!term) {
    return forest;
  }

  function filter(nodes: AdminCategoryTreeNode[]): AdminCategoryTreeNode[] {
    const next: AdminCategoryTreeNode[] = [];

    for (const node of nodes) {
      const children = filter(node.children);
      const matches =
        node.category.name.toLowerCase().includes(term) ||
        node.category.slug.toLowerCase().includes(term);

      if (matches || children.length > 0) {
        next.push({
          category: node.category,
          children,
        });
      }
    }

    return next;
  }

  return filter(forest);
}

export function flattenAdminCategoryForest(
  forest: AdminCategoryTreeNode[],
  expandedIds: ReadonlySet<number>,
): AdminCategoryTreeRow[] {
  const rows: AdminCategoryTreeRow[] = [];

  function walk(nodes: AdminCategoryTreeNode[], depth: number) {
    for (const node of nodes) {
      const hasChildren = node.children.length > 0;
      rows.push({
        category: node.category,
        depth,
        hasChildren,
      });

      if (hasChildren && expandedIds.has(node.category.id)) {
        walk(node.children, depth + 1);
      }
    }
  }

  walk(forest, 0);
  return rows;
}

export function collectExpandableCategoryIds(
  forest: AdminCategoryTreeNode[],
): number[] {
  const ids: number[] = [];

  function walk(nodes: AdminCategoryTreeNode[]) {
    for (const node of nodes) {
      if (node.children.length > 0) {
        ids.push(node.category.id);
        walk(node.children);
      }
    }
  }

  walk(forest);
  return ids;
}

export function getCategoryParentOptions(
  categories: AdminCategoryDto[],
  editingId: number | null,
): AdminCategoryParentOption[] {
  const blocked = new Set<number>();
  if (editingId !== null) {
    blocked.add(editingId);
    for (const id of getDescendantCategoryIds(categories, editingId)) {
      blocked.add(id);
    }
  }

  const eligible = categories.filter(
    (category) => !blocked.has(category.id) && !category.deletedAt,
  );
  const forest = buildAdminCategoryForest(eligible);
  const options: AdminCategoryParentOption[] = [];

  function walk(nodes: AdminCategoryTreeNode[], depth: number) {
    for (const node of nodes) {
      const prefix = depth === 0 ? '' : `${'· '.repeat(depth)}`;
      options.push({
        value: node.category.id,
        label: `${prefix}${node.category.name}`,
      });
      walk(node.children, depth + 1);
    }
  }

  walk(forest, 0);
  return options;
}
