const newsDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatNewsDate(publishDate: string): string {
  return newsDateFormatter.format(new Date(`${publishDate}T00:00:00`));
}
