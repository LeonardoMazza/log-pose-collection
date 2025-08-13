<script setup lang="ts">
import type { CardPrinting } from '@/domain/op-types'
import { computed, ref } from 'vue'
import InventoryCounter from '@/components/InventoryCounter.vue'
import RarityBadge from '@/components/RarityBadge.vue'
import ColorDots from '@/components/ColorDots.vue'
import { useCollectionStore } from '@/stores/collection'

const props = defineProps<{ rows: CardPrinting[] }>()

type SortKey = 'name' | 'set' | 'rarity' | 'type' | 'cost' | 'power' | 'qty'
const sortKey = ref<SortKey>('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const coll = useCollectionStore()

function toggleSort(k: SortKey) {
  if (sortKey.value === k) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = k
    sortDir.value = 'asc'
  }
}

const sorted = computed(() => {
  const arr = [...props.rows]
  const dir = sortDir.value === 'asc' ? 1 : -1
  const key = sortKey.value
  arr.sort((a, b) => {
    const qtyA = coll.entries[a.id] ?? 0
    const qtyB = coll.entries[b.id] ?? 0
    const valA =
      key === 'name'
        ? a.name
        : key === 'set'
          ? `${a.setCode}-${a.number}`
          : key === 'rarity'
            ? a.rarity
            : key === 'type'
              ? a.type
              : key === 'cost'
                ? (a.cost ?? -1)
                : key === 'power'
                  ? (a.power ?? -1)
                  : qtyA
    const valB =
      key === 'name'
        ? b.name
        : key === 'set'
          ? `${b.setCode}-${b.number}`
          : key === 'rarity'
            ? b.rarity
            : key === 'type'
              ? b.type
              : key === 'cost'
                ? (b.cost ?? -1)
                : key === 'power'
                  ? (b.power ?? -1)
                  : qtyB

    if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * dir
    return String(valA).localeCompare(String(valB)) * dir
  })
  return arr
})

function icon(k: SortKey) {
  if (sortKey.value !== k) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <div class="overflow-auto rounded-2xl border bg-white">
    <table class="min-w-full text-sm">
      <thead class="sticky top-0 z-10 bg-white/90 backdrop-blur">
        <tr
          class="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold [&>th]:text-gray-700"
        >
          <th class="min-w-[220px] cursor-pointer" @click="toggleSort('name')">
            Card <span class="ml-1 text-xs opacity-60">{{ icon('name') }}</span>
          </th>
          <th class="w-28 cursor-pointer" @click="toggleSort('set')">
            Set <span class="ml-1 text-xs opacity-60">{{ icon('set') }}</span>
          </th>
          <th class="w-28 cursor-pointer" @click="toggleSort('type')">
            Type <span class="ml-1 text-xs opacity-60">{{ icon('type') }}</span>
          </th>
          <th class="w-28">Colors</th>
          <th class="w-20 cursor-pointer" @click="toggleSort('rarity')">
            Rarity <span class="ml-1 text-xs opacity-60">{{ icon('rarity') }}</span>
          </th>
          <th class="w-16 text-right cursor-pointer" @click="toggleSort('cost')">
            Cost <span class="ml-1 text-xs opacity-60">{{ icon('cost') }}</span>
          </th>
          <th class="w-20 text-right cursor-pointer" @click="toggleSort('power')">
            Power <span class="ml-1 text-xs opacity-60">{{ icon('power') }}</span>
          </th>
          <th class="w-32 text-right cursor-pointer" @click="toggleSort('qty')">
            Qty <span class="ml-1 text-xs opacity-60">{{ icon('qty') }}</span>
          </th>
        </tr>
      </thead>
      <tbody class="[&>tr]:border-t">
        <tr v-for="c in sorted" :key="c.id" class="hover:bg-gray-50 odd:bg-gray-50/40">
          <td class="px-3 py-2">
            <div class="font-medium text-gray-900 leading-tight">{{ c.name }}</div>
            <div class="text-xs text-gray-500">{{ c.setCode }}-{{ c.number }} • {{ c.id }}</div>
          </td>
          <td class="px-3 py-2">{{ c.setCode }}</td>
          <td class="px-3 py-2">{{ c.type }}</td>
          <td class="px-3 py-2"><ColorDots :colors="c.colors as any" /></td>
          <td class="px-3 py-2"><RarityBadge :rarity="c.rarity as any" /></td>
          <td class="px-3 py-2 text-right tabular-nums">{{ c.cost ?? '—' }}</td>
          <td class="px-3 py-2 text-right tabular-nums">{{ c.power ?? '—' }}</td>
          <td class="px-3 py-2">
            <div class="flex justify-end">
              <InventoryCounter :printingId="c.id" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
