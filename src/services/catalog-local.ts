// src/services/catalog-local.ts
import type { CardPrinting, CardSet } from '@/domain/op-types'
export async function loadLocalCatalog(): Promise<{
  sets: CardSet[]
  cards: CardPrinting[]
  byId: Record<string, CardPrinting>
}> {
  const res = await fetch('/cards.min.json', { cache: 'no-store' })
  if (!res.ok) throw new Error('Missing public/cards.min.json')
  const { sets, cards, byId } = await res.json()
  return { sets, cards, byId }
}
