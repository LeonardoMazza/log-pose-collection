<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { useCollectionStore } from '@/stores/collection'
import CardTile from '@/components/CardTile.vue'
import { isRef, type Ref } from 'vue'

const catalog = useCatalogStore()
const coll = useCollectionStore()

const q = ref('')
const filtersOpen = ref(false)

// Filtros
const ALL_COLORS = ['Red', 'Green', 'Blue', 'Purple', 'Black', 'Yellow'] as const
const selectedColors = ref<string[]>([])
const selectedSets = ref<string[]>([])
const costMin = ref<number | null>(null)
const costMax = ref<number | null>(null)

onMounted(async () => {
  await catalog.load()
  coll.init()
})

const costBounds = computed(() => {
  const costs = catalog.cards.map((c) => c.cost).filter((v): v is number => typeof v === 'number')
  const min = costs.length ? Math.min(...costs) : 0
  const max = costs.length ? Math.max(...costs) : 10
  return { min, max }
})

const activeFilterCount = computed(() => {
  let n = 0
  if (selectedColors.value.length) n++
  if (selectedSets.value.length) n++
  if (costMin.value != null || costMax.value != null) n++
  return n
})

function toggleIn(arr: Ref<string[]> | string[], v: string) {
  const list = isRef(arr) ? arr.value : arr
  const i = list.indexOf(v)
  if (i >= 0) list.splice(i, 1)
  else list.push(v)
}
function resetFilters() {
  selectedColors.value = []
  selectedSets.value = []
  costMin.value = null
  costMax.value = null
}

const results = computed(() => {
  const search = q.value.trim().toLowerCase()
  const hasCost = costMin.value != null || costMax.value != null

  return catalog.cards.filter((c) => {
    // busca
    const matchesSearch =
      !search ||
      `${c.name} ${c.id} ${c.setCode} ${c.number} ${c.rarity}`.toLowerCase().includes(search)
    if (!matchesSearch) return false

    // cor (qualquer uma)
    const okColor =
      selectedColors.value.length === 0 ||
      (Array.isArray(c.colors) && c.colors.some((col) => selectedColors.value.includes(col)))

    // set/expansão
    const okSet = selectedSets.value.length === 0 || selectedSets.value.includes(c.setCode)

    // custo
    const okCost = !hasCost
      ? true
      : typeof c.cost === 'number' &&
        (costMin.value == null || c.cost >= costMin.value) &&
        (costMax.value == null || c.cost <= costMax.value)

    return okColor && okSet && okCost
  })
})

// helpers visuais
const COLOR_BG: Record<string, string> = {
  Red: 'bg-red-500',
  Green: 'bg-green-500',
  Blue: 'bg-blue-500',
  Purple: 'bg-purple-500',
  Black: 'bg-neutral-800',
  Yellow: 'bg-yellow-400',
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <h1 class="text-lg font-semibold">Collection</h1>
        <div class="ml-auto text-sm text-gray-600">
          Total: <b>{{ coll.totalCards }}</b> • Unique: <b>{{ coll.uniqueCards }}</b>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <!-- Search -->
      <div>
        <label class="text-xs text-gray-500">Search</label>
        <input
          v-model="q"
          placeholder="Name, ID (OP01-001)…"
          class="w-full h-10 px-3 rounded-2xl border bg-white"
        />
      </div>

      <!-- Botão de filtros -->
      <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center gap-2 text-sm px-3 h-9 rounded-2xl border bg-white hover:bg-gray-50"
          @click="filtersOpen = !filtersOpen"
          :aria-expanded="filtersOpen"
        >
          <!-- ícone filtro (inline SVG) -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M3 5h18M6 12h12M10 19h4"
            />
          </svg>
          Filters
          <span
            v-if="activeFilterCount"
            class="ml-1 inline-flex items-center justify-center text-xs w-5 h-5 rounded-full bg-gray-900 text-white"
          >
            {{ activeFilterCount }}
          </span>
        </button>

        <button
          v-if="activeFilterCount"
          class="text-sm text-gray-600 underline"
          @click="resetFilters"
        >
          Clear
        </button>
      </div>

      <!-- Painel de filtros -->
      <div v-if="filtersOpen" class="rounded-2xl border bg-white p-3">
        <div class="grid gap-4 md:grid-cols-3">
          <!-- Colors -->
          <div>
            <div class="text-xs text-gray-500 mb-2">Colors</div>
            <div class="flex flex-wrap gap-2">
              <button
                class="inline-flex items-center gap-2 h-9 px-3 rounded-2xl border text-sm"
                :class="
                  selectedColors.length === 0
                    ? 'bg-gray-900 text-white border-transparent'
                    : 'bg-white hover:bg-gray-50'
                "
                @click="selectedColors = []"
              >
                All
              </button>
              <button
                v-for="c in ALL_COLORS"
                :key="c"
                class="inline-flex items-center gap-2 h-9 px-3 rounded-2xl border text-sm"
                :class="
                  selectedColors.includes(c)
                    ? 'bg-gray-900 text-white border-transparent'
                    : 'bg-white hover:bg-gray-50'
                "
                @click="toggleIn(selectedColors, c)"
              >
                <span class="h-2.5 w-2.5 rounded-full" :class="COLOR_BG[c]"></span>
                {{ c }}
              </button>
            </div>
          </div>

          <!-- Cost -->
          <div>
            <div class="text-xs text-gray-500 mb-2">Cost</div>
            <div class="flex items-center gap-2">
              <input
                type="number"
                class="w-20 h-9 rounded-2xl border px-2"
                :placeholder="String(costBounds.min)"
                v-model.number="costMin"
              />
              <span class="text-xs text-gray-500">to</span>
              <input
                type="number"
                class="w-20 h-9 rounded-2xl border px-2"
                :placeholder="String(costBounds.max)"
                v-model.number="costMax"
              />
              <button
                class="ml-auto text-xs underline"
                @click="((costMin = null), (costMax = null))"
              >
                reset
              </button>
            </div>
          </div>

          <!-- Expansion / Set -->
          <div>
            <div class="text-xs text-gray-500 mb-2">Expansion</div>
            <div class="flex flex-wrap gap-2 max-h-28 overflow-auto pr-1">
              <button
                class="inline-flex items-center gap-2 h-9 px-3 rounded-2xl border text-sm"
                :class="
                  selectedSets.length === 0
                    ? 'bg-gray-900 text-white border-transparent'
                    : 'bg-white hover:bg-gray-50'
                "
                @click="selectedSets = []"
              >
                All
              </button>
              <button
                v-for="s in catalog.sets"
                :key="s.code"
                class="inline-flex items-center gap-2 h-9 px-3 rounded-2xl border text-sm"
                :class="
                  selectedSets.includes(s.code)
                    ? 'bg-gray-900 text-white border-transparent'
                    : 'bg-white hover:bg-gray-50'
                "
                @click="toggleIn(selectedSets, s.code)"
              >
                {{ s.code }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <p v-if="!catalog.loaded" class="text-sm text-gray-500">Loading card catalog…</p>

      <!-- Grid -->
      <div v-else class="grid grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] gap-3">
        <CardTile v-for="c in results" :key="c.id" :card="c" />
      </div>

      <p v-if="catalog.loaded && results.length === 0" class="text-sm text-gray-500 mt-6">
        No cards match your filters.
      </p>
    </main>
  </div>
</template>
