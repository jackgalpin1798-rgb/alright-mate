import { getMemory, setMemory, pushToVocabularyQueue } from '../lib/memory'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const HISTORY_WINDOW = 12

const HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
}

export async function getCharacterReply(systemPrompt, history) {
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: { ...HEADERS, 'anthropic-beta': 'prompt-caching-2024-07-31' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 180,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: history.slice(-HISTORY_WINDOW),
    }),
  })
  if (!res.ok) throw new Error(`Claude API ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

export async function scoreConversation(scene, history, playerProfile) {
  const transcript = history
    .map(m => `${m.role === 'user' ? playerProfile?.name ?? 'Player' : scene.character.name}: ${m.content}`)
    .join('\n')

  const system = `You are a friendly British English coach. Analyse the learner's performance in this British slang conversation.

Return ONLY valid JSON in this exact shape:
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "xpEarned": <number 10-60>,
  "survived": <true/false>,
  "highlights": ["<one thing done well>", "<another positive>"],
  "newSlang": [{ "phrase": "<British slang term used or heard>", "meaning": "<brief meaning>" }],
  "mistakes": [
    { "said": "<what they said>", "better": "<more natural British way>", "note": "<brief friendly explanation>" }
  ],
  "debrief": "<2-3 sentence warm summary in British English. Mention one specific slang term they should remember. End with encouragement.>",
  "billyComment": "<1 sentence as Billy reacting to how they got on — Cockney, funny, warm>"
}`

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: { ...HEADERS, 'anthropic-beta': 'prompt-caching-2024-07-31' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `Scene: ${scene.name}\nLocation: ${scene.subtitle}\n\nTranscript:\n${transcript}` }],
    }),
  })
  if (!res.ok) throw new Error(`Scoring error ${res.status}`)
  const data = await res.json()
  try {
    return JSON.parse(data.content[0].text)
  } catch {
    return {
      score: 65, grade: 'C', xpEarned: 25, survived: true,
      highlights: ["You gave it a proper go!"],
      newSlang: [],
      mistakes: [],
      debrief: "Not bad at all! Keep at it and you'll be sounding like a local before long, love.",
      billyComment: "Oi, not bad for a foreigner! Stick with me and you'll be sorted in no time.",
    }
  }
}

export function summarizeMemory(characterName, history, playerProfile) {
  const existing = getMemory(characterName)
  const transcript = history
    .map(m => `${m.role === 'user' ? playerProfile?.name ?? 'Player' : characterName}: ${m.content}`)
    .join('\n')

  const system = `Extract relationship memory and British slang vocabulary from this conversation.

Return ONLY valid JSON:
{
  "memory": "<1-3 sentences. Personal facts the user revealed: where they're from, why they're in England, interests, things they said about themselves. NOT language errors. Write as a briefing for ${characterName} before their next meeting. Empty string if nothing personal was revealed.>",
  "phrases": [
    { "phrase": "<British slang expression>", "meaning": "<brief meaning>" }
  ]
}

Memory rules: only facts the USER volunteered. Merge with existing memory.
Phrase rules: 2-4 British slang terms used in the conversation. Skip generic English (thanks, hello). Prioritise Cockney, regional slang, idioms.`

  fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: `Existing memory: "${existing}"\n\nConversation:\n${transcript}` }],
    }),
  })
    .then(r => r.json())
    .then(data => {
      const parsed = JSON.parse(data.content[0].text)
      if (parsed.memory) setMemory(characterName, parsed.memory)
      if (Array.isArray(parsed.phrases) && parsed.phrases.length > 0) {
        pushToVocabularyQueue(parsed.phrases)
      }
    })
    .catch(() => {})
}
