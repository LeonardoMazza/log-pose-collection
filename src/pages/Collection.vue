<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import Chip from '@/components/Chip.vue'
import CardTile from '@/components/CardTile.vue'
import { useCatalogStore } from '@/stores/catalog'
import { useCollectionStore } from '@/stores/collection'
import type { Rarity } from '@/domain/op-types'

const catalog = useCatalogStore()
const coll = useCollectionStore()

// busca livre
const q = ref('')

// filtros (vazio = todos)
const selectedSets = ref<string[]>([])
const selectedRarities = ref<Rarity[]>([])

// ordem útil de raridade (ajuste se quiser)
const ALL_RARITIES = ['L', 'SEC', 'SR', 'R', 'UC', 'C', 'P', 'ALT'] as const

onMounted(async () => {
  await catalog.load()
  coll.init()
})

// 1) Filtra só por texto (para contagens de chips)
const searchFiltered = computed(() => {
  const txt = q.value.trim().toLowerCase()
  if (!txt) return catalog.cards
  return catalog.cards.filter((c) => {
    const hay = `${c.name} ${c.id} ${c.setCode} ${c.number}`.toLowerCase()
    return hay.includes(txt)
  })
})

// 2) Contagens para exibir nos chips (após busca, antes dos chips)
const setCounts = computed(() => {
  const map = new Map<string, number>()
  for (const c of searchFiltered.value) map.set(c.setCode, (map.get(c.setCode) ?? 0) + 1)
  return map
})
const rarityCounts = computed(() => {
  const map = new Map<Rarity, number>()
  for (const c of searchFiltered.value)
    map.set(c.rarity as Rarity, (map.get(c.rarity as Rarity) ?? 0) + 1)
  return map
})

// 3) Aplica filtros de chips sobre o resultado da busca
const results = computed(() => {
  return searchFiltered.value.filter((c) => {
    const okSet = selectedSets.value.length === 0 || selectedSets.value.includes(c.setCode)
    const okRar =
      selectedRarities.value.length === 0 || selectedRarities.value.includes(c.rarity as Rarity)
    return okSet && okRar
  })
})

// helpers
function toggleSet(code: string) {
  const i = selectedSets.value.indexOf(code)
  if (i >= 0) selectedSets.value.splice(i, 1)
  else selectedSets.value.push(code)
}
function toggleRarity(r: Rarity) {
  const i = selectedRarities.value.indexOf(r)
  if (i >= 0) selectedRarities.value.splice(i, 1)
  else selectedRarities.value.push(r)
}
function clearFilters() {
  selectedSets.value = []
  selectedRarities.value = []
}
</script>

<template>
  <section class="space-y-4">
    <!-- Barra de busca + resumo -->
    <header class="flex flex-col md:flex-row gap-3 md:items-end">
      <div class="flex-1">
        <label class="text-xs text-gray-500">Search</label>
        <input
          v-model="q"
          placeholder="name, id (OP01-001), set…"
          class="w-full h-10 px-3 rounded-2xl border"
        />
      </div>
      <div class="rounded-2xl border p-3 text-sm text-gray-700">
        Total: <b>{{ coll.totalCards }}</b> • Unique: <b>{{ coll.uniqueCards }}</b>
      </div>
    </header>

    <!-- Filtros: Set -->
    <div class="space-y-2">
      <div class="text-xs text-gray-500">Sets</div>
      <div class="flex flex-wrap gap-2">
        <Chip :active="selectedSets.length === 0" @click="selectedSets = []">All</Chip>
        <Chip
          v-for="s in catalog.sets"
          :key="s.code"
          :active="selectedSets.includes(s.code)"
          :disabled="(setCounts.get(s.code) ?? 0) === 0"
          :aria-label="`Filter by set ${s.code}`"
          @click="toggleSet(s.code)"
        >
          <span class="font-medium">{{ s.code }}</span>
          <span class="text-xs opacity-80">({{ setCounts.get(s.code) ?? 0 }})</span>
        </Chip>
      </div>
    </div>

    <!-- Filtros: Rarity -->
    <div class="space-y-2">
      <div class="text-xs text-gray-500">Rarity</div>
      <div class="flex flex-wrap gap-2">
        <Chip :active="selectedRarities.length === 0" @click="selectedRarities = []">All</Chip>
        <Chip
          v-for="r in ALL_RARITIES"
          :key="r"
          :active="selectedRarities.includes(r as Rarity)"
          :disabled="(rarityCounts.get(r as any) ?? 0) === 0"
          :aria-label="`Filter by rarity ${r}`"
          @click="toggleRarity(r as Rarity)"
        >
          <span class="font-medium">{{ r }}</span>
          <span class="text-xs opacity-80">({{ rarityCounts.get(r as any) ?? 0 }})</span>
        </Chip>
      </div>
    </div>

    <!-- Limpar filtros -->
    <div class="flex gap-2">
      <button
        class="text-sm underline text-gray-600"
        @click="clearFilters"
        v-if="selectedSets.length || selectedRarities.length"
      >
        Clear filters
      </button>
    </div>

    <!-- Grid -->
    <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <CardTile v-for="c in results" :key="c.id" :card="c" />
    </div>

    <!-- Empty state -->
    <p v-if="results.length === 0" class="text-sm text-gray-500">No cards match your filters.</p>
  </section>
</template>
