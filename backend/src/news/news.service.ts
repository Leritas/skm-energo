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
  seoTitle: string | null;
  seoDescription: string | null;
}

const PUBLIC_NEWS_WHERE = {
  published: true,
  deletedAt: null,
} as const;

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async listArticles(): Promise<NewsListItemDto[]> {
    const rows = await this.prisma.newsArticle.findMany({
      where: PUBLIC_NEWS_WHERE,
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
    });

    return rows.map((row) => this.toListItem(row));
  }

  async getArticleBySlug(slug: string): Promise<NewsDetailDto> {
    const article = await this.prisma.newsArticle.findFirst({
      where: { slug, ...PUBLIC_NEWS_WHERE },
    });

    if (!article) {
      throw new NotFoundException('News article not found');
    }

    return {
      ...this.toListItem(article),
      body: article.body,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
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
