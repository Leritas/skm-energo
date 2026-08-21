import { PROTOTYPE_SEARCH_PRODUCTS } from './mock-data';
import type { PrototypeSearchProduct } from './types';

const SEARCH_DELAY_MS = 180;
const MIN_SEARCH_LENGTH = 2;

function filterProducts(query: string): PrototypeSearchProduct[] {
  const term = query.trim().toLowerCase();
  if (term.length < MIN_SEARCH_LENGTH) {
    return [];
  }

  return PROTOTYPE_SEARCH_PRODUCTS.filter((product) => {
    const haystack = [
      product.title,
      product.sku,
      product.manufacturer,
      product.categoryLabel,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });
}

export function usePrototypeSearch() {
  const query = ref('');
  const isOpen = ref(false);
  const isSearching = ref(false);
  const results = ref<PrototypeSearchProduct[]>([]);

  const isSearchActive = computed(
    () => query.value.trim().length >= MIN_SEARCH_LENGTH,
  );

  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  function runSearch(nextQuery: string) {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    const trimmed = nextQuery.trim();
    if (!trimmed || trimmed.length < MIN_SEARCH_LENGTH) {
      isSearching.value = false;
      results.value = [];
      return;
    }

    isSearching.value = true;
    searchTimer = setTimeout(() => {
      results.value = filterProducts(trimmed);
      isSearching.value = false;
    }, SEARCH_DELAY_MS);
  }

  watch(query, (value) => {
    runSearch(value);
  });

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    query.value = '';
    results.value = [];
    isSearching.value = false;
  }

  function catalogResultsUrl(value = query.value) {
    const trimmed = value.trim();
    return trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : '/catalog';
  }

  onUnmounted(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
  });

  return {
    query,
    isOpen,
    isSearching,
    isSearchActive,
    results,
    open,
    close,
    catalogResultsUrl,
  };
}
