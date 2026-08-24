type ApiOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
};

export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const requestHeaders = import.meta.server
    ? useRequestHeaders(['cookie'])
    : {};

  async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const {
      auth: useAuthHeader = true,
      headers,
      method,
      body,
      query,
    } = options;

    const doFetch = () =>
      $fetch<T>(path, {
        baseURL: config.public.apiBase as string,
        method: method as
          'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined,
        body,
        query,
        credentials: 'include',
        headers: {
          ...(import.meta.server && requestHeaders.cookie
            ? { cookie: requestHeaders.cookie }
            : {}),
          ...headers,
          ...(useAuthHeader && auth.accessToken
            ? { Authorization: `Bearer ${auth.accessToken}` }
            : {}),
        },
      });

    try {
      return await doFetch();
    } catch (error: unknown) {
      const status =
        (error as { statusCode?: number; status?: number })?.statusCode ??
        (error as { status?: number })?.status;
      if (status === 401 && useAuthHeader && auth.refreshToken) {
        await auth.refresh();
        return await doFetch();
      }
      throw error;
    }
  }

  return { api };
}
