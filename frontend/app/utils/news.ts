const newsDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatNewsDate(publishDate: string): string {
  const [year, month, day] = publishDate.split('-').map(Number);
  if (!year || !month || !day) {
    return publishDate;
  }

  return newsDateFormatter.format(new Date(year, month - 1, day));
}
