import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getCharacterReply } from '../services/claudeService'
import { speak, stopSpeaking, prefetchAudio } from '../services/elevenLabsService'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useAmbientAudio } from '../hooks/useAmbientAudio'
import AnimatedCharacter from './AnimatedCharacter'
import HUD from './HUD'
import { getMemory } from '../lib/memory'
import './ConversationScene.css'

const MAX_TURNS = 8
const SURVIVAL_DOTS_TOTAL = 3

const COACHING_INSTRUCTION = `\n\nCOACHING: After your in-character response, add a new line starting with exactly "FEEDBACK:" followed by one coaching sentence in English. If they used good British slang or got something right, praise it specifically. If they made a mistake (used American English, wrong idiom, unnatural phrasing), give a gentle correction. Keep it to one sentence. Example: "FEEDBACK: Nailed it — 'cheers' is exactly right here." or "FEEDBACK: In British English, say 'chips' not 'fries'."`

function extractFeedback(text) {
  const lines = text.split('\n')
  const idx = lines.findIndex(l => /^FEEDBACK:/i.test(l.trim()))
  if (idx === -1) return { clean: text.trim(), feedback: null }
  return {
    clean: lines.slice(0, idx).join('\n').trim(),
    feedback: lines[idx].replace(/^FEEDBACK:\s*/i, '').trim(),
  }
}

function SceneCanvas({ atmosphereType }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const particles = []
    const W = canvas.width, H = canvas.height

    if (atmosphereType === 'heathrow') {
      // Traveller silhouettes
      for (let i = 0; i < 20; i++) {
        particles.push({
          type: 'person',
          x: Math.random() * W,
          y: H * (0.55 + Math.random() * 0.3),
          h: 18 + Math.random() * 28,
          speed: (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1),
          alpha: 0.25 + Math.random() * 0.35,
        })
      }
    } else if (atmosphereType === 'caff') {
      // Steam particles
      for (let i = 0; i < 25; i++) {
        particles.push({
          type: 'steam',
          x: W * (0.35 + Math.random() * 0.5),
          y: H + Math.random() * 80,
          r: 2 + Math.random() * 5,
          speed: 0.4 + Math.random() * 0.8,
          drift: (Math.random() - 0.5) * 0.4,
          alpha: 0.3 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
        })
      }
    } else if (atmosphereType === 'pub') {
      // Amber bokeh lights
      for (let i = 0; i < 18; i++) {
        particles.push({
          type: 'bokeh',
          x: Math.random() * W,
          y: Math.random() * H * 0.7,
          r: 15 + Math.random() * 40,
          alpha: 0.04 + Math.random() * 0.08,
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.6,
        })
      }
    }

    let t = 0
    let raf

    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      if (atmosphereType === 'heathrow') {
        // Fluorescent bokeh
        const bokeh = [0.1, 0.3, 0.6, 0.85]
        bokeh.forEach((bx, i) => {
          const a = 0.06 + Math.sin(t * 0.5 + i * 1.2) * 0.02
          const g = ctx.createRadialGradient(W * bx, H * 0.08, 0, W * bx, H * 0.08, 50)
          g.addColorStop(0, `rgba(240,240,210,${a})`)
          g.addColorStop(1, 'rgba(230,230,200,0)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, W, H)
        })
        // Traveller silhouettes
        particles.forEach(p => {
          p.x += p.speed
          if (p.x > W + 20) p.x = -20
          if (p.x < -20) p.x = W + 20
          ctx.fillStyle = `rgba(8,6,4,${p.alpha})`
          ctx.fillRect(p.x - 4, p.y - p.h, 8, p.h)
          ctx.beginPath(); ctx.arc(p.x, p.y - p.h - 6, 6, 0, Math.PI * 2); ctx.fill()
        })
        // Departures board flicker at top
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(W * 0.3, H * 0.02, W * 0.4, H * 0.06)
        ctx.fillStyle = `rgba(255,140,50,${0.6 + Math.sin(t * 8) * 0.2})`
        ctx.font = `${Math.round(H * 0.022)}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('ARRIVALS ✈', W / 2, H * 0.05)
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'

      } else if (atmosphereType === 'caff') {
        // Warm grill glow
        const glow = ctx.createRadialGradient(W * 0.82, H * 0.9, 0, W * 0.82, H * 0.9, W * 0.5)
        const gp = 0.07 + Math.sin(t * 2.3) * 0.02
        glow.addColorStop(0, `rgba(255,130,30,${gp})`)
        glow.addColorStop(1, 'rgba(255,80,0,0)')
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, W, H)
        // Steam
        particles.forEach(p => {
          p.y -= p.speed
          p.x += p.drift + Math.sin(t * 0.8 + p.phase) * 0.3
          if (p.y < -p.r * 2) { p.y = H * 0.95; p.x = W * (0.35 + Math.random() * 0.5) }
          const a = p.alpha * (0.4 + 0.6 * (1 - (H - p.y) / H))
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (2 + (H - p.y) / H * 3))
          g.addColorStop(0, `rgba(220,215,210,${a})`)
          g.addColorStop(1, 'rgba(220,215,210,0)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, W, H)
        })
        // Condensation on window edges
        ctx.fillStyle = `rgba(140,180,200,${0.04 + Math.sin(t * 0.2) * 0.01})`
        ctx.fillRect(0, 0, 12, H)
        ctx.fillRect(W - 12, 0, 12, H)

      } else if (atmosphereType === 'pub') {
        // Amber bokeh
        particles.forEach(p => {
          const a = p.alpha * (0.6 + 0.4 * Math.sin(t * p.speed + p.phase))
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
          g.addColorStop(0, `rgba(255,170,50,${a})`)
          g.addColorStop(1, 'rgba(200,120,20,0)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, W, H)
        })
        // TV flicker from corner
        const tvFlicker = 0.04 + Math.sin(t * 13 + Math.sin(t * 6.3) * 4) * 0.025
        const tvg = ctx.createRadialGradient(W * 0.92, H * 0.55, 0, W * 0.92, H * 0.55, W * 0.3)
        tvg.addColorStop(0, `rgba(130,150,220,${tvFlicker})`)
        tvg.addColorStop(1, 'rgba(110,130,200,0)')
        ctx.fillStyle = tvg
        ctx.fillRect(0, 0, W, H)
        // Pub haze
        const haze = ctx.createLinearGradient(0, H * 0.4, 0, H)
        haze.addColorStop(0, 'rgba(100,65,20,0)')
        haze.addColorStop(1, `rgba(60,35,8,${0.07 + Math.sin(t * 0.18) * 0.015})`)
        ctx.fillStyle = haze
        ctx.fillRect(0, 0, W, H)
      }

      // Vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.15, W / 2, H / 2, W * 0.75)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.6)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [atmosphereType])

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
  const [started, setStarted] = useState(false)
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
    const base = scene.getSystemPrompt(playerProfile?.name, playerProfile?.origin)
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
    stopSpeaking()
    stopListening()
    ambientAudio.stop()
    onEnd(historyRef.current)
  }, [onEnd, stopListening, ambientAudio])

  const handleExit = useCallback(() => {
    stopSpeaking()
    stopListening()
    ambientAudio.stop()
    onExit()
  }, [onExit, stopListening, ambientAudio])

  const handleUserSpeech = useCallback(async (text) => {
    if (!text.trim() || endingRef.current) return
    setLiveTranscript('')
    addMessage('user', text)
    setUserTurn(false)
    turnCount.current += 1

    // Simple mistake detection: using American English
    const americanisms = /\b(elevator|apartment|trash|sidewalk|fries|candy|cookie|restroom|vacation|math\b|gotten|gotten\b)/i
    const isMistake = americanisms.test(text)
    let newMistake = mistakeCount
    if (isMistake) {
      newMistake = mistakeCount + 1
      setMistakeCount(newMistake)
      if (newMistake >= SURVIVAL_DOTS_TOTAL) {
        setStatusText('Too many Americanisms! Scene ending...')
        setTimeout(finishConversation, 2200)
        return
      }
    }

    if (turnCount.current >= MAX_TURNS) {
      setTimeout(finishConversation, 500)
      return
    }

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

  const handleStart = async () => {
    setStarted(true)
    ambientAudio.start()
    await characterSpeak(scene.openingLine)
    setUserTurn(true)
    setStatusText('Your turn')
  }

  useEffect(() => {
    return () => {
      stopSpeaking()
      stopListening()
      ambientAudio.stop()
      clearTimeout(subtitleTimerRef.current)
    }
  }, [])

  const handleMicPress = () => {
    if (!userTurn || charSpeaking) return
    if (showOnboarding) {
      localStorage.setItem('am_mic_onboarded', '1')
      setShowOnboarding(false)
    }
    setStatusText('Listening...')
    setLiveTranscript('')
    startListening(
      (finalText) => handleUserSpeech(finalText),
      (interim) => setLiveTranscript(interim)
    )
  }

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim() || !userTurn || charSpeaking) return
    const text = textInput.trim()
    setTextInput('')
    handleUserSpeech(text)
  }, [textInput, userTurn, charSpeaking, handleUserSpeech])

  const survivalDots = Array.from({ length: SURVIVAL_DOTS_TOTAL }, (_, i) => i >= mistakeCount)

  return (
    <div className="scene" style={{ '--accent': scene.accentColor }}>
      {/* Backgrounds */}
      <div className="scene-bg" style={{ background: scene.bgGradient }} />
      {scene.bgPhoto && (
        <div className="scene-photo" style={{ backgroundImage: `url(${scene.bgPhoto})` }} />
      )}
      {scene.bgPhoto && <div className="scene-photo-dim" />}
      <SceneCanvas atmosphereType={scene.canvasAtmosphere} />
      <div className="scene-vignette" />

      {/* HUD */}
      <HUD
        xp={xp}
        streak={streak}
        streakShields={streakShields}
        survivalDots={survivalDots}
        onExit={handleExit}
      />

      {/* Start overlay */}
      {!started && (
        <div className="start-overlay" onClick={handleStart}>
          <div className="start-scene-name">{scene.name}</div>
          <div className="start-location">{scene.subtitle}</div>
          <div className="start-char-name">{scene.character.name}</div>
          <div className="start-char-role">{scene.character.role}</div>
          <div className="start-tap-btn"><span>Tap to enter</span></div>
        </div>
      )}

      {/* Character stage */}
      <div className="character-stage">
        <div className="char-halo" style={{ background: `radial-gradient(circle, ${scene.accentColor}55 0%, transparent 70%)` }} />
        <div className={`char-figure ${charSpeaking ? 'char-speaking' : ''}`}>
          <AnimatedCharacter
            character={scene.character}
            speaking={charSpeaking}
            size={180}
          />
        </div>
        <div className="char-label">
          <span className="char-label-name">{scene.character.name}</span>
          <span className="char-label-role">{scene.character.role}</span>
        </div>
        {charSpeaking && <SoundWave color={scene.accentColor} />}
      </div>

      {/* Subtitle */}
      {subtitleVisible && (
        <div className={`char-subtitle-wrap ${subtitleFading ? 'subtitle-fading' : ''}`}>
          <div className="char-subtitle">{lastSpokenRef.current}</div>
        </div>
      )}

      {/* Messages */}
      <div className="messages-wrap">
        <div className="messages">
          {messages.map(m => {
            if (m.role === 'feedback') return <FeedbackNote key={m.id} text={m.content} />
            return (
              <div key={m.id} className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-char'}`}>
                <div className="bubble-text">{m.content}</div>
                {m.role === 'assistant' && (
                  <button
                    className="btn-replay"
                    onClick={() => speak(m.content, scene.character.voiceId, null, null)}
                    title="Replay"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
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

      {/* Controls */}
      <div className="scene-controls">
        {showOnboarding && userTurn && supported && (
          <div className="onboarding-hint">
            <span>Tap <strong>Speak</strong> to use your mic — browser will ask permission</span>
            <button className="onboarding-dismiss" onClick={() => {
              localStorage.setItem('am_mic_onboarded', '1')
              setShowOnboarding(false)
            }}>Got it</button>
          </div>
        )}

        <div className="status-text">{micError || statusText}</div>

        {supported ? (
          <div className="mic-wrap">
            <button
              className={[
                'mic-btn',
                listening ? 'mic-active' : '',
                userTurn && !charSpeaking && !listening ? 'mic-ready' : '',
                !userTurn || charSpeaking ? 'mic-disabled' : '',
              ].filter(Boolean).join(' ')}
              onClick={handleMicPress}
              onPointerDown={() => navigator.vibrate?.(10)}
              disabled={!userTurn || charSpeaking || listening}
            >
              {listening ? (
                <div className="mic-wave">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="mic-wave-bar" style={{ '--i': i }} />
                  ))}
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
              <input
                className="text-input"
                type="text"
                placeholder="Type your reply..."
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTextSubmit() }}
                autoFocus
              />
              <button className="btn-send" onClick={handleTextSubmit} disabled={!textInput.trim()}>
                Send
              </button>
            </div>
          )
        )}

        <div className="controls-row">
          {listening && <button className="btn-secondary" onClick={stopListening}>Done</button>}
          {userTurn && !listening && (
            <button className="btn-secondary" onClick={finishConversation}>
              End scene ({MAX_TURNS - turnCount.current} turns left)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
