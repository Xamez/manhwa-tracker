<template>
  <div v-if="user" class="pb-8">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <Icon name="lucide:loader-2" size="48" class="animate-spin text-primary" />
    </div>

    <div v-else class="max-w-6xl mx-auto space-y-6">
      <h1 class="text-3xl font-bold text-white mb-6">Profile</h1>

      <div class="bg-white/5 rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-white">Account Information</h2>
          <a
            :href="`/api/user/export`"
            download="manhwa-export.txt"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-lighter rounded-lg text-white font-medium"
            title="Export Manhwas"
          >
            <Icon name="lucide:download" size="16" />
            <span class="hidden sm:inline">Export Manhwas</span>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-white/80 mb-2">Username</label>
            <div
              class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-gray-400 cursor-not-allowed"
            >
              {{ user.username }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-white/80 mb-2">Email Address</label>
            <div
              class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-gray-400 cursor-not-allowed"
            >
              {{ user.email }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-white/80 mb-2"
              >Preferred Reading Source</label
            >
            <Dropdown
              :model-value="user.preferredReadingSource"
              @update:model-value="updatePreference"
              :options="readingSourceOptions"
            />
          </div>
        </div>
      </div>

      <div class="bg-white/5 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-white mb-6">Reading Statistics</h2>
        <div v-if="stats" class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard icon="lucide:book-open" :value="stats.totalManhwa" label="Total Manhwa" />
          <StatsCard
            icon="lucide:bookmark"
            :value="stats.totalChaptersRead"
            label="Chapters Read"
          />
          <StatsCard icon="lucide:heart" :value="stats.favorites" label="Favorites" />
          <StatsCard
            icon="lucide:calendar"
            :value="stats.chaptersReadThisMonth"
            label="Chapters This Month"
          />
          <StatsCard
            icon="lucide:clock"
            :value="`${stats.totalReadingTimeHours}h`"
            label="Reading Time"
          />
          <StatsCard
            icon="lucide:activity"
            :value="stats.recentlyUpdated"
            label="Updated This Month"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { READING_SOURCES } from '~~/shared/types/reading-source';

const { user, setCurrentUser } = useAuthUser();

const loading = ref(true);
const stats = ref(null);

const readingSourceOptions = Object.keys(READING_SOURCES).map(key => ({
  value: key,
  label: READING_SOURCES[key].name,
}));

const updatePreference = async value => {
  try {
    const updatedUser = await $fetch('/api/user/profile', {
      method: 'POST',
      body: { preferredReadingSource: value },
    });
    setCurrentUser(updatedUser);
  } catch (error) {
    console.error('Failed to update preference:', error);
  }
};

onMounted(async () => {
  try {
    stats.value = await $fetch('/api/user/stats');
  } finally {
    loading.value = false;
  }
});
</script>
