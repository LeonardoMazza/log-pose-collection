<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  label: string
  modelValue: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autocomplete?: string
  required?: boolean
  hint?: string
  error?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const describedBy = computed(() => {
  const ids = []
  if (props.hint) ids.push(`${props.id}-hint`)
  if (props.error) ids.push(`${props.id}-error`)
  return ids.join(' ') || undefined
})
</script>

<template>
  <label :for="id" class="block text-sm font-medium text-gray-900 mb-1">{{ label }}</label>
  <div>
    <input
      :id="id"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!error || undefined"
      :aria-describedby="describedBy"
      class="w-full h-10 rounded-2xl border px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60 disabled:cursor-not-allowed [ &.has-error ]:border-red-300"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="error ? 'border-red-300' : 'border-gray-300'"
    />
    <p v-if="hint && !error" :id="`${id}-hint`" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
