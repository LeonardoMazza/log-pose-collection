<script setup lang="ts">
const props = defineProps<{ rarity: 'C' | 'UC' | 'R' | 'SR' | 'SEC' | 'L' | 'P' | 'ALT' }>()
const cls: Record<string, string> = {
  C: 'bg-gray-100 text-gray-700 border-gray-200',
  UC: 'bg-sky-100 text-sky-700 border-sky-200',
  R: 'bg-green-100 text-green-700 border-green-200',
  SR: 'bg-purple-100 text-purple-700 border-purple-200',
  SEC: 'bg-amber-100 text-amber-800 border-amber-200',
  L: 'bg-pink-100 text-pink-700 border-pink-200',
  P: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  ALT: 'bg-rose-100 text-rose-700 border-rose-200',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
    :class="cls[rarity]"
  >
    {{ rarity }}
  </span>
</template>
