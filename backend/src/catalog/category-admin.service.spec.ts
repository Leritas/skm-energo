import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from '@skm/specs';
import { CategoryAdminService } from './category-admin.service';

const CATEGORY_ADMIN_INCLUDE = {
  _count: {
    select: {
      products: true,
      children: { where: { deletedAt: null } },
    },
  },
  photos: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
} as const;

function createUrlsMock() {
  return {
    toAttachedPhoto: jest.fn((photo: { id: number }) => ({
      id: photo.id,
      url: `http://localhost:3001/photos/${photo.id}`,
      filename: 'cover.jpg',
      sizeBytes: 100,
      mimeType: 'image/jpeg',
    })),
  };
}

function createPrismaMock() {
  return {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
  };
}

function categoryRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: 'predohraniteli',
    name: 'Предохранители',
    description: null,
    seoTitle: null,
    seoDescription: null,
    parentId: null,
    isPublished: true,
    deletedAt: null,
    _count: { products: 0, children: 0 },
    photos: [],
    ...overrides,
  };
}

describe('CategoryAdminService', () => {
  it('lists active categories by default', async () => {
    const prisma = createPrismaMock();
    prisma.category.findMany.mockResolvedValue([
      categoryRow({ _count: { products: 2, children: 1 } }),
    ]);

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );
    const result = await service.listCategories(false);

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: CATEGORY_ADMIN_INCLUDE,
    });
    expect(result).toEqual([
      {
        id: 1,
        slug: 'predohraniteli',
        name: 'Предохранители',
        description: null,
        seoTitle: null,
        seoDescription: null,
        parentId: null,
        isPublished: true,
        deletedAt: null,
        productCount: 2,
        childCount: 1,
        coverPhoto: null,
      },
    ]);
  });

  it('includes archived categories when requested', async () => {
    const prisma = createPrismaMock();
    prisma.category.findMany.mockResolvedValue([]);

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );
    await service.listCategories(true);

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('creates a category unpublished by default', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique.mockResolvedValue(null);
    prisma.category.findMany.mockResolvedValue([]);
    prisma.category.create.mockResolvedValue(
      categoryRow({
        id: 8,
        slug: 'new-branch',
        name: 'Новая ветка',
        isPublished: false,
      }),
    );

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );
    const result = await service.create({
      slug: 'new-branch',
      name: 'Новая ветка',
    });

    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        slug: 'new-branch',
        name: 'Новая ветка',
        description: null,
        seoTitle: null,
        seoDescription: null,
        parentId: null,
        isPublished: false,
      },
      include: CATEGORY_ADMIN_INCLUDE,
    });
    expect(result.isPublished).toBe(false);
  });

  it('rejects a missing parent on create', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique.mockResolvedValue(null);

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );

    await expect(
      service.create({
        slug: 'child',
        name: 'Child',
        parentId: 99,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.category.create).not.toHaveBeenCalled();
  });

  it('blocks archive when products reference the category', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique.mockResolvedValue(categoryRow());
    prisma.category.count.mockResolvedValue(0);
    prisma.product.count.mockResolvedValue(3);

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );

    await expect(service.softDelete(1)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('blocks archive when child categories exist', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique.mockResolvedValue(categoryRow());
    prisma.category.count.mockResolvedValue(2);
    prisma.product.count.mockResolvedValue(0);

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );

    await expect(service.softDelete(1)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('archives empty categories', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique.mockResolvedValue(categoryRow());
    prisma.category.count.mockResolvedValue(0);
    prisma.product.count.mockResolvedValue(0);
    prisma.category.update.mockResolvedValue(
      categoryRow({
        isPublished: false,
        deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    );

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );
    const result = await service.softDelete(1);

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        deletedAt: expect.any(Date),
        isPublished: false,
      },
      include: CATEGORY_ADMIN_INCLUDE,
    });
    expect(result.isPublished).toBe(false);
    expect(result.deletedAt).toBe('2026-08-18T10:00:00.000Z');
  });

  it('restores archived categories', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique.mockResolvedValue(
      categoryRow({
        isPublished: false,
        deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    );
    prisma.category.update.mockResolvedValue(
      categoryRow({ isPublished: false, deletedAt: null }),
    );

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );
    const result = await service.restore(1);

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: null },
      include: CATEGORY_ADMIN_INCLUDE,
    });
    expect(result.deletedAt).toBeNull();
  });

  it('rejects slug change without absolute control', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique.mockResolvedValue(categoryRow());
    prisma.category.findMany.mockResolvedValue([categoryRow()]);

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );

    await expect(
      service.update(1, { slug: 'renamed' }, [Permission.canManageCategories]),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('allows slug change with absolute control', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique
      .mockResolvedValueOnce(categoryRow())
      .mockResolvedValueOnce(null);
    prisma.category.findMany.mockResolvedValue([categoryRow()]);
    prisma.category.update.mockResolvedValue(categoryRow({ slug: 'renamed' }));

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );
    const result = await service.update(1, { slug: 'renamed' }, [
      Permission.hasAbsoluteControl,
    ]);

    expect(prisma.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'renamed' }),
      }),
    );
    expect(result.slug).toBe('renamed');
  });

  it('rejects a parent that would create a cycle', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique.mockResolvedValue(categoryRow());
    prisma.category.findMany.mockResolvedValue([
      categoryRow(),
      categoryRow({ id: 2, slug: 'child', parentId: 1 }),
    ]);

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );

    await expect(
      service.update(1, { parentId: 2 }, [Permission.canManageCategories]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('rejects restore when the parent is archived', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique
      .mockResolvedValueOnce(
        categoryRow({
          id: 2,
          parentId: 1,
          isPublished: false,
          deletedAt: new Date('2026-08-18T10:00:00.000Z'),
        }),
      )
      .mockResolvedValueOnce(
        categoryRow({
          deletedAt: new Date('2026-08-18T09:00:00.000Z'),
        }),
      );

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );

    await expect(service.restore(2)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('throws when updating a missing category', async () => {
    const prisma = createPrismaMock();
    prisma.category.findUnique.mockResolvedValue(null);

    const service = new CategoryAdminService(
      prisma as never,
      createUrlsMock() as never,
    );

    await expect(
      service.update(99, { name: 'Missing' }, [Permission.canManageCategories]),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
