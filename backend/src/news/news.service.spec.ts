import { NotFoundException } from '@nestjs/common';
import { NewsService } from './news.service';

const PUBLIC_NEWS_WHERE = { published: true, deletedAt: null } as const;

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
          },
        ]),
      },
    };

    const service = new NewsService(prisma as never);
    const result = await service.listArticles();

    expect(prisma.newsArticle.findMany).toHaveBeenCalledWith({
      where: PUBLIC_NEWS_WHERE,
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
    });
    expect(result).toEqual([
      {
        slug: 'hiitio-expand',
        title: 'Расширение ассортимента HIITIO',
        excerpt:
          'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
        publishDate: '2026-07-15',
      },
    ]);
  });

  it('throws when published article slug is missing', async () => {
    const prisma = {
      newsArticle: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    const service = new NewsService(prisma as never);

    await expect(service.getArticleBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.newsArticle.findFirst).toHaveBeenCalledWith({
      where: { slug: 'missing', ...PUBLIC_NEWS_WHERE },
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
          seoDescription: 'Новые контакторы и реле HIITIO.',
          deletedAt: null,
        }),
      },
    };

    const service = new NewsService(prisma as never);
    const result = await service.getArticleBySlug('hiitio-expand');

    expect(result).toEqual({
      slug: 'hiitio-expand',
      title: 'Расширение ассортимента HIITIO',
      excerpt:
        'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
      publishDate: '2026-07-15',
      body: [
        'Компания СКМ-Энергосервис расширила линейку HIITIO.',
        'Для всех позиций доступны актуальные datasheet.',
      ],
      seoTitle: 'HIITIO в каталоге СКМ',
      seoDescription: 'Новые контакторы и реле HIITIO.',
    });
  });
});
