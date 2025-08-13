import type { CardSet, CardPrinting } from '@/domain/op-types'

const sets: CardSet[] = [
  { code: 'OP01', name: 'Romance Dawn', total: 3 },
  { code: 'ST01', name: 'Straw Hat Crew', total: 1 },
  { code: 'OP02', name: 'Paramount War', total: 1 },
  { code: 'OP03', name: 'Drum Island', total: 1 },
]

const cards: CardPrinting[] = [
  {
    id: 'OP01-001',
    setCode: 'OP01',
    number: '001',
    name: 'Roronoa Zoro',
    type: 'Leader',
    colors: ['Red'],
    rarity: 'L',
    power: 5000,
    image: 'https://deckbuilder.egmanevents.com/card_images/optcg/OP01-001.webp',
  },
  {
    id: 'ST01-005',
    setCode: 'ST01',
    number: '005',
    name: 'Jinbe',
    type: 'Character',
    colors: ['Red'],
    rarity: 'C',
    power: 5000,
    image: 'https://deckbuilder.egmanevents.com/card_images/optcg/ST01-005.webp',
  },
  {
    id: 'OP01-002',
    setCode: 'OP01',
    number: '002',
    name: 'Trafalgar Law',
    type: 'Leader',
    colors: ['Red', 'Green'],
    rarity: 'L',
    power: 5000,
    image: 'https://deckbuilder.egmanevents.com/card_images/optcg/OP01-002.webp',
  },
  {
    id: 'OP01-003',
    setCode: 'OP01',
    number: '003',
    name: 'Monkey D. Luffy',
    type: 'Event',
    colors: ['Red', 'Green'],
    rarity: 'L',
    image: 'https://deckbuilder.egmanevents.com/card_images/optcg/OP01-003.webp',
  },
  // Leader (Green) — para testar restrição de cor no deck
  {
    id: 'OP02-001',
    setCode: 'OP02',
    number: '001',
    name: 'Edward Newgate',
    type: 'Leader',
    colors: ['Red'],
    rarity: 'L',
    power: 5000,
    image: 'https://deckbuilder.egmanevents.com/card_images/optcg/OP02-001.webp',
  },
  {
    id: 'OP03-046',
    setCode: 'OP03',
    number: '046',
    name: 'Genzo',
    type: 'Character',
    colors: ['Blue'],
    rarity: 'R',
    power: 4000,
    image: 'https://deckbuilder.egmanevents.com/card_images/optcg/OP03-046.webp',
  },
  {
    id: 'OP03-047',
    setCode: 'OP03',
    number: '047',
    name: 'Zeff',
    type: 'Character',
    colors: ['Blue'],
    rarity: 'R',
    power: 4000,
    image: 'https://deckbuilder.egmanevents.com/card_images/optcg/OP03-047.webp',
  },
]

const byId: Record<string, CardPrinting> = Object.fromEntries(cards.map((c) => [c.id, c]))

export async function loadSampleCatalog() {
  // latência fake só pra simular carregamento
  await new Promise((r) => setTimeout(r, 120))
  return { sets, cards, byId }
}
