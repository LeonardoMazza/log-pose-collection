<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useCollectionStore } from '@/stores/collection'
import { useDecksStore } from '@/stores/decks'
import InventoryCounter from '@/components/InventoryCounter.vue'
import CardTile from '@/components/CardTile.vue'
import { parseDecklist, printDecklist, detectLeaderFromMap } from '@/services/decklist'
import type { Color } from '@/domain/op-types'

const route = useRoute()
const decks = useDecksStore()
const catalog = useCatalogStore()
const coll = useCollectionStore()

const id = route.params.id as string
const deck = computed(() => decks.byId[id])

const q = ref('')
const importText = ref('')

onMounted(async () => {
  await catalog.load()
  coll.init()
  if (!deck.value) decks.create('New Deck')
})

const leader = computed(() => (deck.value?.leaderId ? catalog.byId[deck.value.leaderId] : null))
const leaderColors = computed(() => (leader.value?.colors ?? []) as Color[])

const filtered = computed(() => {
  const txt = q.value.trim().toLowerCase()
  return catalog.cards.filter((c) => {
    const inText = !txt || `${c.name} ${c.id}`.toLowerCase().includes(txt)
    // Líder pode ser escolhido na seção própria; aqui listamos só não-líder p/ adicionar
    return inText && c.type !== 'Leader'
  })
})

function setLeader(pid: string) {
  decks.setLeader(id, pid)
}

function addToDeck(pid: string, n = 1) {
  // impedir cor inválida
  const card = catalog.byId[pid]
  const ok = (card?.colors ?? []).some((c) => leaderColors.value.includes(c as Color))
  if (!leader.value) return alert('Select a Leader first.')
  if (!ok) return alert(`Color mismatch for ${pid}.`)
  decks.addCard(id, pid, n)
}

const validation = computed(() => decks.validate(id))

function exportDeck() {
  const text = printDecklist(deck.value?.main || {}, deck.value?.leaderId || undefined)
  navigator.clipboard.writeText(text).catch(() => {})
  alert('Decklist copied to clipboard.')
}

function importDeck() {
  const map = parseDecklist(importText.value)
  if (!Object.keys(map).length) {
    alert('Nothing to import.')
    return
  }

  const { leaderId, main, warnings } = detectLeaderFromMap(map, (id) => catalog.byId[id])

  // define o líder automaticamente (se encontrado)
  if (leaderId) {
    decks.setLeader(id, leaderId)
  } else {
    // Sem líder detectado — usuário escolhe manualmente
    // (mantemos sem leader e a validação apontará)
  }

  // preenche o main (50 cartas)
  decks.importList(id, main)

  importText.value = ''
  if (warnings.length) {
    alert(`Imported with warnings:\n- ${warnings.join('\n- ')}`)
  } else {
    alert(leaderId ? 'Imported (Leader detected automatically).' : 'Imported. Pick a Leader above.')
  }
}
</script>

<template>
  <section v-if="deck" class="space-y-6">
    <!-- Cabeçalho -->
    <header class="flex flex-col gap-3 md:flex-row md:items-end">
      <div class="flex-1">
        <label class="text-xs text-gray-500">Deck name</label>
        <input
          class="w-full h-10 px-3 rounded-2xl border"
          :value="deck.name"
          @change="(e: any) => decks.rename(deck.id, e.target.value)"
        />
      </div>

      <div class="rounded-2xl border p-3 text-sm">
        Leader:
        <b>{{ deck.leaderId || '—' }}</b>
        • Main: <b>{{ validation.totalMain }}/50</b>
      </div>
      <div class="flex gap-2">
        <button class="px-3 h-10 rounded-2xl border" @click="exportDeck">Export</button>
        <button class="px-3 h-10 rounded-2xl border" @click="decks.clearMain(deck.id)">
          Clear
        </button>
      </div>
    </header>

    <!-- Escolher Líder -->
    <div class="space-y-2">
      <div class="text-xs text-gray-500">Choose Leader</div>
      <div class="grid grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] gap-3">
        <div
          v-for="c in catalog.cards.filter((x) => x.type === 'Leader')"
          :key="c.id"
          class="rounded-2xl border p-3 bg-white"
          :class="deck.leaderId === c.id ? 'ring-2 ring-gray-900' : ''"
        >
          <div
            class="aspect-[2/3] bg-gray-100 rounded-lg grid place-items-center text-xs text-gray-500 mb-2"
          >
            {{ c.id }}
          </div>
          <div class="text-sm font-semibold">{{ c.name }}</div>
          <div class="text-xs text-gray-500">{{ c.colors.join('/') }}</div>
          <button class="mt-2 px-3 h-9 rounded-2xl border w-full" @click="setLeader(c.id)">
            {{ deck.leaderId === c.id ? 'Selected' : 'Select' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Avisos/erros -->
    <div v-if="validation.errors.length || validation.warnings.length" class="space-y-2">
      <div
        v-for="e in validation.errors"
        :key="e"
        class="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm"
      >
        {{ e }}
      </div>
      <div
        v-for="w in validation.warnings"
        :key="w"
        class="rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 text-sm"
      >
        {{ w }}
      </div>
    </div>

    <!-- Importar -->
    <details class="rounded-2xl border bg-white p-3">
      <summary class="cursor-pointer text-sm font-semibold">
        Import decklist (1xOP09-001 ...)
      </summary>
      <textarea
        v-model="importText"
        rows="6"
        class="mt-2 w-full rounded-2xl border p-2 font-mono text-sm"
        placeholder="1xOP09-001&#10;4xOP01-006&#10;..."
      ></textarea>
      <div class="mt-2">
        <button class="px-3 h-9 rounded-2xl border" @click="importDeck">Import</button>
      </div>
    </details>

    <!-- Cartas do deck (com badge Missing) -->
    <div class="space-y-2">
      <div class="text-xs text-gray-500">Deck cards</div>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div v-for="(qty, pid) in deck.main" :key="pid" class="rounded-2xl border p-3 bg-white">
          <div class="flex items-start gap-2">
            <div class="flex-1">
              <div class="text-sm font-semibold">{{ catalog.byId[pid]?.name || pid }}</div>
              <div class="text-xs text-gray-500">
                {{ pid }} • {{ catalog.byId[pid]?.rarity || '—' }}
              </div>
            </div>
            <span
              v-if="(coll.entries[pid] ?? 0) < qty"
              class="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs"
            >
              Missing {{ qty - (coll.entries[pid] ?? 0) }}
            </span>
          </div>
          <div class="mt-2 flex justify-between items-center">
            <div class="text-xs text-gray-600">You own: {{ coll.entries[pid] ?? 0 }}</div>
            <InventoryCounter :printingId="pid" />
          </div>
          <div class="mt-2 flex gap-2">
            <button
              class="px-3 h-9 rounded-2xl border"
              @click="decks.setQty(deck.id, pid, qty + 1)"
            >
              +1
            </button>
            <button
              class="px-3 h-9 rounded-2xl border"
              @click="decks.setQty(deck.id, pid, Math.max(0, qty - 1))"
            >
              -1
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Buscar e adicionar cartas compatíveis -->
    <div class="space-y-2">
      <div class="text-xs text-gray-500">Add cards (only non-Leaders; must match Leader color)</div>
      <div class="flex gap-3">
        <input
          v-model="q"
          class="flex-1 h-10 px-3 rounded-2xl border"
          placeholder="Search name or id..."
        />
        <button class="px-3 h-10 rounded-2xl border" @click="q = ''">Clear</button>
      </div>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          v-for="c in filtered"
          :key="c.id"
          class="rounded-2xl border p-3 bg-white"
          :class="
            leader &&
            (c.colors.some((col) => leaderColors.includes(col as Color))
              ? ''
              : 'opacity-50 pointer-events-none')
          "
        >
          <CardTile :card="c" />
          <button class="mt-2 px-3 h-9 rounded-2xl border w-full" @click="addToDeck(c.id)">
            Add
          </button>
        </div>
      </div>
    </div>
  </section>

  <p v-else class="text-sm text-gray-500">Deck not found.</p>
</template>
