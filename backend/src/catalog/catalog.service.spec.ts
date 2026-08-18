import { NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';

function createPrismaMock(overrides: {
  product?: {
    findUnique?: jest.Mock;
    findMany?: jest.Mock;
  };
  $queryRaw?: jest.Mock;
}) {
  return {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      ...overrides.product,
    },
    manufacturer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $queryRaw: overrides.$queryRaw ?? jest.fn(),
  };
}

describe('CatalogService', () => {
  it('throws when product slug is missing', async () => {
    const prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const service = new CatalogService(prisma as never);

    await expect(service.getProductBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns product detail with specs and pdf reference', async () => {
    const prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue({
          slug: 'nh00-160a',
          title: 'Предохранитель NH00 160A',
          sku: 'NH00-160',
          description: 'Низковольтный предохранитель серии NH00.',
          specs: [{ label: 'Номинальный ток', value: '160 A' }],
          pdfHref: '/files/nh00-160a.pdf',
          badges: ['pdf'],
          similarSlugs: ['fuse-link-6kv'],
          manufacturer: { slug: 'mersen', isPublished: true, deletedAt: null },
          category: {
            slug: 'nizkovoltnye-predohraniteli',
            isPublished: true,
            deletedAt: null,
          },
        }),
      },
    };

    const service = new CatalogService(prisma as never);
    const result = await service.getProductBySlug('nh00-160a');

    expect(result).toEqual({
      slug: 'nh00-160a',
      title: 'Предохранитель NH00 160A',
      sku: 'NH00-160',
      description: 'Низковольтный предохранитель серии NH00.',
      specs: [{ label: 'Номинальный ток', value: '160 A' }],
      pdfHref: '/files/nh00-160a.pdf',
      badges: ['pdf'],
      manufacturerSlug: 'mersen',
      categorySlug: 'nizkovoltnye-predohraniteli',
    });
    expect(result).not.toHaveProperty('similarSlugs');
  });

  it('throws when listing similar products for a missing slug', async () => {
    const prisma = createPrismaMock({
      product: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    });

    const service = new CatalogService(prisma as never);

    await expect(service.listSimilarProducts('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns same-category products from other manufacturers', async () => {
    const prisma = createPrismaMock({
      product: {
        findUnique: jest.fn().mockResolvedValue({
          slug: 'fuse-link-10kv',
          categoryId: 2,
          manufacturerId: 1,
        }),
        findMany: jest.fn().mockResolvedValue([
          {
            slug: 'fuse-link-6kv',
            title: 'Плавкий предохранитель 6 kV',
            sku: 'CAS-FL-6',
            badges: ['onRequest'],
            manufacturer: { slug: 'casram' },
            category: { slug: 'plavkie-vn' },
          },
        ]),
      },
    });

    const service = new CatalogService(prisma as never);
    const result = await service.listSimilarProducts('fuse-link-10kv');

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        categoryId: 2,
        manufacturerId: { not: 1 },
        slug: { not: 'fuse-link-10kv' },
        manufacturer: { isPublished: true, deletedAt: null },
        category: { isPublished: true, deletedAt: null },
      },
      include: {
        manufacturer: true,
        category: true,
      },
      orderBy: { title: 'asc' },
      take: 3,
    });
    expect(result).toEqual([
      {
        slug: 'fuse-link-6kv',
        title: 'Плавкий предохранитель 6 kV',
        sku: 'CAS-FL-6',
        badges: ['onRequest'],
        manufacturerSlug: 'casram',
        categorySlug: 'plavkie-vn',
      },
    ]);
  });

  it('respects the similar products limit', async () => {
    const prisma = createPrismaMock({
      product: {
        findUnique: jest.fn().mockResolvedValue({
          slug: 'c09-220',
          categoryId: 5,
          manufacturerId: 4,
        }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    });

    const service = new CatalogService(prisma as never);
    await service.listSimilarProducts('c09-220', 2);

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 2 }),
    );
  });

  it('returns an empty list for blank search queries', async () => {
    const prisma = createPrismaMock({});

    const service = new CatalogService(prisma as never);
    const result = await service.searchProducts('   ');

    expect(result).toEqual([]);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('lists only published, non-deleted manufacturers', async () => {
    const prisma = createPrismaMock({});
    prisma.manufacturer.findMany = jest
      .fn()
      .mockResolvedValue([{ slug: 'mersen', name: 'Mersen' }]);

    const service = new CatalogService(prisma as never);
    const result = await service.listManufacturers();

    expect(prisma.manufacturer.findMany).toHaveBeenCalledWith({
      where: { isPublished: true, deletedAt: null },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual([{ slug: 'mersen', label: 'Mersen' }]);
  });

  it('loads only published, non-deleted categories for the public tree', async () => {
    const prisma = createPrismaMock({});
    prisma.category.findMany.mockResolvedValue([]);
    prisma.product.findMany.mockResolvedValue([]);

    const service = new CatalogService(prisma as never);
    await service.getCategoryTree(null);

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { isPublished: true, deletedAt: null },
      orderBy: [{ parentId: 'asc' }, { id: 'asc' }],
    });
  });

  it('hides a product whose category is unpublished', async () => {
    const prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue({
          slug: 'nh00-160a',
          title: 'Предохранитель NH00 160A',
          sku: 'NH00-160',
          description: 'Низковольтный предохранитель серии NH00.',
          specs: [],
          pdfHref: null,
          badges: [],
          manufacturer: { slug: 'mersen', isPublished: true, deletedAt: null },
          category: {
            slug: 'nizkovoltnye-predohraniteli',
            isPublished: false,
            deletedAt: null,
          },
        }),
      },
    };

    const service = new CatalogService(prisma as never);

    await expect(service.getProductBySlug('nh00-160a')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('searches products by title, sku, and manufacturer name', async () => {
    const prisma = createPrismaMock({
      $queryRaw: jest.fn().mockResolvedValue([
        {
          slug: 'nh00-160a',
          title: 'Предохранитель NH00 160A',
          sku: 'NH00-160',
          badges: ['pdf'],
          manufacturerSlug: 'mersen',
          categorySlug: 'nizkovoltnye-predohraniteli',
        },
      ]),
    });
    prisma.manufacturer.findFirst.mockResolvedValue({
      slug: 'mersen',
      isPublished: true,
      deletedAt: null,
    });

    const service = new CatalogService(prisma as never);
    const result = await service.searchProducts('NH00', null, 'mersen', 10);

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.manufacturer.findFirst).toHaveBeenCalledWith({
      where: { slug: 'mersen', isPublished: true, deletedAt: null },
    });
    expect(result).toEqual([
      {
        slug: 'nh00-160a',
        title: 'Предохранитель NH00 160A',
        sku: 'NH00-160',
        badges: ['pdf'],
        manufacturerSlug: 'mersen',
        categorySlug: 'nizkovoltnye-predohraniteli',
      },
    ]);
  });
});
