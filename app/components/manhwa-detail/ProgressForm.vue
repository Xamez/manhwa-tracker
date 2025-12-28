<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label for="status" class="block text-sm font-medium mb-2">Status</label>
      <Dropdown v-model="formData.status" :options="statusOptions" />
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <label for="lastReadChapter" class="flex items-center gap-2 text-sm font-medium">
          <span>Current Chapter</span>
          <a
            v-if="formData.readingUrl"
            :href="generateManhwaUrl(formData.readingUrl, formData.lastReadChapter)"
            target="_blank"
            class="text-primary hover:text-primary-lighter"
            title="Open chapter in new tab"
            @click.stop
          >
            <Icon name="lucide:link" size="14" />
          </a>
        </label>
        <div class="text-xs text-gray-400 flex items-center gap-1">
          <span>Latest: {{ manhwa.lastAvailableChapter || '?' }}</span>
          <button
            v-if="formData.readingUrl"
            type="button"
            class="text-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            :disabled="isRefreshingChapter"
            title="Refresh latest chapter"
            @click.stop.prevent="$emit('refreshChapter')"
          >
            <Icon
              name="lucide:refresh-cw"
              size="12"
              :class="{ 'animate-spin': isRefreshingChapter }"
            />
          </button>
        </div>
      </div>
      <div class="relative">
        <input
          id="lastReadChapter"
          v-model.number="formData.lastReadChapter"
          type="number"
          min="0"
          class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-primary focus:border-white"
          :class="{ 'pr-10 md:pr-4': formData.status === 'reading' }"
          placeholder="1"
        />
        <button
          v-if="formData.status === 'reading'"
          class="md:hidden absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-primary hover:text-primary-lighter"
          title="Increment chapter"
          @click="$emit('incrementChapter')"
        >
          <Icon name="lucide:plus" size="20" />
        </button>
      </div>
    </div>

    <div class="md:col-span-2">
      <label for="rating" class="block text-sm font-medium mb-2">
        <span v-if="formData.rating">Your Rating: {{ formData.rating }}/10</span>
        <span v-else>Your Rating: Not rated</span>
      </label>
      <input
        id="rating"
        v-model.number="formData.rating"
        type="range"
        min="0"
        max="10"
        step="0.1"
        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>

    <div class="md:col-span-2">
      <label for="readingUrl" class="block text-sm font-medium mb-2">
        Reading URL (optional)
      </label>
      <input
        id="readingUrl"
        v-model="formData.readingUrl"
        type="url"
        class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-primary focus:border-white"
        placeholder="https://demonicscans.org/manga/Solo-Leveling"
      />
    </div>

    <div>
      <label for="startedAt" class="block text-sm font-medium mb-2">Start Date</label>
      <div class="relative">
        <input
          id="startedAt"
          v-model="formData.startedAt"
          type="date"
          class="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded text-gray-400"
        />
        <Icon
          name="lucide:calendar"
          size="18"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>

    <div>
      <label for="updatedAt" class="block text-sm font-medium mb-2">Last Updated Date</label>
      <p
        id="updatedAt"
        type="date"
        class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-gray-400 cursor-not-allowed"
      >
        {{ formatDate(formData.updatedAt) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { READING_STATUS, type ReadingStatus } from '~~/shared/types/reading-status';
import type { Manhwa } from '~~/shared/types/manhwa';

// Define the shape of the form data we expect
export interface ManhwaFormData {
  status: ReadingStatus;
  lastReadChapter: number;
  rating: number | null;
  readingUrl: string | null;
  startedAt: string;
  updatedAt: string;
  isFavorite: boolean;
  notes: string;
}

const props = defineProps<{
  manhwa: Manhwa;
  isRefreshingChapter: boolean;
}>();

const emit = defineEmits<{
  (e: 'refreshChapter'): void;
  (e: 'incrementChapter'): void;
}>();

const formData = defineModel<ManhwaFormData>({ required: true });

const statusOptions = Object.keys(READING_STATUS).map(key => ({
  value: key,
  label: READING_STATUS[key as ReadingStatus],
}));
</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
