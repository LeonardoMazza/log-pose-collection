import { defineStore } from 'pinia'
import type { Deck, DeckValidation } from '@/domain/deck-types'
import { useCatalogStore } from '@/stores/catalog'
import { useCollectionStore } from '@/stores/collection'
import type { Color } from '@/domain/op-types'

const LS_KEY = 'opc:decks'

function uid() {
  return crypto.randomUUID()
}

function loadAll(): Record<string, Deck> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    return {}
  }
}
function saveAll(db: Record<string, Deck>) {
  localStorage.setItem(LS_KEY, JSON.stringify(db))
}

function colorCompatible(leaderColors: Color[], cardColors: Color[]) {
  if (!leaderColors?.length) return false
  // compatível se houver interseção entre as cores
  return cardColors.some((c) => leaderColors.includes(c))
}

export const useDecksStore = defineStore('decks', {
  state: () => ({
    byId: loadAll() as Record<string, Deck>,
    currentId: '' as string,
  }),
  getters: {
    all: (s) => Object.values(s.byId).sort((a, b) => b.updatedAt - a.updatedAt),
    current: (s) => (s.currentId ? s.byId[s.currentId] : null),
  },
  actions: {
    create(name = 'New Deck') {
      const id = uid()
      const deck: Deck = { id, name, leaderId: null, main: {}, updatedAt: Date.now() }
      this.byId[id] = deck
      saveAll(this.byId)
      this.currentId = id
      return deck
    },
    remove(id: string) {
      delete this.byId[id]
      if (this.currentId === id) this.currentId = ''
      saveAll(this.byId)
    },
    rename(id: string, name: string) {
      const d = this.byId[id]
      if (!d) return
      d.name = name.trim() || d.name
      d.updatedAt = Date.now()
      saveAll(this.byId)
    },
    setLeader(id: string, leaderId: string | null) {
      const d = this.byId[id]
      if (!d) return
      d.leaderId = leaderId
      d.updatedAt = Date.now()
      // opcional: remover do main cartas que não respeitam a cor do líder
      saveAll(this.byId)
    },
    addCard(id: string, printingId: string, qty = 1) {
      const d = this.byId[id]
      if (!d) return
      d.main[printingId] = Math.min(99, (d.main[printingId] ?? 0) + qty)
      d.updatedAt = Date.now()
      saveAll(this.byId)
    },
    setQty(id: string, printingId: string, qty: number) {
      const d = this.byId[id]
      if (!d) return
      const n = Math.max(0, Math.floor(qty))
      if (n === 0) delete d.main[printingId]
      else d.main[printingId] = n
      d.updatedAt = Date.now()
      saveAll(this.byId)
    },
    clearMain(id: string) {
      const d = this.byId[id]
      if (!d) return
      d.main = {}
      d.updatedAt = Date.now()
      saveAll(this.byId)
    },
    importList(id: string, lines: Record<string, number>) {
      const d = this.byId[id]
      if (!d) return
      d.main = { ...lines } // líder será decidido pela UI usando catálogo
      d.updatedAt = Date.now()
      saveAll(this.byId)
    },
    validate(id: string): DeckValidation {
      const d = this.byId[id]
      if (!d) return { errors: ['Deck not found'], warnings: [], totalMain: 0 }
      const catalog = useCatalogStore()
      const total = Object.values(d.main).reduce((a, b) => a + b, 0)
      const errors: string[] = []
      const warnings: string[] = []

      // líder obrigatório e válido
      if (!d.leaderId) errors.push('Deck must have exactly 1 Leader.')
      const leader = d.leaderId ? catalog.byId[d.leaderId] : null
      if (leader?.type !== 'Leader') errors.push('Selected leader is not a Leader card.')

      // 50 cartas no main
      if (total !== 50)
        errors.push(`Deck must have exactly 50 non-Leader cards (current: ${total}).`)

      // cores compatíveis
      const leaderColors = (leader?.colors ?? []) as Color[]
      for (const [pid, qty] of Object.entries(d.main)) {
        if (qty <= 0) continue
        const card = catalog.byId[pid]
        if (!card) {
          warnings.push(`Unknown card ${pid}`)
          continue
        }
        if (card.type === 'Leader') errors.push(`Leader ${pid} cannot be in the 50-card main.`)
        if (!colorCompatible(leaderColors, card.colors as Color[])) {
          errors.push(
            `Color mismatch: ${pid} (${card.colors.join('/')}) not allowed for leader (${leaderColors.join('/')}).`,
          )
        }
      }

      // (opcional) limite 4 cópias — comente se não quiser
      for (const [pid, qty] of Object.entries(d.main)) {
        if (qty > 4) warnings.push(`More than 4 copies of ${pid} (${qty}).`)
      }

      return { errors, warnings, totalMain: total }
    },
  },
})
