import type {
  AdminNewsArticleDto,
  CreateNewsArticleRequest,
  UpdateNewsArticleRequest,
} from '@skm/specs';

export function useNewsAdmin() {
  const { api } = useApi();

  function listArticles(includeArchived = false) {
    return api<AdminNewsArticleDto[]>('/admin/news', {
      query: { includeArchived },
    });
  }

  function createArticle(body: CreateNewsArticleRequest) {
    return api<AdminNewsArticleDto>('/admin/news', {
      method: 'POST',
      body,
    });
  }

  function updateArticle(id: number, body: UpdateNewsArticleRequest) {
    return api<AdminNewsArticleDto>(`/admin/news/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  function archiveArticle(id: number) {
    return api<AdminNewsArticleDto>(`/admin/news/${id}`, {
      method: 'DELETE',
    });
  }

  function restoreArticle(id: number) {
    return api<AdminNewsArticleDto>(`/admin/news/${id}/restore`, {
      method: 'POST',
    });
  }

  return {
    listArticles,
    createArticle,
    updateArticle,
    archiveArticle,
    restoreArticle,
  };
}
