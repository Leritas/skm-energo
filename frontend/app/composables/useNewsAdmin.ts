import type {
  AdminNewsArticleDto,
  AttachedFile,
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

  function replaceCoverPhoto(id: number, file: File) {
    const body = new FormData();
    body.append('file', file);
    return api<{ photo: AttachedFile }>(`/admin/news/${id}/cover-photo`, {
      method: 'POST',
      body,
    });
  }

  function deleteCoverPhoto(id: number) {
    return api<void>(`/admin/news/${id}/cover-photo`, {
      method: 'DELETE',
    });
  }

  return {
    listArticles,
    createArticle,
    updateArticle,
    archiveArticle,
    restoreArticle,
    replaceCoverPhoto,
    deleteCoverPhoto,
  };
}
