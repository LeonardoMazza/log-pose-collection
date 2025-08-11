import { defineStore } from 'pinia'
import type { CardSet, CardPrinting } from '@/domain/op-types'
import { fetchSets, fetchCards } from '@/services/catalog-fake'

interface CatalogState {
  sets: CardSet[]
  cards: CardPrinting[]
  byId: Record<string, CardPrinting>
  loaded: boolean
}

export const useCatalogStore = defineStore('catalog', {
  state: (): CatalogState => ({ sets: [], cards: [], byId: {}, loaded: false }),
  actions: {
    async load() {
      if (this.loaded) return
      const [s, c] = await Promise.all([fetchSets(), fetchCards()])
      this.sets = s
      this.cards = c
      this.byId = Object.fromEntries(c.map((x) => [x.id, x]))
      this.loaded = true
    },
  },
})
