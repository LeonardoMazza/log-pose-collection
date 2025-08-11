<script setup lang="ts">
import type { CardPrinting } from '@/domain/op-types'
import InventoryCounter from '@/components/InventoryCounter.vue'
defineProps<{ card: CardPrinting }>()
</script>

<template>
  <div class="rounded-2xl border bg-white p-3 hover:shadow-sm transition">
    <div
      class="aspect-[2/3] w-full rounded-xl bg-gray-100 grid place-items-center text-xs text-gray-500 mb-2"
    >
      {{ card.id }}
    </div>
    <div class="text-sm font-semibold leading-tight">{{ card.name }}</div>
    <div class="text-xs text-gray-500">
      {{ card.setCode }}-{{ card.number }} • {{ card.rarity }}
    </div>
    <div class="mt-2">
      <InventoryCounter :printingId="card.id" />
    </div>
  </div>
</template>
