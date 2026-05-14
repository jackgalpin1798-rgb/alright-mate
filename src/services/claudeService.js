import { getMemory, setMemory, pushToVocabularyQueue } from '../lib/memory'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const HISTORY_WINDOW = 14

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
      max_tokens: 200,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: history.slice(-HISTORY_WINDOW),
    }),
  })
  if (!res.ok) throw new Error(`Claude API ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

export async function getHintExplanation(text, characterName) {
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: `${characterName} just said: "${text}"\n\nIn plain English, explain any British slang, idioms, or cultural references in 1-2 short sentences. If it's straightforward standard English, say "Plain English — nothing tricky here."` }],
    }),
  })
  if (!res.ok) throw new Error('Hint error')
  const data = await res.json()
  return data.content[0].text
}

export async function scoreConversation(scene, history, playerProfile) {
  const transcript = history
    .map(m => `${m.role === 'user' ? playerProfile?.name ?? 'Player' : scene.character.name}: ${m.content}`)
    .join('\n')

  const system = `You are a British English coach. Analyse this learner's conversation performance.

Return ONLY valid JSON in this exact shape (no markdown, no extra text):
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "xpEarned": <number 10-60>,
  "survived": <true/false>,
  "naturalTips": [
    "<Specific tip on how to SOUND more natural. Start with what they actually said or could say, then show the natural British version. Example: Instead of saying thank you every time, try cheers — it sounds far more local.>",
    "<Another specific naturalness tip about rhythm, word choice, or register>"
  ],
  "newSlang": [{ "phrase": "<British slang term>", "meaning": "<brief meaning>" }],
  "mistakes": [
    { "said": "<what they said>", "better": "<more natural British version>", "note": "<brief friendly note>" }
  ],
  "debrief": "<2-3 sentences in British English. Reference a specific moment. Encouraging.>",
  "billyComment": "<1 sentence as Billy — Cockney, warm, funny>"
}`

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: { ...HEADERS, 'anthropic-beta': 'prompt-caching-2024-07-31' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 900,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `Scene: ${scene.name}\nLocation: ${scene.subtitle}\nPlayer origin: ${playerProfile?.origin || 'unknown'}\nDifficulty: ${playerProfile?.difficulty || 'medium'}\n\nTranscript:\n${transcript}` }],
    }),
  })
  if (!res.ok) throw new Error(`Scoring error ${res.status}`)
  const data = await res.json()
  try {
    const text = data.content[0].text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return JSON.parse(jsonMatch ? jsonMatch[0] : text)
  } catch {
    return {
      score: 65, grade: 'C', xpEarned: 25, survived: true,
      naturalTips: ["Try saying 'cheers' instead of 'thank you' — it sounds far more local.", "Add 'innit?' at the end of a statement to sound more East End."],
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
  "memory": "<1-3 sentences. Personal facts the user volunteered: where they're from, why in England, interests. NOT language errors. Write as briefing for ${characterName} before next meeting. Empty string if nothing personal revealed.>",
  "phrases": [
    { "phrase": "<British slang expression>", "meaning": "<brief meaning>" }
  ]
}

Memory rules: only facts the USER volunteered. Merge with existing memory.
Phrase rules: 2-4 British slang terms used. Skip generic English. Prioritise Cockney, idioms.`

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
      if (Array.isArray(parsed.phrases) && parsed.phrases.length > 0) pushToVocabularyQueue(parsed.phrases)
    })
    .catch(() => {})
}
