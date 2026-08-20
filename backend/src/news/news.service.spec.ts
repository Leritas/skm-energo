import { NotFoundException } from '@nestjs/common';
import { NewsService } from './news.service';

const PUBLIC_NEWS_WHERE = { published: true, deletedAt: null } as const;
const NEWS_COVER_INCLUDE = {
  photos: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
} as const;
const ARTICLE_SEO_DESCRIPTION = 'Новые контакторы и реле HIITIO.';

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

describe('NewsService', () => {
  it('lists only published articles that are not archived', async () => {
    const prisma = {
      newsArticle: {
        findMany: jest.fn().mockResolvedValue([
          {
            slug: 'hiitio-expand',
            title: 'Расширение ассортимента HIITIO',
            excerpt:
              'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
            publishDate: new Date('2026-07-15'),
            published: true,
            deletedAt: null,
            photos: [],
          },
        ]),
      },
    };

    const service = new NewsService(prisma as never, createUrlsMock() as never);
    const result = await service.listArticles();

    expect(prisma.newsArticle.findMany).toHaveBeenCalledWith({
      where: PUBLIC_NEWS_WHERE,
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
      include: NEWS_COVER_INCLUDE,
    });
    expect(result).toEqual([
      {
        slug: 'hiitio-expand',
        title: 'Расширение ассортимента HIITIO',
        excerpt:
          'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
        publishDate: '2026-07-15',
        coverPhoto: null,
      },
    ]);
  });

  it('throws when published article slug is missing', async () => {
    const prisma = {
      newsArticle: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    const service = new NewsService(prisma as never, createUrlsMock() as never);

    await expect(service.getArticleBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.newsArticle.findFirst).toHaveBeenCalledWith({
      where: { slug: 'missing', ...PUBLIC_NEWS_WHERE },
      include: NEWS_COVER_INCLUDE,
    });
  });

  it('returns article detail with body paragraphs and SEO fields', async () => {
    const prisma = {
      newsArticle: {
        findFirst: jest.fn().mockResolvedValue({
          slug: 'hiitio-expand',
          title: 'Расширение ассортимента HIITIO',
          excerpt:
            'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
          body: [
            'Компания СКМ-Энергосервис расширила линейку HIITIO.',
            'Для всех позиций доступны актуальные datasheet.',
          ],
          publishDate: new Date('2026-07-15'),
          published: true,
          seoTitle: 'HIITIO в каталоге СКМ',
          seoDescription: ARTICLE_SEO_DESCRIPTION,
          deletedAt: null,
          photos: [{ id: 7 }],
        }),
      },
    };

    const urls = createUrlsMock();
    const service = new NewsService(prisma as never, urls as never);
    const result = await service.getArticleBySlug('hiitio-expand');

    expect(urls.toAttachedPhoto).toHaveBeenCalledWith({ id: 7 });
    expect(result).toEqual({
      slug: 'hiitio-expand',
      title: 'Расширение ассортимента HIITIO',
      excerpt:
        'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
      publishDate: '2026-07-15',
      coverPhoto: {
        id: 7,
        url: 'http://localhost:3001/photos/7',
        filename: 'cover.jpg',
        sizeBytes: 100,
        mimeType: 'image/jpeg',
      },
      body: [
        'Компания СКМ-Энергосервис расширила линейку HIITIO.',
        'Для всех позиций доступны актуальные datasheet.',
      ],
      seoTitle: 'HIITIO в каталоге СКМ',
      seoDescription: ARTICLE_SEO_DESCRIPTION,
    });
  });
});
