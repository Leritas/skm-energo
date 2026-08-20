import type { AttachedFile } from '@skm/specs';

export interface NewsListItem {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  coverPhoto: AttachedFile | null;
}

export interface NewsArticleDetail extends NewsListItem {
  body: string[];
  seoTitle: string | null;
  seoDescription: string | null;
}
