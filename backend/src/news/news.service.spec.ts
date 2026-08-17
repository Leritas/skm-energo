import { NotFoundException } from '@nestjs/common';
import { NewsService } from './news.service';

describe('NewsService', () => {
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
      where: { slug: 'missing', published: true },
    });
  });

  it('returns article detail with body paragraphs', async () => {
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
    });
  });
});
