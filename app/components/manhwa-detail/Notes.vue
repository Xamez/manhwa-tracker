<template>
  <div class="mt-6 border-t border-gray-700 pt-6">
    <button
      type="button"
      class="flex items-center justify-between w-full text-left group"
      @click="notesExpanded = !notesExpanded"
    >
      <span
        class="text-lg font-semibold text-white group-hover:text-primary transition-colors"
      >
        Personal Notes
      </span>
      <Icon
        name="lucide:chevron-down"
        size="20"
        class="transition-transform duration-200 text-gray-400 group-hover:text-primary"
        :class="{ 'rotate-180': notesExpanded }"
      />
    </button>

    <div v-show="notesExpanded" class="mt-4">
      <textarea
        v-model="notes"
        rows="6"
        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-primary focus:border-white placeholder-gray-400 resize-y"
        placeholder="Write your thoughts, review, or reminders here..."
      ></textarea>
    </div>
  </div>
</template>

<script lang="ts" setup>
const notes = defineModel<string>({ required: true });
const notesExpanded = ref(false);
</script>
