import { NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';

function createUrlsMock() {
  return {
    toAttachedPhoto: jest.fn((photo: {
      id: number;
      filename: string;
      sizeBytes: number;
      mimeType: string;
    }) => ({
      id: photo.id,
      url: `http://localhost:3001/photos/${photo.id}`,
      filename: photo.filename,
      sizeBytes: photo.sizeBytes,
      mimeType: photo.mimeType,
    })),
    toAttachedDocument: jest.fn((document: {
      id: number;
      filename: string;
      sizeBytes: number;
      mimeType: string;
    }) => ({
      id: document.id,
      url: `http://localhost:3001/documents/${document.id}`,
      filename: document.filename,
      sizeBytes: document.sizeBytes,
      mimeType: document.mimeType,
    })),
  };
}

const PRODUCT_MEDIA_INCLUDE = {
  manufacturer: true,
  category: true,
  photos: { orderBy: { sortOrder: 'asc' } },
  documents: { orderBy: { sortOrder: 'asc' } },
};

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

    const service = new CatalogService(prisma as never, createUrlsMock() as never);

    await expect(service.getProductBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns product detail with photos, documents, and derived pdf badge', async () => {
    const prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue({
          slug: 'nh00-160a',
          title: 'Предохранитель NH00 160A',
          sku: 'NH00-160',
          description: 'Низковольтный предохранитель серии NH00.',
          specs: [{ label: 'Номинальный ток', value: '160 A' }],
          badges: [],
          similarSlugs: ['fuse-link-6kv'],
          seoTitle: 'NH00 160A — поставка',
          seoDescription: 'Низковольтный предохранитель NH00 для щитов.',
          isPublished: true,
          deletedAt: null,
          manufacturer: { slug: 'mersen', isPublished: true, deletedAt: null },
          category: {
            slug: 'nizkovoltnye-predohraniteli',
            isPublished: true,
            deletedAt: null,
          },
          photos: [
            {
              id: 1,
              filename: 'nh00.jpg',
              sizeBytes: 100,
              mimeType: 'image/jpeg',
            },
          ],
          documents: [
            {
              id: 2,
              filename: 'datasheet.pdf',
              sizeBytes: 200,
              mimeType: 'application/pdf',
            },
          ],
        }),
      },
    };

    const service = new CatalogService(prisma as never, createUrlsMock() as never);
    const result = await service.getProductBySlug('nh00-160a');

    expect(result).toEqual({
      slug: 'nh00-160a',
      title: 'Предохранитель NH00 160A',
      sku: 'NH00-160',
      description: 'Низковольтный предохранитель серии NH00.',
      specs: [{ label: 'Номинальный ток', value: '160 A' }],
      photos: [
        {
          id: 1,
          url: 'http://localhost:3001/photos/1',
          filename: 'nh00.jpg',
          sizeBytes: 100,
          mimeType: 'image/jpeg',
        },
      ],
      documents: [
        {
          id: 2,
          url: 'http://localhost:3001/documents/2',
          filename: 'datasheet.pdf',
          sizeBytes: 200,
          mimeType: 'application/pdf',
        },
      ],
      image: {
        id: 1,
        url: 'http://localhost:3001/photos/1',
        filename: 'nh00.jpg',
        sizeBytes: 100,
        mimeType: 'image/jpeg',
      },
      badges: ['pdf'],
      seoTitle: 'NH00 160A — поставка',
      seoDescription: 'Низковольтный предохранитель NH00 для щитов.',
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

    const service = new CatalogService(prisma as never, createUrlsMock() as never);

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
          isPublished: true,
          deletedAt: null,
          manufacturer: { isPublished: true, deletedAt: null },
          category: { isPublished: true, deletedAt: null },
        }),
        findMany: jest.fn().mockResolvedValue([
          {
            slug: 'fuse-link-6kv',
            title: 'Плавкий предохранитель 6 kV',
            sku: 'CAS-FL-6',
            badges: ['onRequest'],
            manufacturer: { slug: 'casram' },
            category: { slug: 'plavkie-vn' },
            photos: [],
            documents: [],
          },
        ]),
      },
    });

    const service = new CatalogService(prisma as never, createUrlsMock() as never);
    const result = await service.listSimilarProducts('fuse-link-10kv');

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        categoryId: 2,
        manufacturerId: { not: 1 },
        slug: { not: 'fuse-link-10kv' },
        isPublished: true,
        deletedAt: null,
        manufacturer: { isPublished: true, deletedAt: null },
        category: { isPublished: true, deletedAt: null },
      },
      include: PRODUCT_MEDIA_INCLUDE,
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
        image: null,
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
          isPublished: true,
          deletedAt: null,
          manufacturer: { isPublished: true, deletedAt: null },
          category: { isPublished: true, deletedAt: null },
        }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    });

    const service = new CatalogService(prisma as never, createUrlsMock() as never);
    await service.listSimilarProducts('c09-220', 2);

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 2 }),
    );
  });

  it('returns an empty list for blank search queries', async () => {
    const prisma = createPrismaMock({});

    const service = new CatalogService(prisma as never, createUrlsMock() as never);
    const result = await service.searchProducts('   ');

    expect(result).toEqual([]);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('lists only published, non-deleted manufacturers', async () => {
    const prisma = createPrismaMock({});
    prisma.manufacturer.findMany = jest
      .fn()
      .mockResolvedValue([{ slug: 'mersen', name: 'Mersen' }]);

    const service = new CatalogService(prisma as never, createUrlsMock() as never);
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

    const service = new CatalogService(prisma as never, createUrlsMock() as never);
    await service.getCategoryTree(null);

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { isPublished: true, deletedAt: null },
      orderBy: [{ parentId: 'asc' }, { id: 'asc' }],
      include: {
        photos: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });
  });

  it('hides an unpublished product from the public PDP', async () => {
    const prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue({
          slug: 'draft-fuse',
          title: 'Черновик',
          sku: 'DRAFT-1',
          description: 'Ещё не опубликован.',
          specs: [],
          badges: [],
          seoTitle: null,
          seoDescription: null,
          photos: [],
          documents: [],
          isPublished: false,
          deletedAt: null,
          manufacturer: { slug: 'mersen', isPublished: true, deletedAt: null },
          category: {
            slug: 'nizkovoltnye-predohraniteli',
            isPublished: true,
            deletedAt: null,
          },
        }),
      },
    };

    const service = new CatalogService(prisma as never, createUrlsMock() as never);

    await expect(service.getProductBySlug('draft-fuse')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('hides a soft-deleted product from the public PDP', async () => {
    const prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue({
          slug: 'old-fuse',
          title: 'Архив',
          sku: 'OLD-1',
          description: 'Снят с публикации.',
          specs: [],
          badges: [],
          seoTitle: null,
          seoDescription: null,
          photos: [],
          documents: [],
          isPublished: false,
          deletedAt: new Date('2026-08-18T10:00:00.000Z'),
          manufacturer: { slug: 'mersen', isPublished: true, deletedAt: null },
          category: {
            slug: 'nizkovoltnye-predohraniteli',
            isPublished: true,
            deletedAt: null,
          },
        }),
      },
    };

    const service = new CatalogService(prisma as never, createUrlsMock() as never);

    await expect(service.getProductBySlug('old-fuse')).rejects.toBeInstanceOf(
      NotFoundException,
    );
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
          badges: [],
          seoTitle: null,
          seoDescription: null,
          photos: [],
          documents: [],
          isPublished: true,
          deletedAt: null,
          manufacturer: { slug: 'mersen', isPublished: true, deletedAt: null },
          category: {
            slug: 'nizkovoltnye-predohraniteli',
            isPublished: false,
            deletedAt: null,
          },
        }),
      },
    };

    const service = new CatalogService(prisma as never, createUrlsMock() as never);

    await expect(service.getProductBySlug('nh00-160a')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('searches products by title, sku, and manufacturer name', async () => {
    const prisma = createPrismaMock({
      $queryRaw: jest.fn().mockResolvedValue([{ slug: 'nh00-160a' }]),
    });
    prisma.product.findMany.mockResolvedValue([
      {
        slug: 'nh00-160a',
        title: 'Предохранитель NH00 160A',
        sku: 'NH00-160',
        badges: [],
        manufacturer: { slug: 'mersen' },
        category: { slug: 'nizkovoltnye-predohraniteli' },
        photos: [],
        documents: [
          {
            id: 3,
            filename: 'datasheet.pdf',
            sizeBytes: 100,
            mimeType: 'application/pdf',
          },
        ],
      },
    ]);
    prisma.manufacturer.findFirst.mockResolvedValue({
      slug: 'mersen',
      isPublished: true,
      deletedAt: null,
    });

    const service = new CatalogService(prisma as never, createUrlsMock() as never);
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
        image: null,
      },
    ]);
  });
});
