import { NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';

function createPrismaMock(overrides: {
  product?: {
    findUnique?: jest.Mock;
    findMany?: jest.Mock;
  };
}) {
  return {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      ...overrides.product,
    },
    manufacturer: { findUnique: jest.fn() },
    category: { findUnique: jest.fn() },
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
          manufacturer: { slug: 'mersen' },
          category: { slug: 'nizkovoltnye-predohraniteli' },
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
});
