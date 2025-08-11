export type Color = 'Red' | 'Green' | 'Blue' | 'Purple' | 'Black' | 'Yellow' | 'Multi'
export type CardType = 'Leader' | 'Character' | 'Event' | 'Stage' | 'Don'
export type Rarity = 'C' | 'UC' | 'R' | 'SR' | 'SEC' | 'L' | 'P' | 'ALT'

export interface CardSet {
  code: string // ex.: OP01
  name: string // ex.: Romance Dawn
  releaseDate?: string
  total?: number
}

export interface CardPrinting {
  id: string // ex.: OP01-001
  setCode: string // ex.: OP01
  number: string // ex.: 001
  name: string
  type: CardType
  colors: Color[]
  rarity: Rarity
  cost?: number
  power?: number
  image?: string
}
