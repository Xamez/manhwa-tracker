<template>
  <div class="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-700">
    <button
      class="flex-1 px-6 py-2.5 bg-primary hover:bg-primary-lighter rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="saving"
      @click="$emit('save')"
    >
      <span>{{ isNew ? 'Add to My List' : 'Save Changes' }}</span>
    </button>
    <NuxtLink
      to="/"
      class="flex-1 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 font-medium flex items-center justify-center"
    >
      Cancel
    </NuxtLink>
    <button
      v-if="!isNew"
      class="sm:w-auto px-6 py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="deleting"
      @click="$emit('delete')"
    >
      <span class="flex items-center justify-center gap-2">
        <Icon name="lucide:trash-2" size="16" />
        Delete
      </span>
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  saving: boolean;
  deleting: boolean;
  isNew: boolean;
}>();

defineEmits<{
  (e: 'save'): void;
  (e: 'delete'): void;
}>();
</script>
