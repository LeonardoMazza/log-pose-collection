<script setup lang="ts">
const props = withDefaults(defineProps<{ type?: 'error' | 'success' | 'info' }>(), { type: 'info' })
</script>

<template>
  <div
    v-if="$slots.default"
    :class="[
      'rounded-2xl border px-3 py-2 text-sm',
      type === 'error' && 'border-red-300 bg-red-50 text-red-700',
      type === 'success' && 'border-green-300 bg-green-50 text-green-700',
      type === 'info' && 'border-gray-300 bg-gray-50 text-gray-700',
    ]"
  >
    <slot />
  </div>
</template>
