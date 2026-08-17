import type { NewsArticleDetail, NewsListItem } from '~/types/news';

export async function useNewsArticles() {
  const { api } = useApi();

  return await useAsyncData('news-articles', () =>
    api<NewsListItem[]>('/news', { auth: false }),
  );
}

export async function useNewsArticle(slug: MaybeRefOrGetter<string>) {
  const { api } = useApi();

  return await useAsyncData(
    () => `news-article-${toValue(slug)}`,
    () =>
      api<NewsArticleDetail>(`/news/${toValue(slug)}`, {
        auth: false,
      }),
    { watch: [() => toValue(slug)] },
  );
}
