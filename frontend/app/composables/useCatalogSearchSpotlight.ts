import type { CatalogProductListItem } from '~/types/catalog';
import { buildCatalogUrl, isCatalogSearchActive } from '~/utils/catalog';

const SEARCH_DELAY_MS = 180;
const SPOTLIGHT_RESULT_LIMIT = 50;

export function useCatalogSearchSpotlight(open: Ref<boolean>) {
  const { api } = useApi();

  const query = ref('');
  const results = ref<CatalogProductListItem[]>([]);
  const isSearching = ref(false);
  const inputRef = ref<HTMLInputElement | null>(null);

  const isSearchActive = computed(() => isCatalogSearchActive(query.value));

  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  let requestId = 0;

  async function fetchResults(term: string) {
    const currentRequest = ++requestId;
    try {
      const params = new URLSearchParams({
        q: term,
        limit: String(SPOTLIGHT_RESULT_LIMIT),
      });
      const data = await api<CatalogProductListItem[]>(
        `/catalog/search?${params.toString()}`,
        { auth: false },
      );
      if (currentRequest === requestId) {
        results.value = data;
      }
    } catch {
      if (currentRequest === requestId) {
        results.value = [];
      }
    } finally {
      if (currentRequest === requestId) {
        isSearching.value = false;
      }
    }
  }

  function runSearch(nextQuery: string) {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    const trimmed = nextQuery.trim();
    if (!isCatalogSearchActive(trimmed)) {
      isSearching.value = false;
      results.value = [];
      return;
    }

    isSearching.value = true;
    searchTimer = setTimeout(() => {
      void fetchResults(trimmed);
    }, SEARCH_DELAY_MS);
  }

  watch(query, (value) => {
    runSearch(value);
  });

  function resetState() {
    query.value = '';
    results.value = [];
    isSearching.value = false;
    requestId += 1;
    if (searchTimer) {
      clearTimeout(searchTimer);
      searchTimer = null;
    }
  }

  function close() {
    open.value = false;
    resetState();
  }

  function clearQuery() {
    query.value = '';
    nextTick(() => inputRef.value?.focus());
  }

  function catalogResultsUrl(value = query.value) {
    const trimmed = value.trim();
    return buildCatalogUrl(null, null, trimmed || null);
  }

  watch(open, (value) => {
    if (value) {
      nextTick(() => inputRef.value?.focus());
      return;
    }
    resetState();
  });

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open.value) {
      event.preventDefault();
      close();
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown));
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown);
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
  });

  return {
    query,
    isSearching,
    isSearchActive,
    results,
    close,
    clearQuery,
    catalogResultsUrl,
    inputRef,
  };
}
