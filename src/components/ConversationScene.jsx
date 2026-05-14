import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getCharacterReply, getHintExplanation } from '../services/claudeService'
import { speak, stopSpeaking, prefetchAudio } from '../services/elevenLabsService'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useAmbientAudio } from '../hooks/useAmbientAudio'
import AnimatedCharacter from './AnimatedCharacter'
import HUD from './HUD'
import { getMemory } from '../lib/memory'
import './ConversationScene.css'

const MAX_TURNS = 8
const SURVIVAL_DOTS_TOTAL = 3

const COACHING_INSTRUCTION = `\n\nCOACHING: After your in-character response, add a new line starting with exactly "FEEDBACK:" followed by one coaching sentence in English. If they used good British slang or got something right, praise it specifically. If they made a mistake (used American English, wrong idiom, unnatural phrasing), give a gentle correction. Keep it to one sentence.`

// Entry phases: exterior shown → push-in animation → cross-fade → arrived → conversation
const ENTRY = { EXTERIOR: 'exterior', ENTERING: 'entering', CROSSFADE: 'crossfade', ARRIVED: 'arrived', STARTED: 'started' }

function stripStageDirections(text) {
  return text
    .replace(/\*[^*\n]+\*/g, '')
    .replace(/\([a-z][a-z\s,]{0,40}\)/g, '')
    .replace(/\[[^\]\n]{0,40}\]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .split('\n').map(l => l.trim()).filter(Boolean).join('\n')
    .trim()
}

function extractFeedback(text) {
  const lines = text.split('\n')
  const idx = lines.findIndex(l => /^FEEDBACK:/i.test(l.trim()))
  if (idx === -1) return { clean: stripStageDirections(text.trim()), feedback: null }
  return {
    clean: stripStageDirections(lines.slice(0, idx).join('\n').trim()),
    feedback: lines[idx].replace(/^FEEDBACK:\s*/i, '').trim(),
  }
}

// Web Audio procedural door bell — two ascending tones
function playDoorBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const tones = [
      { freq: 1220, start: 0,    end: 0.6 },
      { freq: 980,  start: 0.25, end: 0.9 },
    ]
    tones.forEach(({ freq, start, end }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + start)
      gain.gain.linearRampToValueAtTime(0.18, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + end)
      osc.start(now + start); osc.stop(now + end + 0.05)
    })
    setTimeout(() => ctx.close(), 1500)
  } catch {}
}

// Atmosphere particle canvas (steam, bokeh, etc)
function AtmosphereCanvas({ type }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    const W = canvas.width, H = canvas.height
    const particles = []

    if (type === 'caff') {
      for (let i = 0; i < 20; i++) {
        particles.push({ x: W * (0.4 + Math.random() * 0.5), y: H + Math.random() * 60,
          r: 3 + Math.random() * 5, speed: 0.3 + Math.random() * 0.7,
          drift: (Math.random() - 0.5) * 0.3, alpha: 0.15 + Math.random() * 0.3,
          phase: Math.random() * Math.PI * 2 })
      }
    } else if (type === 'pub') {
      for (let i = 0; i < 14; i++) {
        particles.push({ x: Math.random() * W, y: Math.random() * H * 0.6,
          r: 20 + Math.random() * 50, alpha: 0.03 + Math.random() * 0.05,
          phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.5 })
      }
    }

    let t = 0, raf
    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      if (type === 'caff') {
        const glow = ctx.createRadialGradient(W * 0.8, H, 0, W * 0.8, H, W * 0.5)
        glow.addColorStop(0, `rgba(255,130,30,${0.06 + Math.sin(t * 2.1) * 0.02})`)
        glow.addColorStop(1, 'rgba(255,100,0,0)')
        ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)
        particles.forEach(p => {
          p.y -= p.speed; p.x += p.drift + Math.sin(t * 0.7 + p.phase) * 0.2
          if (p.y < -p.r * 2) { p.y = H * 0.95; p.x = W * (0.4 + Math.random() * 0.5) }
          const a = p.alpha * Math.min(1, (H - p.y) / (H * 0.7))
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (1.5 + (H - p.y) / H * 2))
          g.addColorStop(0, `rgba(220,215,210,${a})`); g.addColorStop(1, 'rgba(220,215,210,0)')
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
        })
      } else if (type === 'pub') {
        particles.forEach(p => {
          const a = p.alpha * (0.6 + 0.4 * Math.sin(t * p.speed + p.phase))
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
          g.addColorStop(0, `rgba(255,185,60,${a})`); g.addColorStop(1, 'rgba(200,120,20,0)')
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
        })
        const tv = 0.025 + Math.sin(t * 13 + Math.sin(t * 6) * 3) * 0.012
        const tvg = ctx.createRadialGradient(W * 0.92, H * 0.5, 0, W * 0.92, H * 0.5, W * 0.3)
        tvg.addColorStop(0, `rgba(140,160,220,${tv})`); tvg.addColorStop(1, 'rgba(120,140,200,0)')
        ctx.fillStyle = tvg; ctx.fillRect(0, 0, W, H)
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [type])
  return <canvas ref={canvasRef} className="scene-canvas" />
}

function FeedbackNote({ text }) {
  const isGood = /^(great|nice|perfect|excellent|nailed|spot.on|brilliant|well done|exactly right)/i.test(text)
  return (
    <div className={`feedback-note ${isGood ? 'feedback-note-good' : 'feedback-note-tip'}`}>
      {text}
    </div>
  )
}

function SoundWave({ color }) {
  return (
    <div className="sound-wave">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="wave-bar" style={{ '--delay': `${i * 0.07}s`, '--accent': color }} />
      ))}
    </div>
  )
}

export default function ConversationScene({ scene, playerProfile, xp, streak, streakShields, onEnd, onExit }) {
  const [entryPhase, setEntryPhase] = useState(ENTRY.EXTERIOR)
  const [messages, setMessages] = useState([])
  const [charSpeaking, setCharSpeaking] = useState(false)
  const [userTurn, setUserTurn] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [mistakeCount, setMistakeCount] = useState(0)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [textInput, setTextInput] = useState('')
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [subtitleFading, setSubtitleFading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('am_mic_onboarded'))
  const [hintVisible, setHintVisible] = useState(false)
  const [hintText, setHintText] = useState('')
  const [hintLoading, setHintLoading] = useState(false)

  const historyRef = useRef([])
  const turnCount = useRef(0)
  const endingRef = useRef(false)
  const messagesEndRef = useRef(null)
  const lastSpokenRef = useRef('')
  const subtitleTimerRef = useRef(null)

  const ambientAudio = useAmbientAudio(scene.ambientType)
  const ambientAudioRef = useRef(ambientAudio)
  ambientAudioRef.current = ambientAudio

  const { listening, startListening, stopListening, error: micError, supported } = useSpeechRecognition()

  const systemPrompt = React.useMemo(() => {
    const base = scene.getSystemPrompt(playerProfile?.name, playerProfile?.origin, playerProfile?.difficulty)
    return base + COACHING_INSTRUCTION
  }, [scene.id, playerProfile])

  useEffect(() => {
    prefetchAudio(scene.openingLine, scene.character.voiceId)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = useCallback((role, content) => {
    setMessages(prev => [...prev, { role, content, id: Date.now() + Math.random() }])
    historyRef.current.push({ role, content })
  }, [])

  const addFeedbackNote = useCallback((text) => {
    setMessages(prev => [...prev, { role: 'feedback', content: text, id: Date.now() + Math.random() }])
  }, [])

  const characterSpeak = useCallback(async (text, giveFeedback = false) => {
    const { clean, feedback: fb } = extractFeedback(text)
    addMessage('assistant', clean)
    if (giveFeedback && fb) addFeedbackNote(fb)
    setCharSpeaking(true)
    setUserTurn(false)
    setStatusText('')
    lastSpokenRef.current = clean
    clearTimeout(subtitleTimerRef.current)
    setSubtitleVisible(true)
    setSubtitleFading(false)
    ambientAudioRef.current.duck?.()
    await speak(clean, scene.character.voiceId, null, () => {
      setCharSpeaking(false)
      ambientAudioRef.current.unduck?.()
      setSubtitleFading(true)
      subtitleTimerRef.current = setTimeout(() => {
        setSubtitleVisible(false)
        setSubtitleFading(false)
      }, 420)
    })
  }, [scene, addMessage, addFeedbackNote])

  const finishConversation = useCallback(() => {
    if (endingRef.current) return
    endingRef.current = true
    stopSpeaking(); stopListening(); ambientAudio.stop()
    onEnd(historyRef.current)
  }, [onEnd, stopListening, ambientAudio])

  const handleExit = useCallback(() => {
    stopSpeaking(); stopListening(); ambientAudio.stop()
    onExit()
  }, [onExit, stopListening, ambientAudio])

  const handleUserSpeech = useCallback(async (text) => {
    if (!text.trim() || endingRef.current) return
    const wrapUpIntent = /\b(let'?s go|ready|head off|shall we|lead the way|alright then|right then|off we go|yeah let'?s|sounds good|after you)\b/i
    if (scene.isIntroScene && wrapUpIntent.test(text) && turnCount.current >= 2) {
      addMessage('user', text)
      await characterSpeak("Sorted! Right, let's get you out of here — cab's just outside. Welcome to London properly, mate!")
      setTimeout(finishConversation, 2200)
      return
    }
    setLiveTranscript('')
    addMessage('user', text)
    setUserTurn(false)
    turnCount.current += 1

    const americanisms = /\b(elevator|apartment|trash|sidewalk|fries|candy|cookie|restroom|vacation|math\b|gotten\b)/i
    let newMistake = mistakeCount
    if (americanisms.test(text)) {
      newMistake = mistakeCount + 1
      setMistakeCount(newMistake)
      if (newMistake >= SURVIVAL_DOTS_TOTAL) {
        setStatusText('Too many Americanisms — scene ending...')
        setTimeout(finishConversation, 2200)
        return
      }
    }

    if (turnCount.current >= MAX_TURNS) { setTimeout(finishConversation, 500); return }

    setStatusText('Thinking...')
    try {
      const reply = await getCharacterReply(systemPrompt, historyRef.current)
      await characterSpeak(reply, true)
      setUserTurn(true)
      setStatusText('Your turn')
    } catch {
      setStatusText('Connection issue — try again')
      setUserTurn(true)
    }
  }, [addMessage, mistakeCount, systemPrompt, characterSpeak, finishConversation])

  // Entry sequence: tap exterior → push in → cross-fade → conversation starts
  const handleEntryTap = () => {
    if (entryPhase !== ENTRY.EXTERIOR) return
    setEntryPhase(ENTRY.ENTERING)
    if (scene.doorSound) playDoorBell()
    setTimeout(() => setEntryPhase(ENTRY.CROSSFADE), 1200)
    setTimeout(() => setEntryPhase(ENTRY.ARRIVED), 1800)
    setTimeout(async () => {
      setEntryPhase(ENTRY.STARTED)
      ambientAudio.start()
      await characterSpeak(scene.openingLine)
      setUserTurn(true)
      setStatusText('Your turn')
    }, 2400)
  }

  useEffect(() => {
    return () => {
      stopSpeaking(); stopListening(); ambientAudio.stop()
      clearTimeout(subtitleTimerRef.current)
    }
  }, [])

  const handleMicPress = () => {
    if (!userTurn || charSpeaking) return
    if (showOnboarding) { localStorage.setItem('am_mic_onboarded', '1'); setShowOnboarding(false) }
    setStatusText('Listening...')
    setLiveTranscript('')
    startListening(
      (finalText) => handleUserSpeech(finalText),
      (interim) => setLiveTranscript(interim)
    )
  }

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim() || !userTurn || charSpeaking) return
    const text = textInput.trim(); setTextInput('')
    handleUserSpeech(text)
  }, [textInput, userTurn, charSpeaking, handleUserSpeech])

  const handleHint = useCallback(async () => {
    if (!lastSpokenRef.current || hintLoading) return
    setHintVisible(true)
    setHintLoading(true)
    setHintText('')
    try {
      const explanation = await getHintExplanation(lastSpokenRef.current, scene.character.name)
      setHintText(explanation)
    } catch {
      setHintText('Could not load explanation right now.')
    } finally {
      setHintLoading(false)
    }
  }, [hintLoading, scene.character.name])

  const survivalDots = Array.from({ length: SURVIVAL_DOTS_TOTAL }, (_, i) => i >= mistakeCount)
  const isInScene = entryPhase === ENTRY.ARRIVED || entryPhase === ENTRY.STARTED

  return (
    <div className="scene" style={{ '--accent': scene.accentColor }}>

      {/* ── Entry sequence overlay ── */}
      {(entryPhase === ENTRY.EXTERIOR || entryPhase === ENTRY.ENTERING || entryPhase === ENTRY.CROSSFADE) && (
        <div
          className={`scene-entry ${entryPhase === ENTRY.ENTERING ? 'entering' : ''} ${entryPhase === ENTRY.CROSSFADE ? 'crossfade' : ''}`}
          onClick={handleEntryTap}
        >
          <img
            className="scene-entry-img"
            src={entryPhase === ENTRY.CROSSFADE ? scene.bgImage : (scene.exteriorImage || scene.bgImage)}
            alt=""
          />
          {entryPhase === ENTRY.EXTERIOR && (
            <>
              <div className="scene-entry-label">{scene.entryLabel || scene.name}</div>
              <div className="scene-entry-tap">Tap to enter</div>
            </>
          )}
        </div>
      )}

      {/* ── Scene background ── */}
      {isInScene && (
        <img className="scene-bg-img" src={scene.bgImage} alt="" />
      )}

      {/* ── Atmosphere particles ── */}
      {isInScene && <AtmosphereCanvas type={scene.canvasAtmosphere} />}

      {/* ── Vignette + bottom gradient ── */}
      {isInScene && (
        <>
          <div className="scene-vignette" />
          <div className="scene-bottom-grad" />
        </>
      )}

      {/* ── HUD ── */}
      {isInScene && (
        <HUD xp={xp} streak={streak} streakShields={streakShields} survivalDots={survivalDots} onExit={handleExit} />
      )}

      {/* ── Character ── */}
      {isInScene && (
        <div className="character-stage">
          <div className={`char-figure ${charSpeaking ? 'char-speaking' : ''}`}>
            <AnimatedCharacter character={scene.character} speaking={charSpeaking} />
          </div>
          <div className="char-label">
            <span className="char-label-name">{scene.character.name}</span>
            <span className="char-label-role">{scene.character.role}</span>
          </div>
          {charSpeaking && <SoundWave color={scene.accentColor} />}
        </div>
      )}

      {/* ── Prop (full english, pint, etc) ── */}
      {isInScene && scene.propImage && (
        <img className="scene-prop" src={scene.propImage} alt="" />
      )}

      {/* ── Subtitle ── */}
      {isInScene && subtitleVisible && (
        <div className={`char-subtitle-wrap ${subtitleFading ? 'subtitle-fading' : ''}`}>
          <div className="char-subtitle">"{lastSpokenRef.current}"</div>
        </div>
      )}

      {/* ── Messages ── */}
      {isInScene && (
        <div className="messages-wrap">
          <div className="messages">
            {messages.map(m => {
              if (m.role === 'feedback') return <FeedbackNote key={m.id} text={m.content} />
              return (
                <div key={m.id} className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-char'}`}
                  style={m.role === 'user' ? { display: 'flex', alignItems: 'flex-start', gap: 8 } : {}}>
                  {m.role === 'user' && playerProfile?.avatarSrc && (
                    <img src={playerProfile.avatarSrc} alt=""
                      style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(200,164,90,0.3)', marginTop: 2 }} />
                  )}
                  <div className="bubble-text">{m.content}</div>
                  {m.role === 'assistant' && (
                    <button className="btn-replay" onClick={() => speak(m.content, scene.character.voiceId, null, null)} title="Replay">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                  )}
                </div>
              )
            })}
            {liveTranscript && (
              <div className="bubble bubble-user bubble-live">
                <div className="bubble-text">{liveTranscript}<span className="cursor">|</span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      {isInScene && (
        <div className="scene-controls">
          {showOnboarding && userTurn && supported && (
            <div className="onboarding-hint">
              <span>Tap <strong>Speak</strong> to use your mic</span>
              <button className="onboarding-dismiss" onClick={() => {
                localStorage.setItem('am_mic_onboarded', '1'); setShowOnboarding(false)
              }}>Got it</button>
            </div>
          )}

          <div className="status-text">{micError || statusText}</div>

          {supported ? (
            <div className="mic-wrap">
              <button
                className={['mic-btn', listening ? 'mic-active' : '', userTurn && !charSpeaking && !listening ? 'mic-ready' : '', !userTurn || charSpeaking ? 'mic-disabled' : ''].filter(Boolean).join(' ')}
                onClick={handleMicPress}
                onPointerDown={() => navigator.vibrate?.(10)}
                disabled={!userTurn || charSpeaking || listening}
              >
                {listening ? (
                  <div className="mic-wave">
                    {[...Array(5)].map((_, i) => <span key={i} className="mic-wave-bar" style={{ '--i': i }} />)}
                  </div>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V20H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 11h-2z" />
                  </svg>
                )}
              </button>
              {!listening && <span className="mic-label">Speak</span>}
            </div>
          ) : (
            userTurn && !charSpeaking && (
              <div className="text-input-row">
                <input className="text-input" type="text" placeholder="Type your reply..." value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleTextSubmit() }} autoFocus />
                <button className="btn-send" onClick={handleTextSubmit} disabled={!textInput.trim()}>Send</button>
              </div>
            )
          )}

          {hintVisible && (
            <div style={{
              background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(200,164,90,0.25)',
              borderRadius: 8, padding: '10px 14px', maxWidth: 360, fontSize: 13,
              color: hintLoading ? 'rgba(200,164,90,0.5)' : '#d0c8b8', lineHeight: 1.55,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ color: '#C8A45A', fontSize: 11, fontWeight: 600, letterSpacing: 1, whiteSpace: 'nowrap', marginTop: 1 }}>WHAT?</span>
              <span style={{ flex: 1 }}>{hintLoading ? 'Looking it up...' : hintText}</span>
              <button onClick={() => setHintVisible(false)} style={{ background: 'none', border: 'none', color: '#5a4a3a', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
          )}
          <div className="controls-row">
            {listening && <button className="btn-secondary" onClick={stopListening}>Done</button>}
            {userTurn && !listening && messages.some(m => m.role === 'assistant') && (
              <button className="btn-secondary" onClick={handleHint} disabled={hintLoading}>
                What did they mean?
              </button>
            )}
            {userTurn && !listening && (
              <button className="btn-secondary" onClick={finishConversation}>
                End scene
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
