import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NewsListItemDto {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
}

export interface NewsDetailDto extends NewsListItemDto {
  body: string[];
}

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async listArticles(): Promise<NewsListItemDto[]> {
    const rows = await this.prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
    });

    return rows.map((row) => this.toListItem(row));
  }

  async getArticleBySlug(slug: string): Promise<NewsDetailDto> {
    const article = await this.prisma.newsArticle.findFirst({
      where: { slug, published: true },
    });

    if (!article) {
      throw new NotFoundException('News article not found');
    }

    return {
      ...this.toListItem(article),
      body: article.body,
    };
  }

  private toListItem(row: {
    slug: string;
    title: string;
    excerpt: string;
    publishDate: Date;
  }): NewsListItemDto {
    return {
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      publishDate: row.publishDate.toISOString().slice(0, 10),
    };
  }
}
