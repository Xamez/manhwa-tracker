<template>
  <label class="inline-flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      class="absolute opacity-0 w-0 h-0 peer"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span
      class="relative w-4 h-4 border-2 border-gray-600 rounded bg-gray-700 flex-shrink-0 transition-all peer-hover:border-gray-400 peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-focus-visible:outline-offset-2 peer-disabled:opacity-50 after:hidden peer-checked:after:block after:absolute after:left-1 after:top-0.5 after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
    ></span>
    <span
      v-if="$slots.default"
      class="leading-none peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
    >
      <slot></slot>
    </span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>
)
