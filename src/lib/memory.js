const PREFIX = 'am_memory_'
const VOCAB_KEY = 'am_vocab_queue'
const REPUTATION_KEY = 'am_reputation'
const BILLY_MOOD_KEY = 'am_billy_mood'

// ── Character memory ──────────────────────────────────────────────────────────

export function getMemory(characterName) {
  return localStorage.getItem(PREFIX + characterName) ?? ''
}

export function setMemory(characterName, summary) {
  localStorage.setItem(PREFIX + characterName, summary)
}

// ── Relationship levels ───────────────────────────────────────────────────────

const RELATIONSHIP_KEY = 'am_relationships'

export function getRelationship(characterName) {
  try {
    const all = JSON.parse(localStorage.getItem(RELATIONSHIP_KEY) ?? '{}')
    return all[characterName] ?? { level: 'stranger', interactions: 0 }
  } catch { return { level: 'stranger', interactions: 0 } }
}

export function incrementRelationship(characterName) {
  try {
    const all = JSON.parse(localStorage.getItem(RELATIONSHIP_KEY) ?? '{}')
    const current = all[characterName] ?? { level: 'stranger', interactions: 0 }
    const interactions = current.interactions + 1
    const level =
      interactions >= 12 ? 'best_mate' :
      interactions >= 7  ? 'good_mate' :
      interactions >= 3  ? 'mate'      :
      interactions >= 1  ? 'acquaintance' : 'stranger'
    all[characterName] = { level, interactions }
    localStorage.setItem(RELATIONSHIP_KEY, JSON.stringify(all))
    return { level, interactions }
  } catch { return { level: 'stranger', interactions: 0 } }
}

// ── Billy's mood — changes daily, affects tone ────────────────────────────────

const MOODS = ['good', 'buzzing', 'rough', 'good', 'good']

export function getBillyMood() {
  try {
    const saved = JSON.parse(localStorage.getItem(BILLY_MOOD_KEY) ?? 'null')
    const today = new Date().toDateString()
    if (saved?.date === today) return saved.mood
    const mood = MOODS[Math.floor(Math.random() * MOODS.length)]
    localStorage.setItem(BILLY_MOOD_KEY, JSON.stringify({ date: today, mood }))
    return mood
  } catch { return 'good' }
}

// ── Vocabulary / slang queue ──────────────────────────────────────────────────

export function getVocabularyQueue() {
  try {
    return JSON.parse(localStorage.getItem(VOCAB_KEY) ?? '[]')
  } catch { return [] }
}

export function pushToVocabularyQueue(phrases) {
  const existing = getVocabularyQueue()
  const seen = new Set(existing.map(p => p.phrase.toLowerCase()))
  const novel = phrases.filter(p => !seen.has(p.phrase.toLowerCase()))
  const updated = [...existing, ...novel].slice(-30)
  localStorage.setItem(VOCAB_KEY, JSON.stringify(updated))
}

// ── Reputation per location ───────────────────────────────────────────────────

export function getReputation(locationId) {
  try {
    const all = JSON.parse(localStorage.getItem(REPUTATION_KEY) ?? '{}')
    return all[locationId] ?? 0
  } catch { return 0 }
}

export function addReputation(locationId, amount) {
  try {
    const all = JSON.parse(localStorage.getItem(REPUTATION_KEY) ?? '{}')
    all[locationId] = Math.min(100, (all[locationId] ?? 0) + amount)
    localStorage.setItem(REPUTATION_KEY, JSON.stringify(all))
    return all[locationId]
  } catch { return 0 }
}
