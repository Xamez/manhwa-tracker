import type { Filters } from '~~/shared/types/filters';
import type { ReadingStatus } from '~~/shared/types/reading-status';
import {
  SORT_PREFS_STORAGE_KEY,
  type SortOption,
  type SortOrder,
  type SortPreferences,
} from '~~/shared/types/sort';

export function useSortPreferences(filters: Ref<Filters>) {
  const sortPreferences = ref<SortPreferences>({});

  const getStatusKey = (statuses: ReadingStatus[]) => {
    if (statuses.length === 0) return 'all';
    if (statuses.length === 1) return statuses[0];
    return null;
  };

  onMounted(() => {
    if (import.meta.client) {
      try {
        const savedPrefs = localStorage.getItem(SORT_PREFS_STORAGE_KEY);
        if (savedPrefs) {
          sortPreferences.value = JSON.parse(savedPrefs);
        }
      } catch (error) {
        console.error('Failed to load sort preferences:', error);
      }
    }
  });

  watch(
    () => filters.value.statuses,
    newStatuses => {
      const key = getStatusKey(newStatuses);
      if (key && sortPreferences.value[key]) {
        const pref = sortPreferences.value[key];
        if (filters.value.sortBy !== pref.sortBy || filters.value.sortOrder !== pref.sortOrder) {
          filters.value.sortBy = pref.sortBy;
          filters.value.sortOrder = pref.sortOrder;
        }
      }
    },
  );

  watch(
    () => [filters.value.sortBy, filters.value.sortOrder, filters.value.statuses],
    ([newSortBy, newSortOrder, statuses]) => {
      const key = getStatusKey(statuses as ReadingStatus[]);
      if (key) {
        sortPreferences.value[key] = {
          sortBy: newSortBy as SortOption,
          sortOrder: newSortOrder as SortOrder,
        };
        if (import.meta.client) {
          localStorage.setItem(SORT_PREFS_STORAGE_KEY, JSON.stringify(sortPreferences.value));
        }
      }
    },
  );
}
