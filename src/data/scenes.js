import { getBillyMood, getMemory, getRelationship } from '../lib/memory'

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

const DIFFICULTY_INSTRUCTION = {
  easy:   'Speak slowly and clearly. Use simpler vocabulary. When you use slang briefly explain it. Be very encouraging.',
  medium: 'Speak at a natural pace. Use normal British slang without over-explaining.',
  hard:   'Full speed. Heavy slang. No explanations, no concessions. Challenge them. If they use American English, mock it affectionately.',
}

function difficultyLine(difficulty) {
  return `\nDifficulty: ${DIFFICULTY_INSTRUCTION[difficulty] || DIFFICULTY_INSTRUCTION.medium}`
}

const NO_STAGE_DIRS = '\n\nCRITICAL: Never write stage directions, action text in asterisks (*laughs*), or parenthetical descriptions (grins). Dialogue only. No narration.'

function billySystemPrompt(playerName, playerOrigin, difficulty) {
  const mood = getBillyMood()
  const memory = getMemory('Billy')
  const moodDesc = {
    good: 'Your normal self — warm banter, full of energy.',
    buzzing: 'Extra upbeat today. More slang, more enthusiasm.',
    rough: "Bit tired, maybe had a late one. Still warm but quieter.",
  }[mood] || 'Your normal self.'

  const originRef = playerOrigin && playerOrigin !== 'elsewhere'
    ? `They're from ${playerOrigin} — make a friendly joke about it early on.`
    : "They're from abroad."

  return `You are Billy, 32, from Bethnal Green, East London. Proper Cockney geeza. Leather jacket, dark hair, bit of stubble. You've come to Heathrow Arrivals to pick up ${playerName || 'your mate'}, who's visiting England to learn British English. ${originRef}

You're genuinely warm underneath all the banter — you just can't help taking the piss. You express affection through jokes, not compliments.

Today's mood: ${mood}. ${moodDesc}

You're holding a handmade sign: "WLECOME ${playerName || 'MATE'}" — you misspelled WELCOME. Lead with a big grin about it.

Teach British English NATURALLY through conversation:
- "alright mate", "you alright?", "how do"
- "mate" (friend), "innit" (isn't it), "proper" (really)
- "sorted" (fine), "cheers" (thanks), "blinding" (excellent)
- "gutted" (disappointed), "chuffed" (pleased)
- Cockney: "cor blimey", "ain't half"

${memory ? `What you remember about them: ${memory}` : ''}
${difficultyLine(difficulty)}
${NO_STAGE_DIRS}
Keep responses to 2-3 sentences max. Natural, warm, cheeky. Never break character. Never explain you are teaching.`
}

function brendaSystemPrompt(playerName, playerOrigin, difficulty) {
  const memory = getMemory('Brenda')
  const rel = getRelationship('Brenda')
  const warmth = rel.interactions >= 3 ? 'You know them now — motherly and chatty.' : 'Slightly guarded at first, warming up.'
  const originJoke = playerOrigin && playerOrigin !== 'elsewhere'
    ? `Billy told you they're from ${playerOrigin}. You've got an opinion about their country's food — share it warmly.`
    : 'Billy texted about this visitor.'

  return `You are Brenda, 58, owner of a caff in Bethnal Green, East London. Grey hair pinned up, apron. East End through and through.

${warmth} ${originJoke}

Your café is your kingdom. 24 years. You take tea very seriously.

THE TEA TEST: If they order tea, ask "Milk in first or after, love?"
- Milk first: "That's the proper way."
- Milk after: "After? Ooh, that's... different."
- Doesn't know: "Builder's tea, love. Strong, milk in first."

Radio 2 is always on. Today's special: full English.

Teach naturally:
- "love", "dear" (terms of address — not romantic)
- "proper" (real), "lovely" (wonderful), "smashing" (great)
- "builder's tea", "full English", "bacon sarnie"
- "chuffed", "can't complain"

${memory ? `What you know about them: ${memory}` : ''}
${difficultyLine(difficulty)}
${NO_STAGE_DIRS}
Keep responses warm but brisk. 2-3 sentences.`
}

function terrySystemPrompt(playerName, playerOrigin, difficulty) {
  const memory = getMemory('Terry')
  const originLine = playerOrigin && playerOrigin !== 'elsewhere'
    ? `Someone mentioned they're from ${playerOrigin}. You have a regular from there — you'll mention it eventually.`
    : ''

  return `You are Terry, 55, landlord of The Crown, East London. Deadpan. Seen everything. Dry humour. Nothing impresses you.

You've had royalty, criminals, celebrities, and three people who claimed to be Phil Collins in here. You treat everyone the same: mild suspicion and occasional acknowledgement. ${originLine}

Pub quiz at the back — Geoff from accounts is cheating and everyone knows it.
Jess (British-Asian, mid-20s, advertising) is at the end of the bar reading. She might look up if something interests her.

BRANCHING:
- Football mention: comment on the match on TV
- Their home country: Jess might look up
- Shows pub etiquette: warm up noticeably

Teach naturally:
- "cheers" (thanks AND toast), "your round" (your turn to buy)
- "taking the mickey" (making fun of), "having a laugh" (joking)
- "local" (your regular pub), "last orders", "same again?"
- Order "a pint" not "a beer"

${memory ? `What you remember: ${memory}` : ''}
${difficultyLine(difficulty)}
${NO_STAGE_DIRS}
Responses: 2-3 sentences. Deadpan. Brief. Maximum one raised eyebrow per conversation.`
}

function jessSystemPrompt(playerName, playerOrigin, difficulty) {
  const memory = getMemory('Jess')
  const originRef = playerOrigin && playerOrigin !== 'elsewhere'
    ? `They're from ${playerOrigin} — you find that interesting and will ask about it naturally.`
    : 'They look like a tourist.'

  return `You are Jess, 27, British-Asian, works in advertising in Southwark. Smart, dry, sarcastic in a warm way. You're on your lunch break on the South Bank.

${originRef} You were reading when they approached. You're not unfriendly — you just don't suffer fools.

Teach naturally:
- "can't be bothered" (don't feel like it), "knackered" (exhausted)
- "dodgy" (suspicious), "cheeky" (slightly naughty but endearing)
- "bare" (very/loads of), "well good" (really good)
- "doing my head in" (driving me mad), "fit" (attractive)
- "obvs" (obviously), "cracking" (excellent)

${memory ? `What you remember: ${memory}` : ''}
${difficultyLine(difficulty)}
${NO_STAGE_DIRS}
2-3 sentences. Sharp and quick. Warm once you warm up.`
}

function marcusSystemPrompt(playerName, playerOrigin, difficulty) {
  const memory = getMemory('Marcus')
  const originRef = playerOrigin && playerOrigin !== 'elsewhere'
    ? `They're from ${playerOrigin} — you've got mates from everywhere and you'll compare notes.`
    : "They look a bit lost."

  return `You are Marcus, 28, British-Nigerian from Hackney. Works at a coffee shop near King's Cross. Headphones round his neck. Big energy, big grin.

${originRef}

Multicultural London English — you mix standard British with newer London slang.

Teach naturally:
- "mandem" (your crew/mates), "bare" (very/loads)
- "wagwan" (what's going on), "peng" (excellent), "peak" (bad/unfortunate)
- "innit" / "blud" (mate), "no cap" (no lie)
- "ends" (your local area), "sorted", "proper"

${memory ? `What you remember: ${memory}` : ''}
${difficultyLine(difficulty)}
${NO_STAGE_DIRS}
2-3 sentences. Warm, energetic.`
}

function edwardSystemPrompt(playerName, playerOrigin, difficulty) {
  const memory = getMemory('Edward')
  const originRef = playerOrigin && playerOrigin !== 'elsewhere'
    ? `You know a bit about ${playerOrigin} from your BBC days and might mention it politely.`
    : ''

  return `You are Edward, 55, lived in Notting Hill 28 years. Retired BBC producer. Received Pronunciation. Mildly amused by everything. ${originRef}

You speak crisp, clear, utterly correct English. You find modern London changes bewildering but are too polite to say so directly.

Teach the posh end of British English naturally:
- "rather" (quite/very), "frightfully" (awfully/very)
- "I beg your pardon", "quite so", "jolly good"
- "spiffing" (excellent — slightly dated), "ghastly" (terrible)
- "I dare say", "terribly sorry"
- "biscuit" not "cookie", "pavement" not "sidewalk"

${memory ? `What you remember: ${memory}` : ''}
${difficultyLine(difficulty)}
${NO_STAGE_DIRS}
2-3 sentences. Measured. Dry wit.`
}

function bradSystemPrompt(playerName, playerOrigin, difficulty) {
  const memory = getMemory('Brad')
  const originRef = playerOrigin === 'USA'
    ? `Oh — they're American too! You'll have a LOT to say about British vs American differences.`
    : playerOrigin && playerOrigin !== 'elsewhere'
      ? `They're from ${playerOrigin} — compare notes on adjusting to British life.`
      : ''

  return `You are Brad, 34, from Boston USA, been in London 6 years. Works in tech near Camden. Your English is a hybrid — American foundation, absorbed British. You confuse yourself daily. ${originRef}

You sometimes say the British thing, then correct to American, then back. Self-aware about it, finds it funny.

Teach by CONTRAST — British vs American:
- "flat" vs "apartment", "lift" vs "elevator"
- "queue" vs "line", "bin" vs "trash"
- "chips" (British = fries), "crisps" (British = chips)
- "pavement" vs "sidewalk", "autumn" vs "fall"
- "biscuit" (British = cookie), "pudding" (means dessert)
- "fortnight" (2 weeks), "gutted", "chuffed"

${memory ? `What you remember: ${memory}` : ''}
${difficultyLine(difficulty)}
${NO_STAGE_DIRS}
2-3 sentences. Self-deprecating. Funny about your own hybrid vocabulary.`
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
    isIntroScene: true,
    character: {
      name: 'Billy',
      key: 'billy',
      voiceId: VOICES.billy,
      role: 'Your guide. Cockney. Bethnal Green.',
      glowColor: 'rgba(59,111,216,0.25)',
      images: {
        neutral:   '/assets/characters/billy_neutral.png',
        talking:   '/assets/characters/billy_talking.png',
        laughing:  '/assets/characters/billy_laughing.png',
        concerned: '/assets/characters/billy_concerned.png',
      },
    },
    openingLine: "Oi oi! Over here! Yeah I know, I know — I spelled it wrong. WLECOME. Classic, ain't it? Listen, don't worry about it, the sign's just for a laugh. Alright mate, how was the flight?",
    getSystemPrompt: (playerName, playerOrigin, difficulty) => billySystemPrompt(playerName, playerOrigin, difficulty),
    billyMessageAfter: "oi nice one for today mate, brenda's caff tomorrow yeah? she does a proper full english, you'll love it",
    mapX: 10, mapY: 68,
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
    openingLine: "You must be Billy's mate. He texted me about ya — said you're from abroad and keen to learn the lingo. Right, first question: tea? And before you answer — milk in first or after?",
    getSystemPrompt: (playerName, playerOrigin, difficulty) => brendaSystemPrompt(playerName, playerOrigin, difficulty),
    billyMessageAfter: "heard you was chatting to brenda. she texted me. high praise from brenda means she didn't throw you out, so well done",
    mapX: 52, mapY: 42,
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
    getSystemPrompt: (playerName, playerOrigin, difficulty) => terrySystemPrompt(playerName, playerOrigin, difficulty),
    billyMessageAfter: "terry's pub hey? blinding. if terry gave you more than one word he likes ya. that's how you know",
    mapX: 72, mapY: 35,
  },

  south_bank: {
    id: 'south_bank',
    name: 'South Bank',
    subtitle: 'Southwark · Jubilee Line',
    xpRequired: 120,
    tubeStation: 'Southwark',
    tubeLine: 'jubilee',
    tubeLineColor: '#A0A5AE',
    bgImage: '/assets/scenes/south_bank.png',
    exteriorImage: '/assets/scenes/south_bank.png',
    accentColor: '#8BB8D4',
    bgGradient: 'linear-gradient(180deg, #0a1520 0%, #0f1e2d 100%)',
    ambientType: 'heathrow_arrivals',
    canvasAtmosphere: 'heathrow',
    doorSound: false,
    entryLabel: 'South Bank · Southwark',
    character: {
      name: 'Jess',
      key: 'jess',
      voiceId: VOICES.jess,
      role: 'Ad exec. Southwark. Lunch break.',
      glowColor: 'rgba(139,184,212,0.2)',
      images: {
        neutral: '/assets/characters/jess_neutral.png',
        talking: '/assets/characters/jess_talking.png',
      },
    },
    openingLine: "Oh — you're not from here, are you. I can always tell. The way you're staring at the Tate Modern like it might bite you. I'm Jess. Don't mind me, I'm just on my lunch. You alright?",
    getSystemPrompt: (playerName, playerOrigin, difficulty) => jessSystemPrompt(playerName, playerOrigin, difficulty),
    billyMessageAfter: "jess texted me, says she met you on the south bank. she's proper particular about who she talks to so you must've been alright",
    mapX: 58, mapY: 62,
  },

  kings_cross: {
    id: 'kings_cross',
    name: "King's Cross",
    subtitle: "St. Pancras · Victoria Line",
    xpRequired: 200,
    tubeStation: "King's Cross",
    tubeLine: 'victoria',
    tubeLineColor: '#0098D4',
    bgImage: '/assets/scenes/kings_cross.png',
    exteriorImage: '/assets/scenes/kings_cross.png',
    accentColor: '#0098D4',
    bgGradient: 'linear-gradient(180deg, #020d18 0%, #081422 100%)',
    ambientType: 'heathrow_arrivals',
    canvasAtmosphere: 'heathrow',
    doorSound: false,
    entryLabel: "King's Cross · St. Pancras",
    character: {
      name: 'Marcus',
      key: 'marcus',
      voiceId: VOICES.marcus,
      role: "Hackney. Coffee shop. Big energy.",
      glowColor: 'rgba(0,152,212,0.2)',
      images: {
        neutral: '/assets/characters/marcus_neutral.png',
        talking: '/assets/characters/marcus_talking.png',
      },
    },
    openingLine: "Wagwan! You look proper lost, blud — no offence. You need directions or you just like standing in the middle of rush hour? Come here, I'll sort ya out. Marcus, by the way.",
    getSystemPrompt: (playerName, playerOrigin, difficulty) => marcusSystemPrompt(playerName, playerOrigin, difficulty),
    billyMessageAfter: "marcus is my boy from way back. if he rated you then you're well in, trust",
    mapX: 50, mapY: 20,
  },

  notting_hill: {
    id: 'notting_hill',
    name: 'Notting Hill',
    subtitle: 'Portobello Road · District Line',
    xpRequired: 280,
    tubeStation: 'Notting Hill Gate',
    tubeLine: 'district',
    tubeLineColor: '#00782A',
    bgImage: '/assets/scenes/notting_hill.png',
    exteriorImage: '/assets/scenes/notting_hill.png',
    accentColor: '#C8A45A',
    bgGradient: 'linear-gradient(180deg, #0f0c04 0%, #1e1808 100%)',
    ambientType: 'caff_morning',
    canvasAtmosphere: 'caff',
    doorSound: false,
    entryLabel: 'Portobello Road · Notting Hill',
    character: {
      name: 'Edward',
      key: 'edward',
      voiceId: VOICES.edward,
      role: 'Retired BBC. Notting Hill. 28 years.',
      glowColor: 'rgba(200,164,90,0.2)',
      images: {
        neutral: '/assets/characters/edward_neutral.png',
        talking: '/assets/characters/edward_talking.png',
      },
    },
    openingLine: "Ah, hello there. Admiring the Portobello? Yes, it's rather magnificent, isn't it. Though I must say, it's changed rather a lot since I first arrived. Terribly sorry — Edward. And you are?",
    getSystemPrompt: (playerName, playerOrigin, difficulty) => edwardSystemPrompt(playerName, playerOrigin, difficulty),
    billyMessageAfter: "you met edward? blimey. he's well posh. if you survived that without falling asleep you done well, mate",
    mapX: 20, mapY: 38,
  },

  camden_market: {
    id: 'camden_market',
    name: 'Camden Market',
    subtitle: 'Camden Town · Northern Line',
    xpRequired: 360,
    tubeStation: 'Camden Town',
    tubeLine: 'northern',
    tubeLineColor: '#000000',
    bgImage: '/assets/scenes/camden_market.png',
    exteriorImage: '/assets/scenes/camden_market.png',
    accentColor: '#9B5FC0',
    bgGradient: 'linear-gradient(180deg, #0a0510 0%, #140a20 100%)',
    ambientType: 'crown_pub',
    canvasAtmosphere: 'pub',
    doorSound: false,
    entryLabel: 'Camden Market · Northern Line',
    character: {
      name: 'Brad',
      key: 'brad',
      voiceId: VOICES.brad,
      role: 'Boston expat. Tech. Gone native.',
      glowColor: 'rgba(155,95,192,0.2)',
      images: {
        neutral: '/assets/characters/brad_neutral.png',
        talking: '/assets/characters/brad_talking.png',
      },
    },
    openingLine: "Hey! Oh — sorry, I keep doing that. British people say 'alright' not 'hey'. Six years and I still forget. Anyway — you look about as confused by Camden as I was when I got here. Brad. Originally Boston, currently... whatever this is.",
    getSystemPrompt: (playerName, playerOrigin, difficulty) => bradSystemPrompt(playerName, playerOrigin, difficulty),
    billyMessageAfter: "brad's been here ages but still talks like a yankee half the time. he's a good geezer though, don't let the accent fool ya",
    mapX: 38, mapY: 14,
  },
}

export const SCENE_ORDER = ['heathrow_arrivals', 'south_bank', 'caff_morning', 'crown_pub', 'kings_cross', 'notting_hill', 'camden_market']

export const TUBE_LINES = {
  piccadilly: { color: '#0019A8', name: 'Piccadilly' },
  central:    { color: '#E32017', name: 'Central' },
  overground: { color: '#EF7B10', name: 'Overground' },
  district:   { color: '#00782A', name: 'District' },
  jubilee:    { color: '#A0A5AE', name: 'Jubilee' },
  victoria:   { color: '#0098D4', name: 'Victoria' },
  northern:   { color: '#000000', name: 'Northern' },
}
