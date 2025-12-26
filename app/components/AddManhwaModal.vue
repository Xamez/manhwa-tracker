<template>
  <Modal v-model="isOpen" title="Add Manhwa">
    <div class="space-y-4">
      <IconInput
        v-model="searchQuery"
        icon="lucide:search"
        placeholder="Search for manhwa..."
        autofocus
        @update:model-value="handleSearch"
      />

      <div v-if="isSearching" class="text-center py-8 text-white/60">
        <Icon name="lucide:loader-2" size="36" class="animate-spin mx-auto" />
        <p class="mt-2">Searching...</p>
      </div>

      <div v-else-if="searchResults.length > 0" class="space-y-2 max-h-[400px] overflow-y-auto">
        <button
          v-for="result in searchResults"
          :key="result.id"
          class="w-full text-left p-3 rounded bg-white/5 hover:bg-primary flex items-center gap-3"
          @click="selectManhwa(result.id)"
        >
          <img
            v-if="result.coverImage"
            :src="result.coverImage"
            :alt="result.title"
            class="w-12 h-16 object-cover rounded"
          />
          <div v-else class="w-12 h-16 bg-white/10 rounded flex items-center justify-center">
            <Icon name="lucide:file-image" size="36" class="text-white/40" />
          </div>
          <p class="text-white font-medium flex-1">{{ result.title }}</p>
        </button>
      </div>

      <div v-else-if="searchQuery" class="text-center py-8 text-white/60">
        <Icon name="lucide:search-x" size="36" class="mx-auto mb-2" />
        <p>No results found</p>
      </div>

      <div v-else class="text-center py-8 text-white/60">
        <Icon name="lucide:search" size="36" class="mx-auto mb-2" />
        <p>Search for a manhwa to add to your list</p>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
const isOpen = defineModel<boolean>({ required: true });

const searchQuery = ref('');
const searchResults = ref<ManhwaSearchResult[]>([]);
const isSearching = ref(false);

let searchTimeout: number | null = null;

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim() === '') {
      searchResults.value = [];
      return;
    }
    isSearching.value = true;
    try {
      const data = await $fetch('/api/manhwa/search', {
        method: 'POST',
        body: { search: searchQuery.value },
      });
      searchResults.value = data as ManhwaSearchResult[];
    } catch (error) {
      console.error('Search failed:', error);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 500);
}

async function selectManhwa(id: number) {
  navigateTo(`/user-manhwa/${id}`);
  isOpen.value = false;
}
</script>
