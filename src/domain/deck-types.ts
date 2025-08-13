export interface Deck {
  id: string
  name: string
  leaderId: string | null
  main: Record<string, number> // printingId -> qty (não inclui líder)
  updatedAt: number
}

export interface DeckValidation {
  errors: string[]
  warnings: string[]
  totalMain: number
}
