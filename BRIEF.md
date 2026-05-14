# ALRIGHT MATE — Complete Build Brief

## Status
READY TO BUILD. All APIs and voices confirmed. Build without stopping.

## APIs
- Anthropic: [set in .env as VITE_ANTHROPIC_API_KEY]
- ElevenLabs: [set in .env as VITE_ELEVENLABS_API_KEY]

## Voice Cast
- Billy (Cockney guide, 32): okaIyEnglPPZIJCdfGg8
- Brenda (caff owner, 58): EQx6HGDYjkDpcli6vorJ
- Dave (market trader, 52): aG5HDXdBKeJ2UTSAfx6z
- Terry (pub landlord, 55): IHBkqUsg3RXMA5gFYtga
- Narrator (intro voiceover): 1aKwif4MHakNsk2O1zfs
- Edward (posh toff): aaorr6ZHIL88gEexu7dC
- Marcus (Billy's mate, MLE Hackney): cCP7xSMHqRWBYs5vewud
- Jess (love interest, British Asian): GNwbLe0Tqex5y7MVarJz
- Brad (American tourist): TFNGY5E9nfgvDNh8jeHQ

## Tech Stack
- React 19 + Vite 8
- Claude Haiku for conversations, Sonnet for scoring
- ElevenLabs eleven_multilingual_v2 for all voices
- Web Speech API for mic input (en-GB)
- Web Audio API for procedural ambient sound
- Canvas for scene atmosphere + character portraits
- localStorage for game state
- Vercel for deployment

## Architecture — Reference: Argentinizado
Located at: C:\Users\jackg\Claude Code Personal\projects\Argentinizado
Same core pattern: React state machine, Claude API direct from browser, ElevenLabs TTS, canvas characters, ambient audio, localStorage persistence.

## View State Machine
SPLASH → CHARACTER_CREATE → CINEMATIC → MAP → TUBE_RIDE → SCENE → DEBRIEF → MAP
Plus: BILLY_PHONE overlay accessible from MAP and SCENE

## Files Already Written
- package.json
- vite.config.js
- index.html
- .env (with all keys and voice IDs)
- .gitignore
- vercel.json
- src/main.jsx
- src/store/gameStore.js
- src/lib/memory.js
- src/services/claudeService.js
- src/services/elevenLabsService.js
- src/hooks/useSpeechRecognition.js

## Files Still To Build
- src/hooks/useAmbientAudio.js
- src/data/scenes.js
- src/App.jsx
- src/components/SplashScreen.jsx
- src/components/CharacterCreate.jsx
- src/components/CinematicIntro.jsx
- src/components/LondonMap.jsx
- src/components/TubeRide.jsx
- src/components/AnimatedCharacter.jsx
- src/components/ConversationScene.jsx
- src/components/ConversationScene.css
- src/components/HUD.jsx
- src/components/Debrief.jsx
- src/components/BillyPhone.jsx
- src/components/SlangBank.jsx

## London Scenes (Phase 1)
1. heathrow_arrivals — Billy, 0 XP required. Opening scene. Misspelled sign moment.
2. caff_morning — Brenda, 60 XP. Billy's local caff. Tea test moment.
3. crown_pub — Terry + branching, 180 XP. Jess available. Pub quiz in background.

## Characters

### Billy
Cockney, 32, Bethnal Green. Leather jacket, dark hair, stubble. Warm underneath the banter.
Mood system: good/buzzing/rough. Changes daily. Affects system prompt tone.
Has his own storyline — saving to open a caff. His mum is a plot point.

### Brenda
East End, 58. Grey hair, apron, glasses on head. Suspicious at first, maternal when she likes you.
Tea test: watches if you add milk correctly. Winces if wrong.

### Terry
Pub landlord, 55. Deadpan, seen everything. Dry humour. The pub is his kingdom.
Branching: who engages depends on what player says first.

### Jess
British Asian, mid 20s, north London. Creative industry. Goes quieter when interested.
Love interest mechanic: banter correctly = she stays. Get it wrong = she drifts off.

### Marcus
Billy's mate, Hackney, MLE. Effortless, cool. Billy introduces you.
Teaches: fam, mandem, wagwan, peng, bare, allow it, ends, bruv.

### Edward
Posh RP, Kensington. Genuinely warm, genuinely baffling. Teaches a completely different English.

### Brad
American tourist. Cargo shorts in October. Confident and completely wrong about everything.
Comedy through American vs British English confusion.

### Mei (no voice needed in prototype)
Chinese tourist. Photographs everything including bins and pigeons. Scripted cameo.

## Visual Design

### Core Principle
Real photography as backgrounds. Illustrated characters on top. Canvas atmosphere between.

### Scene Backgrounds (Unsplash)
- Heathrow: https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80
- Caff: https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1400&q=80
- Pub: https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1400&q=80

### Color Palette
- App chrome background: #0f0608
- Cream text: #F5F0E8
- Gold accent: #C8A45A
- British red: #C41E3A
- Heathrow blue: #3B6FD8
- Caff orange: #F5A623
- Pub gold: #C8A45A
- Market red: #E84C3D

### Typography
- Headers: Playfair Display (British newspaper)
- Body: Inter
- HUD/UI labels: Inter 500

### Character Portrait Style
Illustrated portrait, NOT full cartoon. Realistic proportions. Rich skin tones. Detailed faces.
Breathing animation. Speaking mouth movement. Blinking. Weight shifts.

## Canvas Atmosphere Per Scene

### Heathrow
Fluorescent light bokeh (pale white-yellow circles drifting slowly), moving traveller silhouettes,
distant arrivals board text flipping, occasional muffled plane passing overhead glow.

### The Caff
Steam particles rising (white/grey, slow, organic), warm orange glow pulsing from grill direction,
condensation drip on window edges, radio signal wave in corner.

### The Pub
Warm amber bokeh (candle/lamp sources), subtle haze layer, TV screen flicker (blue-white light
from corner), condensation ring animations on bar surface.

### Tube Ride
Dark tunnel rushing past windows (black with occasional light streaks), station name signs
flashing white text, overhead carriage light flicker, seat texture in foreground.

## Ambient Audio Per Scene

### Heathrow
Airport PA echo (synthesised reverb + filtered voice-frequency noise), rolling luggage
(white noise, mid-freq), HVAC hum (very low, constant), distant plane (low rumble, periodic).

### The Caff
Grill sizzle (white noise, high-pass filtered), Radio 2 murmur (bandpass around 1200Hz),
ceramic clinking (periodic transients), light TV news murmur in background.

### The Pub
Pub chatter (bandpass noise, multiple layers), glass clink transients, fruit machine
electronic beeps (periodic), TV football crowd swell (slow LFO on crowd noise),
door open/close (occasional low thud).

### Tube
Underground rumble (low-pass, heavy), carriage rhythm (0.3Hz LFO on rumble),
door mechanism sounds, pressure change effect (filter sweep on entry/exit).

## Gamification
- XP levels: Holidaymaker → Day Tripper → Regular → Local → Proper British
- Slang Bank: collects every phrase learned, reviewable anytime
- Survival dots: 3 chances per scene
- Streak + shields (same as Argentinizado)
- Reputation per location (0-100, affects character dialogue)
- Relationship levels per character: stranger → acquaintance → mate → good mate → best mate

## Billy's Phone
Floating phone icon, bottom right. Triggered messages:
1. After Heathrow scene: "oi nice one for today mate, brenda's caff tomorrow yeah?"
2. After first day away: "you went quiet on me there, everything alright?"
3. Before caff scene: "brenda's doing her full english today. don't be late she hates that"
4. After good score: "heard you was chatting. not bad for a tourist"
5. Cliffhanger: "got something to show ya. come find me tomorrow"

## Emotional Beats
1. The misspelled sign — Billy holds "WLECOME [NAME]". Camera zooms. His grin. First laugh.
2. The tea test — Brenda watches. React wrong and she winces. First stakes moment.
3. Billy's bad day — Brenda whispers "leave him". Cheer him up = unlock his story.
4. The pub regular — Old man, corner. Nods on visit 4. Says "alright" eventually. Perfect arc.
5. Jess goes quiet — She's interested. Read it right. The mechanic and the feeling are the same thing.

## Debrief Screen
- Grade ring (A-F, colour coded)
- Score / XP earned (animated counter)
- Billy's spoken comment (ElevenLabs, his voice)
- New slang added to bank (animates in one by one)
- Highlights + corrections
- Share postcard button

## Share Postcard
Canvas-generated image. Illustrated location scene. Player character on it.
Score + grade. "Sent from London" footer. British stamp graphic.
1200x630 for social sharing.

## London Underground Map Navigation
Harry Beck design language. 45-degree angles. Cream background. Thick coloured lines.
Stations as circles. Locked = grey ring + lock icon + XP needed. Unlocked = pulsing line colour.
Tap station → tube ride → scene.

## Vercel Deployment
vercel.json already written. Run: npm install && npm run build then vercel deploy.
Or connect GitHub repo to Vercel for auto-deploy.
