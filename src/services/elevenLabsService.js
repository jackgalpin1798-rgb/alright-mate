const EL_API = 'https://api.elevenlabs.io/v1/text-to-speech'
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY

const VOICE_SETTINGS = {
  stability: 0.48,
  similarity_boost: 0.82,
  style: 0.38,
  use_speaker_boost: true,
}

let currentAudio = null
let currentUtterance = null
const prefetchCache = new Map()

function browserSpeak(text, onEnd) {
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-GB'
  u.rate = 0.92
  u.pitch = 1.0
  currentUtterance = u
  u.onend = () => { currentUtterance = null; onEnd?.() }
  u.onerror = () => { currentUtterance = null; onEnd?.() }
  window.speechSynthesis.speak(u)
}

async function elFetch(voiceId, text) {
  return fetch(`${EL_API}/${voiceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': API_KEY },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: VOICE_SETTINGS }),
  })
}

function playUrl(url, onStart, onEnd, text) {
  const audio = new Audio(url)
  currentAudio = audio
  audio.onplay = () => onStart?.()
  audio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; onEnd?.() }
  audio.onerror = () => { URL.revokeObjectURL(url); currentAudio = null; browserSpeak(text, onEnd) }
  audio.play().catch(() => { URL.revokeObjectURL(url); currentAudio = null; browserSpeak(text, onEnd) })
}

export async function prefetchAudio(text, voiceId) {
  if (!API_KEY || !voiceId) return
  const key = `${voiceId}:${text}`
  if (prefetchCache.has(key)) return
  try {
    const res = await elFetch(voiceId, text)
    if (!res.ok) return
    const blob = await res.blob()
    prefetchCache.set(key, URL.createObjectURL(blob))
  } catch {}
}

export async function speak(text, voiceId, onStart, onEnd) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  if (currentUtterance) { window.speechSynthesis.cancel(); currentUtterance = null }

  if (!API_KEY || !voiceId) { browserSpeak(text, onEnd); return }

  const key = `${voiceId}:${text}`
  const cached = prefetchCache.get(key)
  if (cached) {
    prefetchCache.delete(key)
    playUrl(cached, onStart, onEnd, text)
    return
  }

  try {
    let res = await elFetch(voiceId, text)
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 1500))
      res = await elFetch(voiceId, text)
    }
    if (!res.ok) { browserSpeak(text, onEnd); return }
    const blob = await res.blob()
    playUrl(URL.createObjectURL(blob), onStart, onEnd, text)
  } catch {
    browserSpeak(text, onEnd)
  }
}

export function stopSpeaking() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  if (currentUtterance) { window.speechSynthesis.cancel(); currentUtterance = null }
}
