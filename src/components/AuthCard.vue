<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <section class="mx-auto w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
    <header class="mb-4">
      <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
    </header>
    <slot />
  </section>
</template>
