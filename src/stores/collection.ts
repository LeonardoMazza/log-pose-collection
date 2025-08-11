import { defineStore } from 'pinia'

const LS_KEY = 'opc:collection'

export const useCollectionStore = defineStore('collection', {
  state: () => ({
    entries: {} as Record<string, number>, // printingId -> qty
  }),
  getters: {
    totalCards: (s) => Object.values(s.entries).reduce((a, b) => a + b, 0),
    uniqueCards: (s) => Object.keys(s.entries).length,
  },
  actions: {
    init() {
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (raw) this.entries = JSON.parse(raw)
      } catch {}
    },
    save() {
      localStorage.setItem(LS_KEY, JSON.stringify(this.entries))
    },
    add(id: string, n = 1) {
      this.entries[id] = (this.entries[id] ?? 0) + n
      this.save()
    },
    setQty(id: string, qty: number) {
      this.entries[id] = Math.max(0, Math.floor(qty))
      if (this.entries[id] === 0) delete this.entries[id]
      this.save()
    },
    remove(id: string, n = 1) {
      this.entries[id] = Math.max(0, (this.entries[id] ?? 0) - n)
      if (this.entries[id] === 0) delete this.entries[id]
      this.save()
    },
  },
})
