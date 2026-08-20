import { Injectable, NotFoundException } from '@nestjs/common';
import type { Photo } from '@prisma/client';
import type { AttachedFile } from '@skm/specs';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';

export interface NewsListItemDto {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  coverPhoto: AttachedFile | null;
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

const NEWS_COVER_INCLUDE = {
  photos: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
} as const;

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly urls: MediaUrlService,
  ) {}

  async listArticles(): Promise<NewsListItemDto[]> {
    const rows = await this.prisma.newsArticle.findMany({
      where: PUBLIC_NEWS_WHERE,
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
      include: NEWS_COVER_INCLUDE,
    });

    return rows.map((row) => this.toListItem(row));
  }

  async getArticleBySlug(slug: string): Promise<NewsDetailDto> {
    const article = await this.prisma.newsArticle.findFirst({
      where: { slug, ...PUBLIC_NEWS_WHERE },
      include: NEWS_COVER_INCLUDE,
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
    photos: Photo[];
  }): NewsListItemDto {
    const cover = row.photos[0];
    return {
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      publishDate: row.publishDate.toISOString().slice(0, 10),
      coverPhoto: cover ? this.urls.toAttachedPhoto(cover) : null,
    };
  }
}
