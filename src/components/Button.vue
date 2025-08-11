<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'md', type: 'button', loading: false, disabled: false },
)

const cls = computed(() => {
  const base = 'inline-flex items-center justify-center rounded-2xl font-medium transition border'
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  }[props.size]
  const variants = {
    primary:
      'bg-gray-900 text-white border-transparent hover:bg-gray-800 focus:ring-2 focus:ring-gray-400',
    ghost:
      'bg-transparent text-gray-900 border-transparent hover:bg-gray-100 focus:ring-2 focus:ring-gray-300',
    outline:
      'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300',
  }[props.variant]
  const state = props.loading || props.disabled ? 'opacity-60 cursor-not-allowed' : ''
  return [base, sizes, variants, state].join(' ')
})
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="cls">
    <span
      v-if="loading"
      class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-current"
    />
    <slot />
  </button>
</template>
