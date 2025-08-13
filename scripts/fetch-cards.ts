// scripts/fetch-cards.ts
// run: pnpm dlx tsx scripts/fetch-cards.ts
// opcional: CARDS_SRC para trocar a URL (ex.: proxy do Vite)
//   Windows PowerShell:  $env:CARDS_SRC='http://127.0.0.1:5173/dotgg/cgfw/getcards?game=onepiece&mode=indexed'
//   bash:                CARDS_SRC='http://127.0.0.1:5173/dotgg/cgfw/getcards?game=onepiece&mode=indexed' pnpm dlx tsx scripts/fetch-cards.ts

import fs from 'node:fs'
import path from 'node:path'

// -------- Config --------
const SOURCE =
  process.env.CARDS_SRC || 'https://api.dotgg.gg/cgfw/getcards?game=onepiece&mode=indexed'
const OUT_PATH = path.join('public', 'cards.min.json')

// -------- Tipos do app --------
type Color = 'Red' | 'Green' | 'Blue' | 'Purple' | 'Black' | 'Yellow' | 'Multi'
type CardType = 'Leader' | 'Character' | 'Event' | 'Stage' | 'Don'
type Rarity = 'C' | 'UC' | 'R' | 'SR' | 'SEC' | 'L' | 'P' | 'ALT'

type Printing = {
  id: string
  setCode: string
  number: string
  name: string
  type: CardType
  colors: Color[]
  rarity: Rarity
  cost?: number
  power?: number
  image?: string
}

type CardSet = { code: string; name: string; releaseDate?: string; total: number }

// -------- Helpers --------
const ID_RE = /([A-Z]{2,}\d{2,}-\d{3}[A-Z]?)/ // OP01-001, ST23-001, PRB02-003…

const SET_FROM_ID = (id: string) => (id.match(/^([A-Z0-9]+)-/)?.[1] ?? '').toUpperCase()
const NUM_FROM_ID = (id: string) => (id.split('-')[1] ?? '').toUpperCase()

const TYPE_MAP_NUM: Record<string, CardType> = {
  '1': 'Leader',
  '2': 'Character',
  '3': 'Event',
  '4': 'Stage',
  '5': 'Don',
}
const TYPE_MAP_STR: Record<string, CardType> = {
  leader: 'Leader',
  character: 'Character',
  event: 'Event',
  stage: 'Stage',
  don: 'Don',
}

// mapeamento de cores abrangente (numérico, abreviações e nomes)
const COLOR_MAP: Record<string, Color> = {
  '1': 'Red',
  '2': 'Green',
  '3': 'Blue',
  '4': 'Purple',
  '5': 'Black',
  '6': 'Yellow',
  red: 'Red',
  r: 'Red',
  green: 'Green',
  g: 'Green',
  blue: 'Blue',
  b: 'Blue',
  purple: 'Purple',
  p: 'Purple',
  black: 'Black',
  blk: 'Black',
  bk: 'Black',
  yellow: 'Yellow',
  y: 'Yellow',
}

const RARITY_MAP: Record<string, Rarity> = {
  '1': 'C',
  '2': 'UC',
  '3': 'R',
  '4': 'SR',
  '5': 'SEC',
  '6': 'L',
  '7': 'P',
  '8': 'ALT',
  c: 'C',
  common: 'C',
  uc: 'UC',
  uncommon: 'UC',
  r: 'R',
  rare: 'R',
  sr: 'SR',
  'super rare': 'SR',
  sec: 'SEC',
  'secret rare': 'SEC',
  l: 'L',
  leader: 'L',
  p: 'P',
  promo: 'P',
  alt: 'ALT',
  'alternate art': 'ALT',
  aa: 'ALT',
}

function findKey<T = any>(obj: any, candidates: string[]): T | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  const keys = Object.keys(obj)
  for (const want of candidates) {
    const norm = want.toLowerCase().replace(/[\s_-]+/g, '')
    const k = keys.find((kk) => kk.toLowerCase().replace(/[\s_-]+/g, '') === norm)
    if (k) return obj[k] as T
  }
  return undefined
}

function findId(raw: any): string | null {
  const known = [
    raw.id,
    raw.cid,
    raw.code,
    raw.cardCode,
    raw.card_id,
    raw.cardId,
    raw.number,
    raw.cardNumber,
  ]
  for (const v of known) {
    if (typeof v === 'string') {
      const m = v.toUpperCase().replace(/^#/, '').match(ID_RE)
      if (m) return m[1]
    }
  }
  for (const v of Object.values(raw)) {
    if (typeof v === 'string') {
      const m = v.toUpperCase().match(ID_RE)
      if (m) return m[1]
    }
  }
  return null
}

// tenta achar nome em várias estruturas, com preferência para inglês; fallback: usa o ID
function findName(raw: any): string | null {
  const direct = findKey<string>(raw, [
    'name',
    'cardname',
    'title',
    'name_en',
    'en_name',
    'nameEnglish',
    'englishName',
    'nameUS',
    'name_en_us',
  ])
  if (direct && String(direct).trim()) return String(direct).trim()

  const namesObj = findKey<any>(raw, ['names', 'localizedNames', 'localization', 'i18n'])
  if (namesObj && typeof namesObj === 'object') {
    const pick =
      namesObj.en ||
      namesObj.EN ||
      namesObj['en-US'] ||
      namesObj['en_us'] ||
      namesObj.english ||
      namesObj.us ||
      Object.values(namesObj).find((x: any) => typeof x === 'string')
    if (pick && String(pick).trim()) return String(pick).trim()
  }

  if (typeof raw.n === 'string' && raw.n.trim()) return raw.n.trim()
  return null
}

function normType(x: any): CardType {
  if (x == null) return 'Character'
  const s = String(x).trim().toLowerCase()
  if (TYPE_MAP_NUM[s]) return TYPE_MAP_NUM[s]
  return TYPE_MAP_STR[s] ?? 'Character'
}

function parseColors(input: unknown): Color[] {
  if (input == null) return []
  const arr = Array.isArray(input) ? (input as any[]) : [input]
  const flat = arr.flatMap((v) => {
    if (Array.isArray(v)) return v
    const s = String(v)
    if (s.includes(',') || s.includes(' ')) return s.split(/[,\s]+/).filter(Boolean)
    if (/^\d+$/.test(s) && s.length > 1) return s.split('') // "13" -> ["1","3"]
    return [s]
  })
  const mapped = [
    ...new Set(flat.map((x) => COLOR_MAP[String(x).toLowerCase()]).filter(Boolean)),
  ] as Color[]
  return mapped
}

function normRarity(x: any): Rarity {
  if (x == null) return 'C'
  const s = String(x).trim().toLowerCase()
  return RARITY_MAP[s] ?? RARITY_MAP[s.toUpperCase()] ?? 'C'
}

function firstImage(raw: any): string | undefined {
  const direct = findKey<string>(raw, ['image', 'imageurl', 'image_url', 'img', 'art'])
  if (direct) return String(direct)
  const images = (raw.images ?? raw.card_images ?? raw.assets?.images) as any[] | undefined
  if (Array.isArray(images) && images.length) {
    const k = findKey<string>(images[0], ['url', 'src', 'image_url'])
    if (k) return String(k)
  }
  return undefined
}

function toPrinting(raw: any): Printing | null {
  const id = findId(raw)
  if (!id) return null

  const setCode = (findKey<string>(raw, ['set', 'setcode']) || SET_FROM_ID(id)).toUpperCase()
  const number = (findKey<string>(raw, ['number', 'cardnumber']) || NUM_FROM_ID(id)).toUpperCase()

  const foundName = findName(raw)
  const name = foundName && foundName.trim() ? foundName.trim() : id // fallback ao ID
  const type = normType(findKey(raw, ['type', 'cardtype', 't']))

  const colors = parseColors(findKey(raw, ['colors', 'color', 'primarycolor', 'col']))
  const rarity = normRarity(findKey(raw, ['rarity', 'rarityshort', 'r']))

  const costRaw = findKey<any>(raw, ['cost', 'playcost', 'cs', 'costlife'])
  const powerRaw = findKey<any>(raw, ['power', 'p'])
  const cost = Number.isFinite(Number(costRaw)) ? Number(costRaw) : undefined
  const power = Number.isFinite(Number(powerRaw)) ? Number(powerRaw) : undefined

  const image = firstImage(raw)

  return { id, setCode, number, name, type, colors, rarity, cost, power, image }
}

// Tenta extrair array de cards de qualquer shape da DotGG
function extractArray(json: any): any[] {
  if (!json) return []
  if (Array.isArray(json)) return json
  if (Array.isArray(json.data)) return json.data
  if (json.data && Array.isArray(json.data.cards)) return json.data.cards
  if (Array.isArray(json.cards)) return json.cards
  const values = Object.values(json)
  if (values.length && values.every((v) => typeof v === 'object')) return values as any[]
  return []
}

async function fetchJSON(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: '*/*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      Referer: 'https://dotgg.gg/',
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Not JSON. First 120 chars: ${text.slice(0, 120)}`)
  }
}

// -------- Execução --------
async function main() {
  console.log(`[cards] source: ${SOURCE}`)
  const json = await fetchJSON(SOURCE)
  const arr = extractArray(json)
  console.log(`[cards] raw entries: ${arr.length}`)

  const cards = arr.map(toPrinting).filter(Boolean) as Printing[]
  console.log(`[cards] mapped entries: ${cards.length}`)

  if (cards.length === 0) {
    // diagnóstico (amostra de 100)
    let ids = 0,
      names = 0
    for (const raw of arr.slice(0, 100)) {
      if (findId(raw)) ids++
      if (findName(raw)) names++
    }
    console.warn(`[debug] sample(100): idFound=${ids}, nameFound=${names}`)
  }

  cards.sort((a, b) => a.id.localeCompare(b.id))
  const byId = Object.fromEntries(cards.map((c) => [c.id, c]))

  // Agrupar sets por setCode (tenta achar name/releaseDate do próprio item)
  const setGroups = new Map<string, { name?: string; releaseDate?: string; total: number }>()
  for (const raw of arr) {
    const id = findId(raw)
    if (!id) continue
    const code = SET_FROM_ID(id)
    const cur = setGroups.get(code) || { name: undefined, releaseDate: undefined, total: 0 }
    cur.total += 1
    const possibleName = findKey<string>(raw, ['setname', 'set', 'srcn']) || undefined
    const possibleDate = findKey<string>(raw, ['releasedate', 'srcd']) || undefined
    if (!cur.name && possibleName) cur.name = possibleName.replace(/\s*\[[^\]]+\]\s*$/, '').trim()
    if (!cur.releaseDate && possibleDate) cur.releaseDate = possibleDate
    setGroups.set(code, cur)
  }
  const sets: CardSet[] = Array.from(setGroups.entries())
    .map(([code, v]) => ({
      code,
      name: v.name || code,
      releaseDate: v.releaseDate,
      total: v.total,
    }))
    .sort((a, b) => a.code.localeCompare(b.code))

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify({
      sets,
      cards,
      byId,
      source: SOURCE,
      generatedAt: new Date().toISOString(),
    }),
  )
  console.log(`[cards] wrote ${cards.length} cards, ${sets.length} sets -> ${OUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
