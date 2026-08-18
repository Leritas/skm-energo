import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CatalogAdminService } from './catalog-admin.service';

function createPrismaMock() {
  return {
    manufacturer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
  };
}

describe('CatalogAdminService', () => {
  it('lists active manufacturers by default', async () => {
    const prisma = createPrismaMock();
    prisma.manufacturer.findMany.mockResolvedValue([
      {
        id: 1,
        slug: 'mersen',
        name: 'Mersen',
        isPublished: true,
        deletedAt: null,
        _count: { products: 2 },
      },
    ]);

    const service = new CatalogAdminService(prisma as never);
    const result = await service.listManufacturers(false);

    expect(prisma.manufacturer.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    expect(result).toEqual([
      {
        id: 1,
        slug: 'mersen',
        name: 'Mersen',
        isPublished: true,
        deletedAt: null,
        productCount: 2,
      },
    ]);
  });

  it('includes archived manufacturers when requested', async () => {
    const prisma = createPrismaMock();
    prisma.manufacturer.findMany.mockResolvedValue([]);

    const service = new CatalogAdminService(prisma as never);
    await service.listManufacturers(true);

    expect(prisma.manufacturer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('creates a manufacturer with unpublished default', async () => {
    const prisma = createPrismaMock();
    prisma.manufacturer.findUnique.mockResolvedValue(null);
    prisma.manufacturer.create.mockResolvedValue({
      id: 2,
      slug: 'new-brand',
      name: 'New Brand',
      isPublished: false,
      deletedAt: null,
      _count: { products: 0 },
    });

    const service = new CatalogAdminService(prisma as never);
    const result = await service.create({
      slug: 'new-brand',
      name: 'New Brand',
    });

    expect(prisma.manufacturer.create).toHaveBeenCalledWith({
      data: {
        slug: 'new-brand',
        name: 'New Brand',
        isPublished: false,
      },
      include: { _count: { select: { products: true } } },
    });
    expect(result.isPublished).toBe(false);
  });

  it('blocks archive when products reference the manufacturer', async () => {
    const prisma = createPrismaMock();
    prisma.manufacturer.findUnique.mockResolvedValue({
      id: 1,
      slug: 'mersen',
      name: 'Mersen',
      isPublished: true,
      deletedAt: null,
    });
    prisma.product.count.mockResolvedValue(3);

    const service = new CatalogAdminService(prisma as never);

    await expect(service.softDelete(1)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.manufacturer.update).not.toHaveBeenCalled();
  });

  it('archives manufacturers without products', async () => {
    const prisma = createPrismaMock();
    prisma.manufacturer.findUnique.mockResolvedValue({
      id: 1,
      slug: 'empty-brand',
      name: 'Empty Brand',
      isPublished: true,
      deletedAt: null,
    });
    prisma.product.count.mockResolvedValue(0);
    prisma.manufacturer.update.mockResolvedValue({
      id: 1,
      slug: 'empty-brand',
      name: 'Empty Brand',
      isPublished: false,
      deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      _count: { products: 0 },
    });

    const service = new CatalogAdminService(prisma as never);
    const result = await service.softDelete(1);

    expect(prisma.manufacturer.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        deletedAt: expect.any(Date),
        isPublished: false,
      },
      include: { _count: { select: { products: true } } },
    });
    expect(result.isPublished).toBe(false);
    expect(result.deletedAt).toBe('2026-08-18T10:00:00.000Z');
  });

  it('restores archived manufacturers', async () => {
    const prisma = createPrismaMock();
    prisma.manufacturer.findUnique.mockResolvedValue({
      id: 1,
      slug: 'empty-brand',
      name: 'Empty Brand',
      isPublished: false,
      deletedAt: new Date('2026-08-18T10:00:00.000Z'),
    });
    prisma.manufacturer.update.mockResolvedValue({
      id: 1,
      slug: 'empty-brand',
      name: 'Empty Brand',
      isPublished: false,
      deletedAt: null,
      _count: { products: 0 },
    });

    const service = new CatalogAdminService(prisma as never);
    const result = await service.restore(1);

    expect(prisma.manufacturer.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
    expect(result.deletedAt).toBeNull();
  });

  it('rejects restore for active manufacturers', async () => {
    const prisma = createPrismaMock();
    prisma.manufacturer.findUnique.mockResolvedValue({
      id: 1,
      slug: 'mersen',
      name: 'Mersen',
      isPublished: true,
      deletedAt: null,
    });

    const service = new CatalogAdminService(prisma as never);

    await expect(service.restore(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when updating a missing manufacturer', async () => {
    const prisma = createPrismaMock();
    prisma.manufacturer.findUnique.mockResolvedValue(null);

    const service = new CatalogAdminService(prisma as never);

    await expect(
      service.update(99, { name: 'Missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
