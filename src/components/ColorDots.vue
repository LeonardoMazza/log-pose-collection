<script setup lang="ts">
type Color = 'Red' | 'Green' | 'Blue' | 'Purple' | 'Black' | 'Yellow' | 'Multi'
const props = defineProps<{ colors: Color[] }>()
const dot: Record<Color, string> = {
  Red: 'bg-brand-red',
  Green: 'bg-brand-green',
  Blue: 'bg-brand-blue',
  Purple: 'bg-brand-purple',
  Black: 'bg-brand-black',
  Yellow: 'bg-brand-yellow',
  Multi: 'bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow',
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <span
      v-for="c in colors"
      :key="c"
      class="h-2.5 w-2.5 rounded-full inline-block"
      :class="dot[c]"
    />
  </div>
</template>
