export interface NewsListItem {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
}

export interface NewsArticleDetail extends NewsListItem {
  body: string[];
  seoTitle: string | null;
  seoDescription: string | null;
}
