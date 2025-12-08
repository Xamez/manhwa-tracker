<template>
  <div class="md:w-64 text-sm">
    <IconInput v-if="!hideSearch" v-model="name" icon="lucide:search" placeholder="Search..." />

    <div class="flex flex-col gap-2" :class="{ 'mt-4': !hideSearch }">
      <label class="block text-base font-medium mb-2">Status</label>
      <div class="flex flex-col gap-1">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          :class="[
            'px-2 py-1 rounded text-left',
            isStatusSelected(option.value)
              ? 'bg-primary text-white font-medium'
              : 'text-gray-400 hover:bg-gray-700',
          ]"
          @click="toggleStatus(option.value, $event)"
        >
          <div class="flex justify-between">
            {{ option.label }}
            <span class="text-gray-400">{{ countManhwaOfType(option.value) }}</span>
          </div>
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-2 mt-4">
      <label class="block text-base font-medium mb-2">Additional Filters</label>

      <div class="flex justify-between">
        <CustomCheckbox v-model="favoritesOnly">Favorites Only</CustomCheckbox>

        <CustomCheckbox v-model="unratedOnly">Unrated Only</CustomCheckbox>
      </div>

      <div class="mt-2">
        <div class="flex justify-between items-center mb-1">
          <label>Min Rating</label>
          <span class="text-primary font-medium">
            {{ minRating === 0 ? 'Any' : `${minRating}+` }}
          </span>
        </div>
        <input
          v-model.number="minRating"
          type="range"
          min="0"
          max="10"
          step="0.1"
          class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-primary"
        />
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 mt-4">
      <label class="block text-base font-medium mb-2">Sort By</label>
      <Dropdown v-model="sortBy" :options="sortOpptions" />

      <div class="flex gap-2 mt-2">
        <button
          v-for="order in Object.keys(SORT_ORDERS) as SortOrder[]"
          :key="order"
          :class="[
            'flex-1 px-2 py-1 rounded',
            sortOrder === order
              ? 'bg-primary hover:bg-primary-lighter text-white font-medium'
              : 'text-gray-400 bg-gray-800 hover:bg-gray-700',
          ]"
          @click="sortOrder = order"
        >
          {{ SORT_ORDERS[order] }}
        </button>
      </div>
    </div>

    <button
      class="w-full mt-6 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 font-medium"
      @click="clearFilters"
    >
      Clear All Filters
    </button>
  </div>
</template>

<script lang="ts" setup>
import { READING_STATUS } from '~~/shared/types/reading-status';
import { SORT_OPTIONS, SORT_ORDERS } from '~~/shared/types/sort';

const props = defineProps<{
  userManhwas?: UserManhwa[];
  hideSearch?: boolean;
  modelValue: Filters;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Filters];
}>();

const name = computed({
  get: () => props.modelValue.name,
  set: value => emit('update:modelValue', { ...props.modelValue, name: value }),
});

const selectedStatuses = computed({
  get: () => props.modelValue.statuses || [],
  set: value => emit('update:modelValue', { ...props.modelValue, statuses: value }),
});

const favoritesOnly = computed({
  get: () => props.modelValue.favoritesOnly,
  set: value => emit('update:modelValue', { ...props.modelValue, favoritesOnly: value }),
});

const unratedOnly = computed({
  get: () => props.modelValue.unratedOnly,
  set: value => emit('update:modelValue', { ...props.modelValue, unratedOnly: value }),
});

const minRating = computed({
  get: () => props.modelValue.minRating,
  set: value => emit('update:modelValue', { ...props.modelValue, minRating: value }),
});

const sortBy = computed({
  get: () => props.modelValue.sortBy,
  set: value => emit('update:modelValue', { ...props.modelValue, sortBy: value }),
});

const sortOrder = computed({
  get: () => props.modelValue.sortOrder,
  set: value => emit('update:modelValue', { ...props.modelValue, sortOrder: value }),
});

const statusOptions = [
  { value: '' as const, label: 'All' },
  ...Object.keys(READING_STATUS).map(status => ({
    value: status as ReadingStatus,
    label: READING_STATUS[status as ReadingStatus],
  })),
];

const sortOpptions = [
  ...Object.keys(SORT_OPTIONS).map(status => ({
    value: status as SortOption,
    label: SORT_OPTIONS[status as SortOption],
  })),
];

function isStatusSelected(status: ReadingStatus | ''): boolean {
  if (status === '') {
    return selectedStatuses.value.length === 0;
  }
  return selectedStatuses.value.includes(status);
}

function toggleStatus(status: ReadingStatus | '', event?: MouseEvent) {
  if (status === '') {
    selectedStatuses.value = [];
    return;
  }

  const isMultiSelect = event?.ctrlKey || event?.metaKey;

  if (isMultiSelect) {
    const current = selectedStatuses.value;
    if (current.includes(status)) {
      selectedStatuses.value = current.filter(s => s !== status);
    } else {
      selectedStatuses.value = [...current, status];
    }
  } else {
    selectedStatuses.value = [status];
  }
}

function countManhwaOfType(status: ReadingStatus | ''): number {
  if (!props.userManhwas) return 0;
  if (status === '') return props.userManhwas.length;
  return props.userManhwas.filter(um => um.status === status).length;
}

function clearFilters() {
  emit('update:modelValue', {
    name: '',
    statuses: [],
    favoritesOnly: false,
    unratedOnly: false,
    minRating: 0,
    sortBy: 'unreadChapters',
    sortOrder: 'desc',
  });
}
</script>
