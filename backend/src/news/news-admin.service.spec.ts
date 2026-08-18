import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from '@skm/specs';
import { NewsAdminService } from './news-admin.service';

function createPrismaMock() {
  return {
    newsArticle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}

function articleRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: 'hiitio-expand',
    title: 'Расширение ассортимента HIITIO',
    excerpt: 'Новые линейки контакторов и реле.',
    body: ['Первый абзац.', 'Второй абзац.'],
    publishDate: new Date('2026-07-15'),
    published: true,
    seoTitle: null,
    seoDescription: null,
    deletedAt: null,
    ...overrides,
  };
}

describe('NewsAdminService', () => {
  it('lists active articles by default', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findMany.mockResolvedValue([articleRow()]);

    const service = new NewsAdminService(prisma as never);
    const result = await service.listArticles(false);

    expect(prisma.newsArticle.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
    });
    expect(result).toEqual([
      {
        id: 1,
        slug: 'hiitio-expand',
        title: 'Расширение ассортимента HIITIO',
        excerpt: 'Новые линейки контакторов и реле.',
        body: ['Первый абзац.', 'Второй абзац.'],
        publishDate: '2026-07-15',
        published: true,
        seoTitle: null,
        seoDescription: null,
        deletedAt: null,
      },
    ]);
  });

  it('includes archived articles when requested', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findMany.mockResolvedValue([]);

    const service = new NewsAdminService(prisma as never);
    await service.listArticles(true);

    expect(prisma.newsArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('creates an unpublished article with the given slug', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findUnique.mockResolvedValue(null);
    prisma.newsArticle.create.mockResolvedValue(
      articleRow({
        id: 8,
        slug: 'august-hours',
        title: 'График работы',
        excerpt: 'Летний график.',
        body: ['Офис работает по сокращённому графику.'],
        publishDate: new Date('2026-08-01'),
        published: false,
        seoTitle: 'График августа',
        seoDescription: 'Летние часы работы.',
      }),
    );

    const service = new NewsAdminService(prisma as never);
    const result = await service.create({
      slug: 'august-hours',
      title: 'График работы',
      excerpt: 'Летний график.',
      body: ['Офис работает по сокращённому графику.'],
      publishDate: '2026-08-01',
      seoTitle: 'График августа',
      seoDescription: 'Летние часы работы.',
    });

    expect(prisma.newsArticle.create).toHaveBeenCalledWith({
      data: {
        slug: 'august-hours',
        title: 'График работы',
        excerpt: 'Летний график.',
        body: ['Офис работает по сокращённому графику.'],
        publishDate: new Date('2026-08-01'),
        published: false,
        seoTitle: 'График августа',
        seoDescription: 'Летние часы работы.',
      },
    });
    expect(result.published).toBe(false);
    expect(result.slug).toBe('august-hours');
  });

  it('rejects a duplicate slug on create', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findUnique.mockResolvedValue(articleRow());

    const service = new NewsAdminService(prisma as never);

    await expect(
      service.create({
        slug: 'hiitio-expand',
        title: 'Другая новость',
        excerpt: 'Текст.',
        body: ['Абзац.'],
        publishDate: '2026-08-01',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.newsArticle.create).not.toHaveBeenCalled();
  });

  it('rejects slug change without absolute control', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findUnique.mockResolvedValue(articleRow());

    const service = new NewsAdminService(prisma as never);

    await expect(
      service.update(1, { slug: 'renamed' }, [Permission.canManageNews]),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.newsArticle.update).not.toHaveBeenCalled();
  });

  it('allows slug change with absolute control', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findUnique
      .mockResolvedValueOnce(articleRow())
      .mockResolvedValueOnce(null);
    prisma.newsArticle.update.mockResolvedValue(
      articleRow({ slug: 'renamed' }),
    );

    const service = new NewsAdminService(prisma as never);
    const result = await service.update(1, { slug: 'renamed' }, [
      Permission.hasAbsoluteControl,
    ]);

    expect(prisma.newsArticle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'renamed' }),
      }),
    );
    expect(result.slug).toBe('renamed');
  });

  it('archives published articles and unpublishes them', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findUnique.mockResolvedValue(articleRow());
    prisma.newsArticle.update.mockResolvedValue(
      articleRow({
        published: false,
        deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    );

    const service = new NewsAdminService(prisma as never);
    const result = await service.softDelete(1);

    expect(prisma.newsArticle.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        deletedAt: expect.any(Date),
        published: false,
      },
    });
    expect(result.published).toBe(false);
    expect(result.deletedAt).toBe('2026-08-18T10:00:00.000Z');
  });

  it('rejects archive when the article is already archived', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findUnique.mockResolvedValue(
      articleRow({
        published: false,
        deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    );

    const service = new NewsAdminService(prisma as never);

    await expect(service.softDelete(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.newsArticle.update).not.toHaveBeenCalled();
  });

  it('restores archived articles', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findUnique.mockResolvedValue(
      articleRow({
        published: false,
        deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    );
    prisma.newsArticle.update.mockResolvedValue(
      articleRow({ published: false, deletedAt: null }),
    );

    const service = new NewsAdminService(prisma as never);
    const result = await service.restore(1);

    expect(prisma.newsArticle.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: null },
    });
    expect(result.deletedAt).toBeNull();
  });

  it('rejects update of an archived article', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findUnique.mockResolvedValue(
      articleRow({
        published: false,
        deletedAt: new Date('2026-08-18T10:00:00.000Z'),
      }),
    );

    const service = new NewsAdminService(prisma as never);

    await expect(
      service.update(1, { published: true }, [Permission.canManageNews]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.newsArticle.update).not.toHaveBeenCalled();
  });

  it('throws when updating a missing article', async () => {
    const prisma = createPrismaMock();
    prisma.newsArticle.findUnique.mockResolvedValue(null);

    const service = new NewsAdminService(prisma as never);

    await expect(
      service.update(99, { title: 'Missing' }, [Permission.canManageNews]),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
