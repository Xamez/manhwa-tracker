<template>
  <div class="pb-8">
    <div
      v-if="manhwa.bannerImage"
      class="hidden md:block w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] h-[400px] bg-cover bg-center -mt-8"
      :style="{ backgroundImage: `url(${manhwa.bannerImage})` }"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-dark/30 to-dark"></div>
    </div>

    <div
      class="flex flex-row gap-4 md:gap-6 relative z-10 max-w-6xl mx-auto"
      :class="{ 'md:-mt-28': manhwa.bannerImage }"
    >
      <div class="relative">
        <button
          class="absolute -top-3 -left-4 z-10 w-10 h-10 rounded-full bg-black/80 flex items-center justify-center"
          :class="{
            'text-red-500': isFavorite,
            'text-white/60': !isFavorite,
          }"
          @click="$emit('toggleFavorite')"
        >
          <Icon v-if="isFavorite" name="mdi:heart" size="20" />
          <Icon v-else name="mdi:heart-outline" size="20" />
        </button>

        <div class="w-[120px] md:w-[240px] aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
          <img
            v-if="manhwa.coverImage"
            :src="manhwa.coverImage"
            :alt="manhwa.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-white/10 flex items-center justify-center">
            <Icon name="lucide:file-image" size="64" class="text-white/40" />
          </div>
        </div>
      </div>

      <div class="flex-1 space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">{{ manhwa.title }}</h1>
          <div
            v-if="manhwa.alternativeTitles.length > 0"
            class="group relative inline-block mb-2"
          >
            <button class="text-sm text-white/60 hover:text-primary flex items-center gap-1">
              <Icon name="lucide:info" size="16" />
              <span>
                {{ manhwa.alternativeTitles.length }} alternative title{{
                  manhwa.alternativeTitles.length > 1 ? 's' : ''
                }}
              </span>
            </button>
            <div
              class="absolute left-0 top-full mt-2 w-max max-w-md bg-dark border border-white/20 rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 shadow-xl"
            >
              <p class="text-xs text-white/60 mb-2 font-semibold">Alternative Titles:</p>
              <ul class="space-y-1">
                <li
                  v-for="synonym in manhwa.alternativeTitles"
                  :key="synonym"
                  class="text-sm text-white/90"
                >
                  {{ synonym }}
                </li>
              </ul>
            </div>
          </div>
          <div v-if="manhwa.meanScore" class="flex items-center gap-2 text-white/80">
            <Icon name="lucide:star" size="20" class="text-yellow-400" />
            <span class="text-lg font-semibold">{{ manhwa.meanScore / 10 }}/10</span>
          </div>
        </div>

        <div v-if="manhwa.genres.length > 0" class="flex-wrap gap-2 hidden md:flex">
          <span
            v-for="genre in manhwa.genres"
            :key="genre"
            class="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
          >
            {{ genre }}
          </span>
        </div>

        <div v-if="manhwa.description" class="text-white/80 hidden md:block">
          <h2 class="text-xl font-semibold text-white mb-2">Description</h2>
          <div
            v-dompurify-html="manhwa.description"
            class="prose prose-invert max-h-[145px]"
          ></div>
        </div>
      </div>
    </div>

    <!-- Description for mobile -->
    <div v-if="manhwa.genres.length > 0" class="flex flex-wrap gap-2 mt-6 md:hidden">
      <span
        v-for="genre in manhwa.genres"
        :key="genre"
        class="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
      >
        {{ genre }}
      </span>
    </div>

    <div class="mt-4 md:hidden">
      <div v-if="manhwa.description" class="text-white/80">
        <h2 class="text-xl font-semibold text-white mb-2">Description</h2>
        <div
          class="relative cursor-pointer"
          @click="!descriptionExpanded && (descriptionExpanded = true)"
        >
          <div
            ref="descriptionContentRef"
            v-dompurify-html="manhwa.description"
            class="prose-invert transition-all duration-300"
            :class="{
              'max-h-[80px] overflow-hidden description-gradient': !descriptionExpanded,
              'prose max-h-none': descriptionExpanded,
            }"
          ></div>
          <button
            v-if="descriptionExpanded"
            class="mt-2 text-sm text-white/60"
            @click.stop="collapseDescription"
          >
            Show less
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Manhwa } from '~~/shared/types/manhwa';

defineProps<{
  manhwa: Manhwa;
  isFavorite: boolean;
}>();

defineEmits<{
  (e: 'toggleFavorite'): void;
}>();

const descriptionExpanded = ref(false);
const descriptionContentRef = ref<HTMLElement | null>(null);

function collapseDescription() {
  if (descriptionContentRef.value) {
    descriptionContentRef.value.scrollTop = 0;
  }
  descriptionExpanded.value = false;
}
</script>

<style scoped>
.prose {
  max-height: 150px;
  overflow-y: auto;
}

.description-gradient {
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 70%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 70%,
    transparent 100%
  );
}

* {
  scrollbar-width: auto;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}
</style>
