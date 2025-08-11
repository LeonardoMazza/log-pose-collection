<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <header class="sticky top-0 bg-white/80 backdrop-blur border-b">
    <nav class="max-w-5xl mx-auto p-3 flex gap-4 text-sm items-center">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/collection">Collection</RouterLink>
      <div class="ml-auto flex items-center gap-3">
        <template v-if="auth.user">
          <span class="text-gray-600">{{ auth.user.name }}</span>
          <button class="px-3 py-1 border rounded-2xl" @click="auth.logout()">Sign out</button>
        </template>
        <template v-else>
          <RouterLink to="/signin">Sign in</RouterLink>
          <RouterLink to="/signup">Sign up</RouterLink>
        </template>
      </div>
    </nav>
  </header>
  <RouterView />
</template>
