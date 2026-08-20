import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from '@skm/specs';
import { ProductAdminService } from './product-admin.service';

function createPrismaMock() {
  return {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    manufacturer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };
}

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

const PRODUCT_INCLUDE = {
  manufacturer: true,
  category: true,
  photos: { orderBy: { sortOrder: 'asc' } },
  documents: { orderBy: { sortOrder: 'asc' } },
};

function productRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: 'predohranitel-nh00-160a',
    title: 'Предохранитель NH00 160A',
    sku: 'NH00-160',
    description: 'Низковольтный предохранитель серии NH00.',
    specs: [{ label: 'Номинальный ток', value: '160 A' }],
    badges: [],
    seoTitle: null,
    seoDescription: null,
    isPublished: true,
    deletedAt: null,
    manufacturerId: 10,
    categoryId: 20,
    manufacturer: { id: 10, slug: 'mersen', name: 'MERSEN', deletedAt: null },
    category: {
      id: 20,
      slug: 'nizkovoltnye-predohraniteli',
      name: 'Низковольтные предохранители',
      deletedAt: null,
    },
    photos: [
      {
        id: 5,
        filename: 'nh00.jpg',
        sizeBytes: 100,
        mimeType: 'image/jpeg',
      },
    ],
    documents: [
      {
        id: 7,
        filename: 'datasheet.pdf',
        sizeBytes: 200,
        mimeType: 'application/pdf',
      },
    ],
    ...overrides,
  };
}

describe('ProductAdminService', () => {
  it('lists active products by default', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.product.findMany.mockResolvedValue([productRow()]);

    const service = new ProductAdminService(prisma as never, urls as never);
    const result = await service.listProducts(false);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { title: 'asc' },
      include: PRODUCT_INCLUDE,
    });
    expect(result).toEqual([
      {
        id: 1,
        slug: 'predohranitel-nh00-160a',
        title: 'Предохранитель NH00 160A',
        sku: 'NH00-160',
        description: 'Низковольтный предохранитель серии NH00.',
        specs: [{ label: 'Номинальный ток', value: '160 A' }],
        photos: [
          {
            id: 5,
            url: 'http://localhost:3001/photos/5',
            filename: 'nh00.jpg',
            sizeBytes: 100,
            mimeType: 'image/jpeg',
          },
        ],
        documents: [
          {
            id: 7,
            url: 'http://localhost:3001/documents/7',
            filename: 'datasheet.pdf',
            sizeBytes: 200,
            mimeType: 'application/pdf',
          },
        ],
        badges: [],
        seoTitle: null,
        seoDescription: null,
        manufacturerId: 10,
        manufacturerSlug: 'mersen',
        manufacturerName: 'MERSEN',
        categoryId: 20,
        categorySlug: 'nizkovoltnye-predohraniteli',
        categoryName: 'Низковольтные предохранители',
        isPublished: true,
        deletedAt: null,
      },
    ]);
  });

  it('includes archived products when requested', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.product.findMany.mockResolvedValue([]);

    const service = new ProductAdminService(prisma as never, urls as never);
    await service.listProducts(true);

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('creates a product unpublished by default and generates a slug', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.manufacturer.findUnique.mockResolvedValue({
      id: 10,
      deletedAt: null,
    });
    prisma.category.findUnique.mockResolvedValue({
      id: 20,
      deletedAt: null,
    });
    prisma.product.findUnique.mockResolvedValue(null);
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.create.mockResolvedValue(
      productRow({
        id: 8,
        isPublished: false,
        photos: [],
        documents: [],
        seoTitle: 'NH00 160A купить',
        seoDescription: 'Поставка предохранителей NH00.',
      }),
    );

    const service = new ProductAdminService(prisma as never, urls as never);
    const result = await service.create({
      title: 'Предохранитель NH00 160A',
      sku: 'NH00-160',
      description: 'Низковольтный предохранитель серии NH00.',
      specs: [{ label: 'Номинальный ток', value: '160 A' }],
      manufacturerId: 10,
      categoryId: 20,
      seoTitle: 'NH00 160A купить',
      seoDescription: 'Поставка предохранителей NH00.',
    });

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        slug: 'predohranitel-nh00-160a',
        title: 'Предохранитель NH00 160A',
        sku: 'NH00-160',
        description: 'Низковольтный предохранитель серии NH00.',
        specs: [{ label: 'Номинальный ток', value: '160 A' }],
        badges: [],
        similarSlugs: [],
        seoTitle: 'NH00 160A купить',
        seoDescription: 'Поставка предохранителей NH00.',
        manufacturerId: 10,
        categoryId: 20,
        isPublished: false,
      },
      include: PRODUCT_INCLUDE,
    });
    expect(result.isPublished).toBe(false);
    expect(result.slug).toBe('predohranitel-nh00-160a');
  });

  it('rejects create when the manufacturer is archived', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.manufacturer.findUnique.mockResolvedValue({
      id: 10,
      deletedAt: new Date('2026-08-18T10:00:00.000Z'),
    });
    prisma.category.findUnique.mockResolvedValue({
      id: 20,
      deletedAt: null,
    });

    const service = new ProductAdminService(prisma as never, urls as never);

    await expect(
      service.create({
        title: 'Предохранитель NH00 160A',
        sku: 'NH00-160',
        description: 'Описание',
        manufacturerId: 10,
        categoryId: 20,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate SKU on create', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.manufacturer.findUnique.mockResolvedValue({
      id: 10,
      deletedAt: null,
    });
    prisma.category.findUnique.mockResolvedValue({
      id: 20,
      deletedAt: null,
    });
    prisma.product.findUnique.mockResolvedValue(productRow());

    const service = new ProductAdminService(prisma as never, urls as never);

    await expect(
      service.create({
        title: 'Другой товар',
        sku: 'NH00-160',
        description: 'Описание',
        manufacturerId: 10,
        categoryId: 20,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it('returns a product for admin preview including drafts', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.product.findUnique.mockResolvedValue(
      productRow({ isPublished: false }),
    );

    const service = new ProductAdminService(prisma as never, urls as never);
    const result = await service.getById(1);

    expect(result.isPublished).toBe(false);
    expect(result.title).toBe('Предохранитель NH00 160A');
  });

  it('rejects slug change without absolute control', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.product.findUnique.mockResolvedValue(productRow());

    const service = new ProductAdminService(prisma as never, urls as never);

    await expect(
      service.update(1, { slug: 'renamed' }, [Permission.canManageProducts]),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it('allows slug change with absolute control', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.product.findUnique
      .mockResolvedValueOnce(productRow())
      .mockResolvedValueOnce(null);
    prisma.product.update.mockResolvedValue(productRow({ slug: 'renamed' }));

    const service = new ProductAdminService(prisma as never, urls as never);
    const result = await service.update(1, { slug: 'renamed' }, [
      Permission.hasAbsoluteControl,
    ]);

    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'renamed' }),
      }),
    );
    expect(result.slug).toBe('renamed');
  });

  it('archives products and unpublishes them', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.product.findUnique.mockResolvedValue(productRow());
    prisma.product.update.mockResolvedValue(
      productRow({
        isPublished: false,
        deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    );

    const service = new ProductAdminService(prisma as never, urls as never);
    const result = await service.softDelete(1);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        deletedAt: expect.any(Date),
        isPublished: false,
      },
      include: PRODUCT_INCLUDE,
    });
    expect(result.isPublished).toBe(false);
    expect(result.deletedAt).toBe('2026-08-18T10:00:00.000Z');
  });

  it('restores archived products', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.product.findUnique.mockResolvedValue(
      productRow({
        isPublished: false,
        deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    );
    prisma.product.update.mockResolvedValue(
      productRow({ isPublished: false, deletedAt: null }),
    );

    const service = new ProductAdminService(prisma as never, urls as never);
    const result = await service.restore(1);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: null },
      include: PRODUCT_INCLUDE,
    });
    expect(result.deletedAt).toBeNull();
  });

  it('rejects restore when the manufacturer is archived', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.product.findUnique.mockResolvedValue(
      productRow({
        deletedAt: new Date('2026-08-18T10:00:00.000Z'),
        manufacturer: {
          id: 10,
          slug: 'mersen',
          name: 'MERSEN',
          deletedAt: new Date('2026-08-18T09:00:00.000Z'),
        },
      }),
    );

    const service = new ProductAdminService(prisma as never, urls as never);

    await expect(service.restore(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it('throws when updating a missing product', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.product.findUnique.mockResolvedValue(null);

    const service = new ProductAdminService(prisma as never, urls as never);

    await expect(
      service.update(99, { title: 'Missing' }, [Permission.canManageProducts]),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists assignment options from active manufacturers and categories', async () => {
    const prisma = createPrismaMock();
    const urls = createUrlsMock();
    prisma.manufacturer.findMany = jest.fn().mockResolvedValue([
      { id: 10, slug: 'mersen', name: 'MERSEN' },
    ]);
    prisma.category.findMany = jest.fn().mockResolvedValue([
      {
        id: 20,
        slug: 'nizkovoltnye-predohraniteli',
        name: 'Низковольтные предохранители',
      },
    ]);

    const service = new ProductAdminService(prisma as never, urls as never);
    const result = await service.listAssignmentOptions();

    expect(prisma.manufacturer.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true },
    });
    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true },
    });
    expect(result).toEqual({
      manufacturers: [{ id: 10, slug: 'mersen', name: 'MERSEN' }],
      categories: [
        {
          id: 20,
          slug: 'nizkovoltnye-predohraniteli',
          name: 'Низковольтные предохранители',
        },
      ],
    });
  });
});
