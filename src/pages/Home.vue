<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { useCollectionStore } from '@/stores/collection'

const catalog = useCatalogStore()
const coll = useCollectionStore()

// carregar catálogo + coleção
onMounted(async () => {
  await catalog.load()
  coll.init()
})

// toggle: contar cópias (quantidade) ou apenas únicos
const countCopies = ref(false)

/** Progresso geral (únicos) */
const totalUnique = computed(() => catalog.cards.length)
const ownedUnique = computed(() => Object.keys(coll.entries).length)
const progressPct = computed(() =>
  totalUnique.value ? Math.round((ownedUnique.value / totalUnique.value) * 100) : 0,
)

/** Linhas de progresso por Set (owned vs total) */
const progressRows = computed(() => {
  // owned por set (únicos e cópias)
  const ownedUnique = new Map<string, number>()
  const ownedCopies = new Map<string, number>()

  for (const [id, qty] of Object.entries(coll.entries)) {
    const card = catalog.byId[id]
    if (!card) continue
    const set = card.setCode
    ownedUnique.set(set, (ownedUnique.get(set) ?? 0) + 1)
    ownedCopies.set(set, (ownedCopies.get(set) ?? 0) + (qty ?? 0))
  }

  // montar linhas usando sets do catálogo
  const rows = catalog.sets.map((s) => {
    const owned = countCopies.value
      ? (ownedCopies.get(s.code) ?? 0)
      : (ownedUnique.get(s.code) ?? 0)

    const total = s.total || 0 // total de únicos naquele set (do catálogo)
    const pct = total > 0 ? Math.min(100, Math.round((owned / total) * 100)) : 0

    return { code: s.code, name: s.name, total, owned, pct }
  })

  // ordenar: maior % primeiro, depois código
  rows.sort((a, b) => b.pct - a.pct || a.code.localeCompare(b.code))
  return rows
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header simples -->
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center">
        <h1 class="text-lg font-semibold">Home</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Progresso geral -->
      <section class="rounded-2xl border bg-white p-4">
        <div class="flex items-center gap-4 flex-wrap">
          <div>
            <div class="text-sm text-gray-600">Unique owned</div>
            <div class="text-2xl font-semibold">
              {{ ownedUnique }} <span class="text-gray-400">/ {{ totalUnique }}</span>
            </div>
          </div>

          <div class="flex-1 min-w-[220px]">
            <div class="text-sm text-gray-600 mb-1">Collection completion</div>
            <div class="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full bg-gray-900" :style="{ width: progressPct + '%' }"></div>
            </div>
            <div class="mt-1 text-xs text-gray-500">{{ progressPct }}%</div>
          </div>
        </div>
      </section>

      <!-- Barras por expansão (Owned / Total) -->
      <section class="rounded-2xl border bg-white p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-semibold">Set completion</div>
          <label class="text-xs text-gray-600 inline-flex items-center gap-2">
            <input type="checkbox" v-model="countCopies" class="rounded border-gray-300" />
            Count copies
          </label>
        </div>

        <div v-if="!catalog.loaded" class="text-sm text-gray-500">Loading…</div>

        <ul v-else class="space-y-3">
          <li v-for="row in progressRows" :key="row.code" class="flex items-center gap-3">
            <!-- Código do set -->
            <div class="w-16 sm:w-20 text-xs font-mono text-gray-600 shrink-0">
              {{ row.code }}
            </div>

            <!-- Barra + números -->
            <div class="flex-1">
              <div class="flex items-baseline justify-between text-xs mb-1">
                <div class="truncate">{{ row.name }}</div>
                <div class="text-gray-600">
                  <b class="text-gray-900">{{ row.owned }}</b>
                  <span class="mx-1">/</span>
                  {{ row.total }}
                  <span class="ml-2 text-gray-400">({{ row.pct }}%)</span>
                </div>
              </div>

              <div class="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  class="h-full bg-green-900 transition-[width] duration-300"
                  :style="{ width: row.pct + '%' }"
                />
              </div>
            </div>
          </li>
        </ul>

        <p v-if="catalog.loaded && progressRows.length === 0" class="text-sm text-gray-500">
          No sets to show.
        </p>
      </section>
    </main>
  </div>
</template>
