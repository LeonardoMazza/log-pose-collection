<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <header class="sticky top-0 bg-white/80 backdrop-blur border-b">
    <nav class="max-w-5xl mx-auto p-3 flex gap-4 text-sm items-center">
      <RouterLink to="/" class="hover:underline">Home</RouterLink>
      <RouterLink to="/collection" class="hover:underline">Collection</RouterLink>
      <RouterLink to="/decks" class="hover:underline">Decks</RouterLink>

      <div class="ml-auto flex items-center gap-3">
        <template v-if="auth.user">
          <span class="text-gray-600">{{ auth.user.name }}</span>
          <button
            class="px-3 py-1 border rounded-2xl hover:bg-gray-100 hover:cursor-pointer"
            @click="auth.logout()"
          >
            Sign out
          </button>
        </template>
        <template v-else>
          <RouterLink to="/signin">Sign in</RouterLink>
          <RouterLink to="/signup">Sign up</RouterLink>
        </template>
      </div>
    </nav>
  </header>
  <RouterView />
  <footer>
    <div class="max-w-5xl mx-auto p-3 text-sm text-gray-600">
      &copy; 2023 Log Pose Collection - made by
      <a href="https://github.com/leonardomazza" target="_blank" rel="noopener noreferrer"
        ><b>Leonardo Mazza</b></a
      >
    </div>
  </footer>
</template>
