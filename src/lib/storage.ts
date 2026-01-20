export type Confession = {
  id: string
  content: string
  createdAt: number
  tags: string[]
  reactions: Record<string, number>
  comments: { id: string; content: string; createdAt: number }[]
  status: 'pending' | 'approved' | 'rejected'
}

const CONFESSIONS_KEY = 'sm_confessions_v1'
const HABITS_KEY = 'sm_habits_v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function listConfessions(includePending = false): Confession[] {
  const all = read<Confession[]>(CONFESSIONS_KEY, [])
  return (includePending ? all : all.filter(c => c.status === 'approved')).sort((a,b)=> b.createdAt - a.createdAt)
}

export function getConfession(id: string): Confession | undefined {
  return listConfessions(true).find(c => c.id === id)
}

export function addConfession(content: string, tags: string[] = []): Confession {
  const all = read<Confession[]>(CONFESSIONS_KEY, [])
  const newItem: Confession = {
    id: crypto.randomUUID(),
    content,
    createdAt: Date.now(),
    tags,
    reactions: {},
    comments: [],
    status: 'pending',
  }
  all.push(newItem)
  write(CONFESSIONS_KEY, all)
  return newItem
}

export function reactToConfession(id: string, emoji: string) {
  const all = read<Confession[]>(CONFESSIONS_KEY, [])
  const c = all.find(x => x.id === id)
  if (!c) return
  c.reactions[emoji] = (c.reactions[emoji] ?? 0) + 1
  write(CONFESSIONS_KEY, all)
}

export function addComment(id: string, content: string) {
  const all = read<Confession[]>(CONFESSIONS_KEY, [])
  const c = all.find(x => x.id === id)
  if (!c) return
  c.comments.push({ id: crypto.randomUUID(), content, createdAt: Date.now() })
  write(CONFESSIONS_KEY, all)
}

export function moderateConfession(id: string, status: Confession['status']) {
  const all = read<Confession[]>(CONFESSIONS_KEY, [])
  const c = all.find(x => x.id === id)
  if (!c) return
  c.status = status
  write(CONFESSIONS_KEY, all)
}

export type Habit = { id: string; title: string; streak: number; lastDone?: string }

export function listHabits(): Habit[] {
  return read<Habit[]>(HABITS_KEY, [])
}

export function addHabit(title: string): Habit {
  const items = listHabits()
  const h: Habit = { id: crypto.randomUUID(), title, streak: 0 }
  items.push(h)
  write(HABITS_KEY, items)
  return h
}

export function tickHabit(id: string) {
  const items = listHabits()
  const h = items.find(x => x.id === id)
  if (!h) return
  const today = new Date().toISOString().slice(0,10)
  if (h.lastDone !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10)
    h.streak = h.lastDone === yesterday ? h.streak + 1 : 1
    h.lastDone = today
    write(HABITS_KEY, items)
  }
}

export function deleteHabit(id: string) {
  const items = listHabits()
  const filtered = items.filter(x => x.id !== id)
  write(HABITS_KEY, filtered)
}



