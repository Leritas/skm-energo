import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { NewsArticle, Photo } from '@prisma/client';
import type { AttachedFile } from '@skm/specs';
import { hasAbsoluteControl, type Permission } from '@skm/specs';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminNewsArticleDto } from './dto/admin-news-article.dto';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';

const NEWS_COVER_INCLUDE = {
  photos: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
} as const;

type NewsArticleWithCover = NewsArticle & { photos: Photo[] };

@Injectable()
export class NewsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly urls: MediaUrlService,
  ) {}

  async listArticles(includeArchived: boolean): Promise<AdminNewsArticleDto[]> {
    const rows = await this.prisma.newsArticle.findMany({
      where: includeArchived ? undefined : { deletedAt: null },
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
      include: NEWS_COVER_INCLUDE,
    });

    return rows.map((row) => this.toDto(row));
  }

  async create(dto: CreateNewsArticleDto): Promise<AdminNewsArticleDto> {
    await this.assertSlugAvailable(dto.slug);

    const row = await this.prisma.newsArticle.create({
      data: {
        slug: dto.slug,
        title: dto.title.trim(),
        excerpt: dto.excerpt.trim(),
        body: this.normalizeBody(dto.body),
        publishDate: new Date(dto.publishDate),
        published: dto.published ?? false,
        seoTitle: this.normalizeText(dto.seoTitle ?? null),
        seoDescription: this.normalizeText(dto.seoDescription ?? null),
      },
      include: NEWS_COVER_INCLUDE,
    });

    return this.toDto(row);
  }

  async update(
    id: number,
    dto: UpdateNewsArticleDto,
    actorPermissions: readonly Permission[],
  ): Promise<AdminNewsArticleDto> {
    const article = await this.findByIdOrThrow(id);

    if (article.deletedAt) {
      throw new BadRequestException(
        'Archived news articles cannot be updated; restore first',
      );
    }

    if (dto.slug !== undefined && dto.slug !== article.slug) {
      if (!hasAbsoluteControl(actorPermissions)) {
        throw new ForbiddenException(
          'Only users with absolute control can change a news article slug',
        );
      }
      await this.assertSlugAvailable(dto.slug);
    }

    const row = await this.prisma.newsArticle.update({
      where: { id },
      data: {
        slug: dto.slug,
        title: dto.title?.trim(),
        excerpt: dto.excerpt?.trim(),
        body: dto.body === undefined ? undefined : this.normalizeBody(dto.body),
        publishDate:
          dto.publishDate === undefined ? undefined : new Date(dto.publishDate),
        published: dto.published,
        seoTitle: this.optionalText(dto.seoTitle),
        seoDescription: this.optionalText(dto.seoDescription),
      },
      include: NEWS_COVER_INCLUDE,
    });

    return this.toDto(row);
  }

  async softDelete(id: number): Promise<AdminNewsArticleDto> {
    const article = await this.findByIdOrThrow(id);

    if (article.deletedAt) {
      throw new BadRequestException('News article is already archived');
    }

    const row = await this.prisma.newsArticle.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        published: false,
      },
      include: NEWS_COVER_INCLUDE,
    });

    return this.toDto(row);
  }

  async restore(id: number): Promise<AdminNewsArticleDto> {
    const article = await this.findByIdOrThrow(id);

    if (!article.deletedAt) {
      throw new BadRequestException('News article is not archived');
    }

    const row = await this.prisma.newsArticle.update({
      where: { id },
      data: { deletedAt: null },
      include: NEWS_COVER_INCLUDE,
    });

    return this.toDto(row);
  }

  private async findByIdOrThrow(id: number) {
    const article = await this.prisma.newsArticle.findUnique({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException('News article not found');
    }
    return article;
  }

  private async assertSlugAvailable(slug: string) {
    const existing = await this.prisma.newsArticle.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('News article slug already exists');
    }
  }

  private normalizeBody(body: string[]): string[] {
    const paragraphs = body
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    if (paragraphs.length === 0) {
      throw new BadRequestException('News article body cannot be empty');
    }
    return paragraphs;
  }

  private optionalText(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    return this.normalizeText(value);
  }

  private normalizeText(value: string | null): string | null {
    if (value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toDto(row: NewsArticleWithCover): AdminNewsArticleDto {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
      publishDate: row.publishDate.toISOString().slice(0, 10),
      published: row.published,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      deletedAt: row.deletedAt?.toISOString() ?? null,
      coverPhoto: this.toCoverPhoto(row.photos),
    };
  }

  private toCoverPhoto(photos: Photo[]): AttachedFile | null {
    const cover = photos[0];
    return cover ? this.urls.toAttachedPhoto(cover) : null;
  }
}
