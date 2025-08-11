<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionStore } from '@/stores/collection'

const props = defineProps<{ printingId: string }>()
const coll = useCollectionStore()

const qty = computed({
  get: () => coll.entries[props.printingId] ?? 0,
  set: (v: number) => coll.setQty(props.printingId, v),
})
</script>

<template>
  <div class="inline-flex items-center gap-2">
    <button class="px-2 py-1 rounded-2xl border" @click="coll.remove(printingId, 1)">-</button>
    <input
      type="number"
      min="0"
      class="w-16 px-2 py-1 rounded-2xl border text-center"
      :value="qty"
      @input="qty = Number(($event.target as HTMLInputElement).value)"
    />
    <button class="px-2 py-1 rounded-2xl border" @click="coll.add(printingId, 1)">+</button>
  </div>
</template>
