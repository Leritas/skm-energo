import { usePrototypeSearch } from './usePrototypeSearch';

export function usePrototypeSpotlight(variantLabel: string) {
  const search = usePrototypeSearch();
  const {
    query,
    isOpen,
    isSearching,
    isSearchActive,
    results,
    open,
    close,
    catalogResultsUrl,
  } = search;

  const inputRef = ref<HTMLInputElement | null>(null);

  const stateSummary = computed(() => {
    const parts = [`open: ${isOpen.value}`, `q: "${query.value}"`];
    if (isSearchActive.value) {
      parts.push(
        isSearching.value ? 'searching…' : `results: ${results.value.length}`,
      );
    }
    return parts.join(' · ');
  });

  watch(isOpen, (value) => {
    if (value) {
      nextTick(() => inputRef.value?.focus());
    }
  });

  function clearQuery() {
    query.value = '';
    nextTick(() => inputRef.value?.focus());
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen.value) {
      event.preventDefault();
      close();
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown));
  onUnmounted(() => window.removeEventListener('keydown', onKeydown));

  return {
    variantLabel,
    query,
    isOpen,
    isSearching,
    isSearchActive,
    results,
    open,
    close,
    clearQuery,
    catalogResultsUrl,
    inputRef,
    stateSummary,
  };
}
