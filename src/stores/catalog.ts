import { defineStore } from 'pinia'
import type { CardSet, CardPrinting } from '@/domain/op-types'
import { loadSampleCatalog } from '@/services/catalog-sample' // ⬅️ troque aqui

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    sets: [] as CardSet[],
    cards: [] as CardPrinting[],
    byId: {} as Record<string, CardPrinting>,
    loaded: false,
  }),
  actions: {
    async load() {
      if (this.loaded) return
      const { sets, cards, byId } = await loadSampleCatalog() // ⬅️ e aqui
      this.sets = sets
      this.cards = cards
      this.byId = byId
      this.loaded = true
    },
  },
})
