const newsDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatNewsDate(publishDate: string): string {
  return newsDateFormatter.format(new Date(`${publishDate}T00:00:00`));
}

export function resolveNewsSeoTitle(article: {
  title: string;
  seoTitle: string | null;
}): string {
  const custom = article.seoTitle?.trim();
  return custom && custom.length > 0 ? custom : article.title;
}

export function resolveNewsSeoDescription(article: {
  excerpt: string;
  seoDescription: string | null;
}): string {
  const custom = article.seoDescription?.trim();
  return custom && custom.length > 0 ? custom : article.excerpt;
}
