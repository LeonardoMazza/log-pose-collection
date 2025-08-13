// Formato: "1xOP09-001" (aceita espaços opcionais e maiúsc/minúsc)
const LINE_RE = /^\s*(\d+)\s*x\s*([A-Za-z0-9-]+)\s*$/i

export function parseDecklist(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const map: Record<string, number> = {}
  for (const line of lines) {
    const m = line.match(LINE_RE)
    if (!m) continue
    const qty = Math.max(0, parseInt(m[1], 10) || 0)
    const id = m[2].toUpperCase()
    if (qty > 0) map[id] = (map[id] ?? 0) + qty
  }
  return map
}

// Exporta: líder primeiro (se fornecido), depois cartas ordenadas por id
export function printDecklist(main: Record<string, number>, leaderId?: string | null) {
  const parts: string[] = []
  if (leaderId) parts.push(`1x${leaderId}`)
  const ids = Object.keys(main).sort()
  for (const id of ids) {
    const qty = main[id]
    if (qty > 0) parts.push(`${qty}x${id}`)
  }
  return parts.join('\n')
}

type FindCardFn = (id: string) => { type?: string } | undefined

export function detectLeaderFromMap(map: Record<string, number>, findCard: FindCardFn) {
  const warnings: string[] = []
  const leaders = Object.keys(map).filter((id) => findCard(id)?.type === 'Leader')

  let leaderId: string | null = null
  if (leaders.length > 0) {
    leaderId = leaders[0] // pega o primeiro encontrado
    if (map[leaderId] !== 1) {
      warnings.push(`Leader ${leaderId} with qty ${map[leaderId]} — using 1 and ignoring the rest.`)
    }
  }

  // monta o "main" sem o líder
  const main: Record<string, number> = {}
  for (const [id, qty] of Object.entries(map)) {
    if (id === leaderId) continue
    main[id] = qty
  }

  // se houver mais de um líder listado, avisa
  if (leaders.length > 1) {
    warnings.push(`Multiple Leaders detected: ${leaders.join(', ')}. Using ${leaderId}.`)
  }

  return { leaderId, main, warnings }
}
