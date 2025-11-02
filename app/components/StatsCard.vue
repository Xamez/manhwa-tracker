<template>
  <div class="bg-white/5 rounded-lg p-4">
    <div class="flex items-center gap-3 mb-2">
      <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
        <Icon :name="icon" size="20" class="text-primary" />
      </div>
      <div>
        <p class="text-xl md:text-2xl font-bold text-white">{{ value }}</p>
        <p class="text-xs md:text-sm text-white/60">{{ label }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  icon: string;
  value: string | number;
  label: string;
}

defineProps<Props>();
</script>
