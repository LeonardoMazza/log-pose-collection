<script setup lang="ts">
const props = defineProps<{
  id: string
  label: string
  modelValue: boolean
  hint?: string
  error?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <div class="flex items-start gap-3">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-300"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <div>
      <label :for="id" class="text-sm text-gray-900">{{ label }}</label>
      <p v-if="hint && !error" class="text-xs text-gray-500">{{ hint }}</p>
      <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
    </div>
  </div>
</template>
