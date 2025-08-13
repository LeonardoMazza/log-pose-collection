import type { CardPrinting, CardSet } from '@/domain/op-types'

// se quiser, mova pra .env como VITE_CARDS_URL
const SOURCE = 'https://onepiece-cardgame.dev/cards.json'

// helpers pra inferir set/number pelo ID
const SET_FROM_ID = (id: string) => (id.match(/^([A-Z0-9]+)-/)?.[1] ?? '').toUpperCase()
const NUM_FROM_ID = (id: string) => (id.split('-')[1] ?? '').toUpperCase()

// tenta achar um campo de ID “universal”
function pickId(raw: any): string | null {
  const candidates = [raw.id, raw.card_id, raw.cardId, raw.cardCode, raw.numbering, raw.code]
  const id = candidates.find(Boolean)
  return typeof id === 'string' ? id.toUpperCase() : null
}

function toPrinting(raw: any): CardPrinting | null {
  const id = pickId(raw)
  if (!id) return null

  const setCode = (raw.setCode ?? raw.set?.code ?? SET_FROM_ID(id)) as string
  const number = (raw.number ?? raw.cardNumber ?? NUM_FROM_ID(id)) as string
  const name = String(raw.name ?? raw.cardName ?? raw.title ?? '')
  const type = (raw.type ?? raw.cardType ?? 'Character') as CardPrinting['type']
  const colors = (raw.colors ?? (raw.color ? [raw.color] : [])) as CardPrinting['colors']
  const rarity = (raw.rarityShort ?? raw.rarity ?? 'C') as CardPrinting['rarity']
  const cost = raw.cost ?? raw.playCost ?? undefined
  const power = raw.power ?? undefined
  const image =
    raw.image ??
    raw.imageUrl ??
    raw.images?.[0]?.src ??
    raw.card_images?.[0]?.image_url ??
    undefined

  return { id, setCode, number, name, type, colors, rarity, cost, power, image }
}

export async function loadExternalCatalog(): Promise<{
  sets: CardSet[]
  cards: CardPrinting[]
  byId: Record<string, CardPrinting>
}> {
  const res = await fetch(SOURCE, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch cards.json: ${res.status} ${res.statusText}`)
  const json = await res.json()
  const arr: any[] = Array.isArray(json) ? json : (json.cards ?? [])
  const cards = arr.map(toPrinting).filter(Boolean) as CardPrinting[]

  // index + sets
  const byId = Object.fromEntries(cards.map((c) => [c.id, c]))
  const setCodes = Array.from(new Set(cards.map((c) => c.setCode))).sort()
  const sets: CardSet[] = setCodes.map((code) => ({
    code,
    name: code, // se quiser, pode mapear nomes “bonitos” depois
    total: cards.filter((c) => c.setCode === code).length,
  }))

  return { sets, cards, byId }
}
