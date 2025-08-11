import type { CardSet, CardPrinting } from '@/domain/op-types'

const sets: CardSet[] = [{ code: 'OP01', name: 'Romance Dawn', total: 3 }]

const cards: CardPrinting[] = [
  {
    id: 'OP01-001',
    setCode: 'OP01',
    number: '001',
    name: 'Monkey.D.Luffy',
    type: 'Leader',
    colors: ['Red'],
    rarity: 'L',
  },
  {
    id: 'OP01-002',
    setCode: 'OP01',
    number: '002',
    name: 'Chopper',
    type: 'Character',
    colors: ['Red'],
    rarity: 'C',
    cost: 1,
    power: 1000,
  },
  {
    id: 'OP01-003',
    setCode: 'OP01',
    number: '003',
    name: 'Gum-Gum Pistol',
    type: 'Event',
    colors: ['Red'],
    rarity: 'UC',
    cost: 2,
  },
]

export async function fetchSets(): Promise<CardSet[]> {
  await new Promise((r) => setTimeout(r, 150))
  return sets
}
export async function fetchCards(): Promise<CardPrinting[]> {
  await new Promise((r) => setTimeout(r, 150))
  return cards
}
