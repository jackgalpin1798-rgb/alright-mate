# Alright Mate — Project Brief

## Concept
A browser-based British slang & accent learning game. Immersive, gamified, AI-powered conversations. Built on the same architecture as Argentinizado. Deploy to Vercel.

Tone: romantic, funny, traditional. A foreigner's slightly ironic but loving idea of England.
Target: second-language English speakers practising for a holiday or wanting to understand British culture.

---

## Name
Working title: **Alright Mate** (TBC)
Intro line (Cockney voiceover): *"You alright, mate? Welcome to the only place online to learn proper fucking English."*

---

## Opening Sequence
1. Character creation — name, age, country of origin (affects how characters react throughout)
2. Light character appearance customisation
3. Cinematic intro: you're at home, taxi pulls up, sign shows your home country
4. Drive to airport
5. Plane. Land at Heathrow.
6. Arrivals hall. Billy is waiting — holding a sign with your name spelled wrong. First joke.

---

## Billy
- Main guide and friend throughout the entire game
- Cockney. Funny. Warm. Slightly dodgy.
- Introduces you to different people in each location
- Sends voicemails/texts between sessions (ElevenLabs audio) — keeps habit loop alive
- Appears in every city, connects the storyline

---

## London (Phase 1 — Perfect This First)
London is the starting city. Fully fleshed out before anything else is built.

### Navigation
- London underground map as the navigation UI
- Each tube stop = a unlockable location
- The tube ride IS the loading screen — animated carriage, ambient sounds, practice ticket purchase mini-game

### London Locations
- Heathrow (intro, locked until character creation complete)
- The Caff (greasy spoon, Billy's local)
- Portobello / street market (Cockney trader patter)
- The Pub (branching — multiple characters, flirting possible, pub quiz)
- Football stadium (unlocked by making the right friends)
- Camden
- Buckingham Palace area (tourist trap characters)
- The black cab (en route between locations)

### The Pub (flagship scene)
- Enter and several different people are visible
- Who you talk to depends on what you say first
- Pub quiz happening in the background — you can join
- Flirting mechanic (slang-based)
- "Your round" mechanic — ordering drinks for the table

---

## Gamification
- XP for using and understanding slang correctly
- Slang bank — collects every phrase you learn, reviewable
- The Blag It mechanic — guess from context, bonus if right, funny reaction if wrong
- The Local Test — end of each city, convince a local you belong
- Streak system + shields (same as Argentinizado)
- Difficulty: Easy (London) → Hard (Glasgow, Newcastle, Liverpool)

---

## Cities (unlock in order)
1. **London** — Easy. RP + Cockney + MLE/roadman
2. **York** — Medium. Yorkshire dialect
3. **Manchester** — Medium-Hard. Mancunian
4. **Liverpool** — Hard. Scouse
5. **Edinburgh / Glasgow** — Hard. Scottish
6. **Loch Ness** — Secret/bonus. Rowing boat, Scottish fisherman, monster Easter egg

### Travel mechanic
- Train OR taxi between cities (player chooses)
- Train: slower, ambient carriage sounds, passenger you can talk to, countryside scrolls by
- Taxi: faster, intimate, one character, banter

---

## Confirmed Features (Prototype)
- [x] Billy's voicemails between sessions
- [x] The Local Test (end of each city)
- [x] Pub Quiz scene
- [x] Tabloid headline mini-games
- [x] Postcard share cards (city complete)
- [x] Underground as loading screen + ticket mini-game
- [x] Football match (unlocked by friendships made)
- [x] Branching conversations (who you meet depends on what you say)
- [x] Country of origin affects dialogue throughout
- [x] Ambient audio per location

---

## Visual Style
- Cartoon sketch / illustrated
- Slightly romanticised, postcard England
- Famous landmarks drawn like Ladybird book illustrations
- Characters: canvas-rendered (same approach as Argentinizado)
- Dark UI surround, vibrant illustrated scenes

---

## Tech Stack
- React + Vite (same as Argentinizado)
- Claude API — Haiku for conversations, Sonnet for scoring
- ElevenLabs — character voices + Billy's voicemails
- Web Speech API — mic input
- Web Audio API — procedural ambient sound per location
- Canvas — character rendering + scene atmosphere
- localStorage — game state
- Vercel — deployment

---

## Phase Plan
**Phase 1 (now):** Browser prototype. London only. Billy. 3-4 locations. Core conversation loop. Deploy to Vercel.
**Phase 2:** Full London. All tube stops. Pub quiz. Local test. Branching.
**Phase 3:** Add cities. Train travel. Difficulty scaling.
**Phase 4:** Mobile.

---

## Open Questions
- Final app name (Alright Mate is working title)
- ElevenLabs voice IDs (pending — user is recording)
- Character customisation depth (TBC)
