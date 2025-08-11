// guarda "usuários" e "sessão" no localStorage – só para desenvolvimento
type User = { id: string; name: string; email: string }
type UserDb = Record<string, User & { password: string }>

const USERS_KEY = 'mock:users'
const SESSION_KEY = 'mock:session'

function loadDb(): UserDb {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}
function saveDb(db: UserDb) {
  localStorage.setItem(USERS_KEY, JSON.stringify(db))
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as {
      token: string
      user: User
    } | null
  } catch {
    return null
  }
}
function setSession(session: { token: string; user: User } | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

export async function register(payload: { name: string; email: string; password: string }) {
  await new Promise((r) => setTimeout(r, 350)) // latência fake
  const db = loadDb()
  const email = payload.email.toLowerCase().trim()
  if (db[email]) throw new Error('Email already registered')
  const user: User = { id: crypto.randomUUID(), name: payload.name.trim(), email }
  db[email] = { ...user, password: payload.password }
  saveDb(db)
  const token = `mock.${btoa(JSON.stringify({ sub: user.id, email }))}`
  setSession({ token, user })
  return { token, user }
}

export async function login(payload: { email: string; password: string }) {
  await new Promise((r) => setTimeout(r, 300))
  const db = loadDb()
  const email = payload.email.toLowerCase().trim()
  const row = db[email]
  if (!row || row.password !== payload.password) throw new Error('Invalid credentials')
  const user: User = { id: row.id, name: row.name, email }
  const token = `mock.${btoa(JSON.stringify({ sub: user.id, email }))}`
  setSession({ token, user })
  return { token, user }
}

export function logout() {
  setSession(null)
}
