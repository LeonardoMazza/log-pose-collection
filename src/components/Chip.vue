<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    active?: boolean
    disabled?: boolean
    ariaLabel?: string
  }>(),
  { active: false, disabled: false },
)
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    :aria-label="ariaLabel"
    class="inline-flex items-center gap-2 rounded-2xl border px-3 h-8 text-sm transition focus:outline-none focus:ring-2 focus:ring-gray-300"
    :class="[
      active
        ? 'bg-gray-900 text-white border-transparent'
        : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
