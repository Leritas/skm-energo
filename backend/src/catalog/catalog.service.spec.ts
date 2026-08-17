import { NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';

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
      similarSlugs: ['fuse-link-6kv'],
      manufacturerSlug: 'mersen',
      categorySlug: 'nizkovoltnye-predohraniteli',
    });
  });
});
