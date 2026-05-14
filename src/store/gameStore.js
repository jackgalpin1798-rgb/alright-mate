import { useState, useCallback } from 'react'

export const LEVELS = [
  { name: 'Holidaymaker',   minXP: 0,    maxXP: 100  },
  { name: 'Day Tripper',    minXP: 100,  maxXP: 250  },
  { name: 'Regular',        minXP: 250,  maxXP: 500  },
  { name: 'Local',          minXP: 500,  maxXP: 900  },
  { name: 'Proper British', minXP: 900,  maxXP: 9999 },
]

const SAVE_KEY = 'alright_mate_save'
const PROFILE_KEY = 'alright_mate_profile'

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function save(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)) } catch {}
}

export function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return { ...LEVELS[i], index: i }
  }
  return { ...LEVELS[0], index: 0 }
}

export function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveProfile(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)) } catch {}
}

export function useGameStore() {
  const saved = load()
  const [xp, setXP] = useState(saved?.xp ?? 0)
  const [streak, setStreak] = useState(saved?.streak ?? 0)
  const [lastPlayed, setLastPlayed] = useState(saved?.lastPlayed ?? null)
  const [unlockedScenes, setUnlockedScenes] = useState(saved?.unlockedScenes ?? ['heathrow_arrivals'])
  const [streakShields, setStreakShields] = useState(saved?.streakShields ?? 0)
  const [slangBank, setSlangBank] = useState(saved?.slangBank ?? [])

  const persist = useCallback((updates) => {
    const next = { xp, streak, lastPlayed, unlockedScenes, streakShields, slangBank, ...updates }
    save(next)
  }, [xp, streak, lastPlayed, unlockedScenes, streakShields, slangBank])

  const addXP = useCallback((amount) => {
    setXP(prev => {
      const next = prev + amount
      persist({ xp: next })
      return next
    })
  }, [persist])

  const addToSlangBank = useCallback((phrases) => {
    setSlangBank(prev => {
      const seen = new Set(prev.map(p => p.phrase.toLowerCase()))
      const novel = phrases.filter(p => !seen.has(p.phrase.toLowerCase()))
      const next = [...prev, ...novel].slice(-50)
      persist({ slangBank: next })
      return next
    })
  }, [persist])

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString()
    if (lastPlayed === today) return streak

    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString()

    let newStreak, newShields = streakShields

    if (lastPlayed === yesterday) {
      newStreak = streak + 1
      if (newStreak % 7 === 0) newShields = Math.min(newShields + 1, 2)
    } else if (streakShields > 0 && lastPlayed === twoDaysAgo) {
      newStreak = streak + 1
      newShields = streakShields - 1
    } else {
      newStreak = 1
    }

    setStreak(newStreak)
    setStreakShields(newShields)
    setLastPlayed(today)
    persist({ streak: newStreak, lastPlayed: today, streakShields: newShields })
    return newStreak
  }, [lastPlayed, streak, streakShields, persist])

  const unlockScene = useCallback((sceneId) => {
    if (!unlockedScenes.includes(sceneId)) {
      const next = [...unlockedScenes, sceneId]
      setUnlockedScenes(next)
      persist({ unlockedScenes: next })
    }
  }, [unlockedScenes, persist])

  return { xp, streak, streakShields, unlockedScenes, slangBank, addXP, updateStreak, unlockScene, addToSlangBank, getLevel }
}
