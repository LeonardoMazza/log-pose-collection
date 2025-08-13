<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CardPrinting } from '@/domain/op-types'
import { useCollectionStore } from '@/stores/collection'
import Button from '@/components/Button.vue' // se não tiver, use <button>

const props = defineProps<{ card: CardPrinting }>()
const imgErr = ref(false)

const coll = useCollectionStore()
const qty = computed(() => coll.entries[props.card.id] ?? 0)

function addOne() {
  coll.add(props.card.id, 1)
}
function removeOne() {
  coll.remove(props.card.id, 1)
}
</script>

<template>
  <div class="relative">
    <!-- Imagem / fallback -->
    <div v-if="card.image && !imgErr" class="relative">
      <img
        :src="card.image"
        :alt="card.name"
        class="rounded-lg shadow-md transition-transform hover:scale-105 w-full h-auto object-cover"
        @error="imgErr = true"
      />
      <!-- Overlay de controles -->
    </div>
    <div
      class="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 rounded-xl bg-white/90 backdrop-blur px-1.5 py-2 shadow-sm"
    >
      <Button class="w-10 h-8 cursor-pointer" @click="addOne" aria-label="Add 1">+1</Button>

      <div class="text-sm tabular-nums text-center min-w-[2ch]" aria-live="polite">
        {{ qty }}
      </div>

      <Button
        class="w-10 h-8 cursor-pointer"
        @click="removeOne"
        :disabled="qty <= 0"
        aria-label="Remove 1"
        >-1</Button
      >
    </div>
  </div>
</template>
