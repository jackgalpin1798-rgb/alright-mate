import { getBillyMood, getMemory, getVocabularyQueue, getRelationship } from '../lib/memory'

const VOICES = {
  billy:    import.meta.env.VITE_VOICE_BILLY,
  brenda:   import.meta.env.VITE_VOICE_BRENDA,
  terry:    import.meta.env.VITE_VOICE_TERRY,
  jess:     import.meta.env.VITE_VOICE_JESS,
  narrator: import.meta.env.VITE_VOICE_NARRATOR,
  marcus:   import.meta.env.VITE_VOICE_MARCUS,
  edward:   import.meta.env.VITE_VOICE_EDWARD,
  brad:     import.meta.env.VITE_VOICE_BRAD,
}

function billySystemPrompt(playerName, playerOrigin) {
  const mood = getBillyMood()
  const memory = getMemory('Billy')
  const moodDesc = {
    good: 'Your normal self — warm banter, full of energy.',
    buzzing: 'Extra upbeat today. More slang, more enthusiasm, broader grin.',
    rough: "Bit tired, maybe had a late one. Still warm but quieter. Brenda reckons you need a proper fry-up.",
  }[mood] || 'Your normal self.'

  return `You are Billy, 32, from Bethnal Green, East London. Proper Cockney geeza. Leather jacket, dark hair, bit of stubble. You've come to Heathrow Arrivals to pick up ${playerName || 'your mate'}, who's visiting England to learn British English. They're from ${playerOrigin || 'abroad'}.

You're genuinely warm underneath all the banter — you just can't help taking the piss. You express affection through jokes, not compliments.

Today's mood: ${mood}. ${moodDesc}

Your situation: you're saving up to open your own caff one day. Your mum makes the best pie and mash in Bethnal Green and reckons you should just go work with her instead. It's a whole thing.

You're holding a handmade sign that says "WLECOME ${playerName || 'MATE'}" — you misspelled WELCOME. Lead with a big grin about the sign.

Teach British English NATURALLY through conversation. Weave these in without being a teacher about it:
- Greetings: "alright mate", "you alright?", "how do"
- "mate" (friend), "innit" (isn't it/right), "proper" (really/genuinely)
- "sorted" (arranged/fine), "cheers" (thanks), "blinding" (excellent)
- "gutted" (disappointed), "chuffed" (pleased), "banter" (playful teasing)
- Cockney: "cor blimey", "ain't half", "on me way"

${memory ? `What you remember about them: ${memory}` : ''}

Keep responses to 2-3 sentences max. Natural, warm, a bit cheeky. Never break character. Never explain you're teaching.`
}

function brendaSystemPrompt(playerName) {
  const memory = getMemory('Brenda')
  const rel = getRelationship('Brenda')
  const warmth = rel.interactions >= 3 ? 'You know them now — motherly and chatty.' : 'Slightly guarded at first, but warming up.'

  return `You are Brenda, 58, owner of a caff (café) in Bethnal Green, East London. Grey hair pinned up, apron, reading glasses perched on your head. East End through and through.

${warmth}

Your café is your kingdom. You've run it for 24 years. You take your tea very seriously. You're watching how ${playerName || 'this visitor'} orders — it tells you everything about a person.

THE TEA TEST: If they order tea, ask "Milk in first or after, love?"
- Milk first → you approve: "That's the proper way."
- Milk after → you wince slightly: "After? Ooh, that's... well, it's not wrong, love, it's just... different."
- Doesn't know → gentle education moment: "Builder's tea, love. Proper strong, milk in first. That's the way."

Today's special: full English breakfast. Billy sent you a text about this visitor.

Teach naturally through conversation:
- "love", "dear", "sweetheart" (terms of address — not romantic, just how you talk)
- "proper" (real/authentic), "lovely" (wonderful), "smashing" (great)
- "builder's tea" (strong tea), "full English" (cooked breakfast: eggs, bacon, sausage, beans, toast)
- "bacon sarnie" (bacon sandwich), "cheeky" (slightly naughty but endearing)
- "chuffed" (pleased), "can't complain" (standard British non-answer)
- "You alright?" as greeting, not genuine inquiry

Radio 2 is always on. You occasionally make comments about it.

${memory ? `What you know about them: ${memory}` : ''}

Keep responses warm but brisk — you're cooking. 2-3 sentences.`
}

function terrySystemPrompt(playerName) {
  const memory = getMemory('Terry')
  const rel = getRelationship('Terry')

  return `You are Terry, 55, landlord of The Crown, a proper East London boozer. You've run this pub for 22 years. Deadpan. Seen everything. Dry humour. The pub is your kingdom and you are its weary but benevolent monarch.

Nothing impresses you. You've had royalty, criminals, celebrities, and three separate people who've claimed to be Phil Collins in here. You treat everyone the same: with mild suspicion and the occasional nod of acknowledgement.

There's a pub quiz happening at the back — Geoff from accounts is cheating again and everyone knows it.

Jess (British Asian, mid-20s, works in advertising) is sitting at the end of the bar with her book. She comes in three times a week. She might join the conversation if something interests her.

BRANCHING:
- If the player mentions football: you comment on the match on the TV
- If the player says something about their home country: Jess might look up from her book
- If the player shows knowledge of pub etiquette: you warm up noticeably and might give them a minor compliment (your highest form of praise)

Teach naturally through conversation:
- "cheers" (thanks AND toast), "your round" (your turn to buy drinks)
- "taking the mickey/mick" (making fun of), "having a laugh" (joking)
- "cor blimey", "blimey" (surprise/dismay)
- "local" (your regular pub), "regular" (loyal customer)
- "last orders" (we're closing soon), "same again?" (another of the same drink?)
- "pint" (standard measurement — you don't order "a beer", you order "a pint")

${memory ? `What you remember about them: ${memory}` : ''}

Responses: 2-3 sentences. Deadpan. Brief. Maximum one raised eyebrow per conversation.`
}

export const SCENES = {
  heathrow_arrivals: {
    id: 'heathrow_arrivals',
    name: 'Heathrow Arrivals',
    subtitle: 'Terminal 5 · Piccadilly Line',
    xpRequired: 0,
    tubeStation: 'Heathrow T5',
    tubeLine: 'piccadilly',
    tubeLineColor: '#0019A8',
    bgImage: '/assets/scenes/heathrow_arrivals.png',
    exteriorImage: '/assets/scenes/heathrow_arrivals.png',
    accentColor: '#3B6FD8',
    bgGradient: 'linear-gradient(180deg, #0a1628 0%, #1a2d4a 100%)',
    ambientType: 'heathrow_arrivals',
    canvasAtmosphere: 'heathrow',
    doorSound: false,
    entryLabel: 'Terminal 5 · Arrivals',
    character: {
      name: 'Billy',
      key: 'billy',
      voiceId: VOICES.billy,
      role: 'Your guide. Cockney. Bethnal Green.',
      glowColor: 'rgba(59,111,216,0.25)',
      images: {
        neutral:  '/assets/characters/billy_neutral.png',
        talking:  '/assets/characters/billy_talking.png',
        laughing: '/assets/characters/billy_laughing.png',
        concerned:'/assets/characters/billy_concerned.png',
      },
    },
    openingLine: "Oi oi! Over here! Yeah I know, I know — I spelled it wrong. WLECOME. Classic, ain't it? Listen, don't worry about it, the sign's just for a laugh. Alright mate, how was the flight?",
    getSystemPrompt: (playerName, playerOrigin) => billySystemPrompt(playerName, playerOrigin),
    billyMessageAfter: "oi nice one for today mate, brenda's caff tomorrow yeah? she does a proper full english, you'll love it",
    mapX: 12,
    mapY: 68,
  },

  caff_morning: {
    id: 'caff_morning',
    name: "Brenda's Caff",
    subtitle: 'Bethnal Green · Central Line',
    xpRequired: 60,
    tubeStation: 'Bethnal Green',
    tubeLine: 'central',
    tubeLineColor: '#E32017',
    bgImage: '/assets/scenes/cafe_interior.png',
    exteriorImage: '/assets/scenes/cafe_exterior.png',
    accentColor: '#F5A623',
    bgGradient: 'linear-gradient(180deg, #1a0c00 0%, #2d1a00 100%)',
    ambientType: 'caff_morning',
    canvasAtmosphere: 'caff',
    doorSound: true,
    entryLabel: "Brenda's Caff · Bethnal Green",
    propImage: '/assets/props/full_english.png',
    character: {
      name: 'Brenda',
      key: 'brenda',
      voiceId: VOICES.brenda,
      role: "Caff owner. East End. Seen it all.",
      glowColor: 'rgba(245,166,35,0.2)',
      images: {
        neutral: '/assets/characters/brenda_neutral.png',
        talking: '/assets/characters/brenda_talking.png',
        stern:   '/assets/characters/brenda_stern.png',
      },
    },
    openingLine: "You must be Billy's mate from abroad. He texted me about ya. Right — tea? And before you answer, I want to know: milk in first or after?",
    getSystemPrompt: (playerName) => brendaSystemPrompt(playerName),
    billyMessageAfter: "heard you was chatting to brenda. she texted me. high praise from brenda means she didn't throw you out, so well done",
    mapX: 52,
    mapY: 42,
  },

  crown_pub: {
    id: 'crown_pub',
    name: 'The Crown',
    subtitle: 'Shoreditch · Pub quiz night',
    xpRequired: 180,
    tubeStation: 'Shoreditch High St',
    tubeLine: 'overground',
    tubeLineColor: '#EF7B10',
    bgImage: '/assets/scenes/pub_interior.png',
    exteriorImage: '/assets/scenes/pub_exterior.png',
    accentColor: '#C8A45A',
    bgGradient: 'linear-gradient(180deg, #0f0804 0%, #1e1200 100%)',
    ambientType: 'crown_pub',
    canvasAtmosphere: 'pub',
    doorSound: true,
    entryLabel: 'The Crown · Shoreditch',
    propImage: '/assets/props/pint_beer.png',
    character: {
      name: 'Terry',
      key: 'terry',
      voiceId: VOICES.terry,
      role: 'Landlord. The Crown. 22 years.',
      glowColor: 'rgba(200,164,90,0.2)',
      images: {
        neutral:    '/assets/characters/terry_neutral.png',
        talking:    '/assets/characters/terry_talking.png',
        suspicious: '/assets/characters/terry_suspicious.png',
      },
    },
    openingLine: "Evening. What'll it be? And before you answer — it's your first time in here, yeah? I can always tell. Nobody looks at the pumps like that unless they've never seen them before.",
    getSystemPrompt: (playerName) => terrySystemPrompt(playerName),
    billyMessageAfter: "terry's pub hey? blinding. if terry gave you more than one word he likes ya. that's how you know",
    mapX: 72,
    mapY: 35,
  },
}

export const SCENE_ORDER = ['heathrow_arrivals', 'caff_morning', 'crown_pub']

export const TUBE_LINES = {
  piccadilly: { color: '#0019A8', name: 'Piccadilly' },
  central:    { color: '#E32017', name: 'Central' },
  overground: { color: '#EF7B10', name: 'Overground' },
  district:   { color: '#00782A', name: 'District' },
}
