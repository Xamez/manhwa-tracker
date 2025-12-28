<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <Icon name="lucide:loader-2" size="48" class="animate-spin text-primary" />
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center min-h-[60vh] text-white/60"
    >
      <Icon name="lucide:alert-circle" size="48" class="mb-4" />
      <p class="text-lg">{{ error }}</p>
      <NuxtLink to="/" class="mt-4 text-primary hover:underline">Go back to home</NuxtLink>
    </div>

    <div v-else-if="manhwa" class="pb-8">
      <ManhwaDetailHeader
        :manhwa="manhwa"
        :is-favorite="userManhwaData.isFavorite"
        @toggle-favorite="toggleFavorite"
      />

      <div class="bg-white/5 rounded-lg p-6 mt-6 max-w-6xl mx-auto">
        <h2 class="text-xl font-semibold text-white mb-6">My Reading Progress</h2>

        <ManhwaDetailProgressForm
          v-model="userManhwaData"
          :manhwa="manhwa"
          :is-refreshing-chapter="isRefreshingChapter"
          @refresh-chapter="refreshChapter"
          @increment-chapter="incrementChapter"
        />

        <ManhwaDetailNotes v-model="userManhwaData.notes" />

        <div v-if="errorMessage">
          <p class="mt-4 text-red-500">{{ errorMessage }}</p>
        </div>

        <ManhwaDetailActionButtons
          :saving="saving"
          :deleting="deleting"
          :is-new="!userManhwaId"
          @save="saveUserManhwa()"
          @delete="deleteUserManhwa"
        />
      </div>
    </div>

    <DeleteModal
      v-model="showDeleteModal"
      message="Are you sure you want to delete this manhwa from your list?"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ReadingStatus } from '~~/shared/types/reading-status';
import type { Manhwa } from '~~/shared/types/manhwa';
import type { UserManhwa } from '~~/shared/types/user-manhwa';

const route = useRoute();
const id = route.params.id as string;

const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const error = ref<string | null>(null);
const manhwa = ref<Manhwa | null>(null);
const userManhwaId = ref('');
const errorMessage = ref<string | null>(null);
const showDeleteModal = ref(false);

const userManhwaData = ref({
  status: 'reading' as ReadingStatus,
  lastReadChapter: 1,
  rating: null as number | null,
  readingUrl: null as string | null,
  startedAt: new Date().toISOString().split('T')[0] as string,
  updatedAt: new Date().toISOString().split('T')[0] as string,
  isFavorite: false,
  notes: '' as string,
});

const { isRefreshing, setRefreshing } = useChapterRefreshState();

const isRefreshingChapter = computed(() => {
  return userManhwaId.value ? isRefreshing(userManhwaId.value) : false;
});

async function refreshChapter() {
  if (!userManhwaId.value || !userManhwaData.value.readingUrl || isRefreshingChapter.value) return;

  setRefreshing(userManhwaId.value, true);
  const startTime = Date.now();

  try {
    const response = await $fetch<{ lastAvailableChapter: number | null }>(
      `/api/user-manhwa/${userManhwaId.value}/refresh-chapter`,
      {
        method: 'POST',
      },
    );
    if (response.lastAvailableChapter && manhwa.value) {
      manhwa.value.lastAvailableChapter = response.lastAvailableChapter;
    }
  } catch (err) {
    console.error('Failed to refresh chapter:', err);
  } finally {
    const elapsed = Date.now() - startTime;
    if (elapsed < 500) {
      await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
    }
    if (userManhwaId.value) {
      setRefreshing(userManhwaId.value, false);
    }
  }
}

onMounted(async () => {
  try {
    loading.value = true;

    const userData = await $fetch<UserManhwa>(`/api/user-manhwa/${id}`);

    if (!userData.manhwa) {
      error.value = 'Failed to load manhwa details. Please try again later.';
      return;
    }

    manhwa.value = userData.manhwa;
    userManhwaId.value = userData.id;
    userManhwaData.value = {
      status: userData.status,
      lastReadChapter: userData.lastReadChapter,
      rating: userData.rating,
      readingUrl: userData.readingUrl,
      startedAt: (userData.startedAt
        ? new Date(userData.startedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]) as string,
      updatedAt: (userData.updatedAt
        ? new Date(userData.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]) as string,
      isFavorite: userData.isFavorite,
      notes: userData.notes || '',
    };
  } catch (err) {
    console.error('Failed to fetch user manhwa:', err);
    error.value = 'Failed to load manhwa details. Please try again later.';
  } finally {
    loading.value = false;
  }
});

async function saveUserManhwa(redirect = true) {
  if (!manhwa.value) return;

  if (!userManhwaData.value.startedAt) {
    errorMessage.value = 'Please select a valid start date.';
    return;
  }

  if (
    isNaN(userManhwaData.value.lastReadChapter) ||
    userManhwaData.value.lastReadChapter.toString().trim() === '' ||
    userManhwaData.value.lastReadChapter < 0
  ) {
    errorMessage.value = 'Please enter a valid current chapter.';
    return;
  }

  const body = {
    id: '',
    userId: '',
    manhwa: manhwa.value,
    status: userManhwaData.value.status,
    rating: userManhwaData.value.rating,
    lastReadChapter: userManhwaData.value.lastReadChapter,
    readingUrl: userManhwaData.value.readingUrl,
    startedAt: new Date(userManhwaData.value.startedAt),
    updatedAt: new Date(),
    isFavorite: userManhwaData.value.isFavorite,
    notes: userManhwaData.value.notes,
  };

  saving.value = true;
  try {
    await $fetch('/api/user-manhwa', {
      method: 'POST',
      body,
    });
    if (redirect) {
      navigateTo('/');
    }
  } catch (err) {
    console.error('Failed to save user manhwa:', err);
  } finally {
    saving.value = false;
  }
}

function deleteUserManhwa() {
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (!manhwa.value) return;

  showDeleteModal.value = false;
  deleting.value = true;

  try {
    await $fetch(`/api/user-manhwa/${id}`, {
      method: 'DELETE',
    });
    navigateTo('/');
  } catch (err) {
    console.error('Failed to delete user manhwa:', err);
  } finally {
    deleting.value = false;
  }
}

async function toggleFavorite() {
  if (!manhwa.value) return;

  const previousValue = userManhwaData.value.isFavorite;
  userManhwaData.value.isFavorite = !previousValue;

  if (!userManhwaId.value) {
    return;
  }

  const body = {
    manhwaId: manhwa.value.id,
    isFavorite: userManhwaData.value.isFavorite,
  };

  try {
    await $fetch('/api/user-manhwa/favorite', {
      method: 'PATCH',
      body,
    });
  } catch (err) {
    console.error('Failed to update favorite status:', err);
    userManhwaData.value.isFavorite = previousValue;
  }
}

async function incrementChapter() {
  userManhwaData.value.lastReadChapter++;
  await saveUserManhwa(false);
}
</script>
