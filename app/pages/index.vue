<template>
  <div class="flex flex-col gap-4">
    <div class="sm:hidden flex gap-4 mb-4">
      <IconInput
        v-model="filters.name"
        icon="lucide:search"
        placeholder="Search..."
        class="flex-1"
      />
      <button
        class="px-4 py-2 bg-primary hover:bg-primary-lighter rounded flex items-center justify-center"
        @click="showMobileFilters = !showMobileFilters"
      >
        <Icon name="lucide:sliders-horizontal" class="w-5 h-5" />
      </button>
    </div>

    <div class="flex flex-row gap-10 relative">
      <FilterSidebar v-model="filters" class="hidden sm:block" :user-manhwas="userManhwas ?? []" />

      <MobileDrawer v-model="showMobileFilters" title="Filters">
        <FilterSidebar v-model="filters" :user-manhwas="userManhwas ?? []" hide-search />
      </MobileDrawer>

      <ManhwaGrid :user-manhwas="filteredManhwas" class="flex-1" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSortPreferences } from '~/composables/useSortPreferences';
import { sortManhwas } from '~/utils/sortManhwas';
import { DEFAULT_FILTERS, FILTERS_STORAGE_KEY, type Filters } from '~~/shared/types/filters';

const { data: userManhwas } = await useFetch<UserManhwa[]>('/api/user-manhwa', {
  key: 'user-manhwa',
});

const showMobileFilters = ref(false);

const filters = ref<Filters>(DEFAULT_FILTERS);

useSortPreferences(filters);

onMounted(() => {
  if (import.meta.client) {
    try {
      const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        filters.value = { ...DEFAULT_FILTERS, ...JSON.parse(savedFilters) };
      }
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error);
    }
  }
});

watch(
  filters,
  newFilters => {
    if (import.meta.client) {
      try {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
      } catch (error) {
        console.error('Failed to save filters to localStorage:', error);
      }
    }
  },
  { deep: true },
);

const filteredManhwas = computed(() => {
  if (!userManhwas.value) return [];

  let result = [...userManhwas.value];

  if (filters.value.name) {
    const searchTerm = filters.value.name.toLowerCase();
    result = result.filter(
      um =>
        um.manhwa.title.toLowerCase().includes(searchTerm) ||
        um.manhwa.alternativeTitles.some(s => s.toLowerCase().includes(searchTerm)),
    );
  }

  if (filters.value.statuses.length > 0) {
    result = result.filter(um => filters.value.statuses.includes(um.status));
  }

  if (filters.value.favoritesOnly) {
    result = result.filter(um => um.isFavorite);
  }

  if (filters.value.unratedOnly) {
    result = result.filter(um => um.rating === null);
  }

  if (filters.value.minRating > 0) {
    result = result.filter(um => um.rating === null || um.rating >= filters.value.minRating);
  }

  return sortManhwas(result, filters.value.sortBy, filters.value.sortOrder);
});
</script>

<style></style>
