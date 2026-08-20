import { Injectable } from '@nestjs/common';
import {
  CATALOG_SECTION_PERMISSIONS,
  Permission,
  hasAnyPermission,
} from '@skm/specs';
import type { Category, Document, NewsArticle, Photo, Product } from '@prisma/client';
import { PermissionsService } from '../common/permissions/permissions.service';

type ProductOwner = Product & {
  manufacturer: { isPublished: boolean; deletedAt: Date | null };
  category: { isPublished: boolean; deletedAt: Date | null };
};

type PhotoWithOwner = Photo & {
  product:
    | (Product & {
        manufacturer: { isPublished: boolean; deletedAt: Date | null };
        category: { isPublished: boolean; deletedAt: Date | null };
      })
    | null;
  newsArticle: NewsArticle | null;
  category: Category | null;
};

type DocumentWithOwner = Document & {
  product: ProductOwner | null;
  newsArticle: NewsArticle | null;
  category: Category | null;
};

@Injectable()
export class MediaVisibilityService {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canPreviewUnpublished(userId: number | undefined): Promise<boolean> {
    if (userId === undefined) {
      return false;
    }

    const permissions = await this.permissionsService.getUserPermissions(userId);
    return hasAnyPermission(permissions, [
      Permission.hasAbsoluteControl,
      Permission.hasAccessToAdmin,
      ...CATALOG_SECTION_PERMISSIONS,
      Permission.hasAccessToNews,
      Permission.canManageNews,
    ]);
  }

  isPhotoOwnerPublic(photo: PhotoWithOwner): boolean {
    if (photo.product) {
      return this.isPublicProduct(photo.product);
    }
    if (photo.newsArticle) {
      return this.isPublicNewsArticle(photo.newsArticle);
    }
    if (photo.category) {
      return this.isPublicCategory(photo.category);
    }
    return false;
  }

  isDocumentOwnerPublic(document: DocumentWithOwner): boolean {
    if (document.product) {
      return this.isPublicProduct(document.product);
    }
    if (document.newsArticle) {
      return this.isPublicNewsArticle(document.newsArticle);
    }
    if (document.category) {
      return this.isPublicCategory(document.category);
    }
    return false;
  }

  private isPublicProduct(product: ProductOwner): boolean {
    return (
      product.isPublished &&
      product.deletedAt === null &&
      product.manufacturer.isPublished &&
      product.manufacturer.deletedAt === null &&
      product.category.isPublished &&
      product.category.deletedAt === null
    );
  }

  private isPublicNewsArticle(article: NewsArticle): boolean {
    return article.published && article.deletedAt === null;
  }

  private isPublicCategory(category: Category): boolean {
    return category.isPublished && category.deletedAt === null;
  }
}

export type { DocumentWithOwner, PhotoWithOwner };
