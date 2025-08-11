<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  id: string
  label: string
  modelValue: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  hint?: string
  error?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const show = ref(false)
</script>

<template>
  <label :for="id" class="block text-sm font-medium text-gray-900 mb-1">{{ label }}</label>
  <div class="relative">
    <input
      :id="id"
      :type="show ? 'text' : 'password'"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete || 'current-password'"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!error || undefined"
      :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
      class="w-full h-10 rounded-2xl border px-3 pr-10 text-sm bg-white outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="error ? 'border-red-300' : 'border-gray-300'"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-2 my-auto text-xs text-gray-600 hover:underline"
      :aria-label="show ? 'Hide password' : 'Show password'"
      @click="show = !show"
    >
      {{ show ? 'Hide' : 'Show' }}
    </button>
    <p v-if="hint && !error" :id="`${id}-hint`" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
