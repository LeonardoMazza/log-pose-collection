<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDecksStore } from '@/stores/decks'
import { useRouter } from 'vue-router'

const decks = useDecksStore()
const router = useRouter()
const q = ref('')

const filtered = computed(() =>
  decks.all.filter((d) => d.name.toLowerCase().includes(q.value.trim().toLowerCase())),
)

function createDeck() {
  const d = decks.create('New Deck')
  router.push({ name: 'deckEditor', params: { id: d.id } })
}
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-end gap-3">
      <div class="flex-1">
        <label class="text-xs text-gray-500">Search</label>
        <input
          v-model="q"
          class="w-full h-10 px-3 rounded-2xl border"
          placeholder="Search decks..."
        />
      </div>
      <button class="px-3 h-10 rounded-2xl border" @click="createDeck">New deck</button>
    </header>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div v-for="d in filtered" :key="d.id" class="rounded-2xl border bg-white p-3">
        <div class="flex items-center gap-2">
          <input
            class="flex-1 h-9 px-2 rounded-2xl border"
            :value="d.name"
            @change="(e: any) => decks.rename(d.id, e.target.value)"
          />
          <button
            class="px-2 h-9 rounded-2xl border"
            @click="$router.push({ name: 'deckEditor', params: { id: d.id } })"
          >
            Open
          </button>
          <button class="px-2 h-9 rounded-2xl border" @click="decks.remove(d.id)">Delete</button>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          Leader: <b>{{ d.leaderId || '—' }}</b> • Cards:
          <b>{{ Object.values(d.main).reduce((a, b) => a + b, 0) }}/50</b>
        </div>
      </div>
    </div>

    <p v-if="filtered.length === 0" class="text-sm text-gray-500">No decks yet.</p>
  </section>
</template>
