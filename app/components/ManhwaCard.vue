<template>
  <div class="w-full h-[190px] md:h-[210px] relative group" @click="handleClick">
    <span
      v-if="
        userManhwa.manhwa.lastAvailableChapter &&
        userManhwa.manhwa.lastAvailableChapter > currentChapter
      "
      class="absolute -top-1 -right-1 z-20 flex size-3"
      :title="`${userManhwa.manhwa.lastAvailableChapter - currentChapter} New Chapter${userManhwa.manhwa.lastAvailableChapter - currentChapter > 1 ? 's' : ''} Available`"
    >
      <span
        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
      ></span>
      <span class="relative inline-flex size-3 rounded-full bg-green-500"></span>
    </span>
    <div class="w-full h-full rounded-md overflow-hidden relative cursor-pointer">
      <div class="block h-full">
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110"
          :style="{ backgroundImage: `url(${userManhwa.manhwa.coverImage})` }"
        ></div>

        <div
          v-if="showUpdateScreen"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 text-white p-4"
        >
          <button
            class="absolute size-6 flex items-center justify-center top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/30 text-white z-20"
            @click.stop="showUpdateScreen = false"
          >
            <Icon name="lucide:x" size="18" />
          </button>

          <p class="text-sm text-gray-400 mb-1">Current chapter:</p>
          <p class="text-3xl font-bold mb-4">{{ currentChapter }}</p>

          <button
            class="size-8 flex items-center justify-center rounded-md bg-primary text-white"
            @click.stop="updateChapter(currentChapter + 1)"
          >
            <Icon name="lucide:plus" size="24" />
          </button>
        </div>

        <div
          v-else
          class="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end h-full bg-gradient-to-t from-black/90 to-black/5 text-white"
        >
          <h2 class="m-0 mb-2 text-sm md:text-md font-semibold">{{ userManhwa.manhwa.title }}</h2>
          <div class="flex items-center justify-between gap-2">
            <p class="my-1 text-xs">
              Chapter:
              <a
                v-if="userManhwa.readingUrl"
                :href="generateManhwaUrl(userManhwa.readingUrl, currentChapter)"
                target="_blank"
                class="text-primary font-bold underline cursor-pointer group/link inline-block relative"
                @click.stop
              >
                {{ currentChapter }}
                <Icon
                  name="lucide:link"
                  size="12"
                  class="absolute left-full ml-1 opacity-0 group-hover/link:opacity-100"
                  style="color: #5540ec"
                />
              </a>
              <span v-else class="text-primary font-bold">
                {{ currentChapter }}
              </span>
            </p>
            <button
              v-if="userManhwa.status === 'reading'"
              class="w-6 h-6 flex items-center justify-center rounded bg-black/40 hover:bg-primary text-white opacity-0 group-hover:opacity-100"
              @click.stop="() => updateChapter(currentChapter + 1)"
            >
              <Icon name="lucide:plus" size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';

const { userManhwa } = defineProps<{ userManhwa: UserManhwa }>();

const currentChapter = ref(userManhwa.lastReadChapter);
const showUpdateScreen = ref(false);

const router = useRouter();
const addToHistory = inject<(fn: () => Promise<void>) => void>('addToHistory');

const DOUBLE_CLICK_THRESHOLD = 175; // milliseconds
let lastClickTime = 0;
let clickTimeout: ReturnType<typeof setTimeout> | null = null;

function handleClick(_event: MouseEvent) {
  if (showUpdateScreen.value) return;

  const now = Date.now();
  const timeSinceLastClick = now - lastClickTime;

  if (timeSinceLastClick < DOUBLE_CLICK_THRESHOLD) {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
    lastClickTime = 0;
    showUpdateScreen.value = true;
    return;
  }

  lastClickTime = now;
  clickTimeout = setTimeout(() => {
    handleNavigationClick();
  }, DOUBLE_CLICK_THRESHOLD);
}

function handleNavigationClick() {
  router.push(`/user-manhwa/${userManhwa.manhwa.id}`);
}

async function updateChapter(newChapter: number, skipHistory = false) {
  const previousChapter = currentChapter.value;

  if (!skipHistory && addToHistory) {
    addToHistory(async () => {
      await updateChapter(previousChapter, true);
    });
  }

  currentChapter.value = newChapter;

  const body = {
    id: userManhwa.id,
    userId: userManhwa.userId,
    manhwa: userManhwa.manhwa,
    status: userManhwa.status,
    rating: userManhwa.rating,
    lastReadChapter: newChapter,
    readingUrl: userManhwa.readingUrl,
    startedAt: userManhwa.startedAt,
    updatedAt: new Date(),
    isFavorite: userManhwa.isFavorite,
  };

  try {
    await $fetch('/api/user-manhwa', {
      method: 'POST',
      body,
    });
    await refreshNuxtData('user-manhwa');
  } catch (error) {
    console.error('Failed to update chapter:', error);
    currentChapter.value = previousChapter;
  }
}
</script>

<style scoped>
* {
  transition: all 0.3s ease-in-out !important;
}
</style>
