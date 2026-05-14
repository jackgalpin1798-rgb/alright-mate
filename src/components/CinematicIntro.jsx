import React, { useEffect, useRef, useState } from 'react'
import { speak } from '../services/elevenLabsService'

const NARRATOR_VOICE = import.meta.env.VITE_VOICE_NARRATOR
const BILLY_VOICE = import.meta.env.VITE_VOICE_BILLY

const PHASE = { CLOUDS: 0, DESCENT: 1, TAXI: 2 }

const NARRATOR_LINES = [
  "London. Eight million people. One language. Spoken entirely differently by every single one of them.",
  "You've got the basics. But down there — that's where English gets interesting.",
]

const BILLY_LINE = "Oi oi! Yeah that's me down in arrivals. Can't miss me — I'm the one holding the sign with the spelling mistake. See ya in a minute, yeah? Alright!"

function wait(ms) { return new Promise(r => setTimeout(r, ms)) }
function speakLine(voiceId, text) { return new Promise(r => speak(text, voiceId, null, r)) }

export default function CinematicIntro({ playerName, onComplete }) {
  const [phase, setPhase] = useState(PHASE.CLOUDS)
  const [subtitle, setSubtitle] = useState('')
  const [subtitleOn, setSubtitleOn] = useState(false)
  const [skippable, setSkippable] = useState(false)
  const cancelledRef = useRef(false)

  const skip = () => { if (skippable) { cancelledRef.current = true; onComplete() } }

  useEffect(() => {
    cancelledRef.current = false
    const skippableTimer = setTimeout(() => setSkippable(true), 2000)

    async function run() {
      setPhase(PHASE.CLOUDS)
      await wait(600)

      for (const line of NARRATOR_LINES) {
        if (cancelledRef.current) return
        setSubtitle(line); setSubtitleOn(true)
        await speakLine(NARRATOR_VOICE, line)
        if (cancelledRef.current) return
        setSubtitleOn(false); await wait(500)
      }

      if (cancelledRef.current) return
      setPhase(PHASE.DESCENT); await wait(2200)

      if (cancelledRef.current) return
      setPhase(PHASE.TAXI); await wait(400)
      setSubtitle(BILLY_LINE); setSubtitleOn(true)
      await speakLine(BILLY_VOICE, BILLY_LINE)
      if (cancelledRef.current) return
      setSubtitleOn(false); await wait(400)
      if (!cancelledRef.current) onComplete()
    }

    run()
    return () => { cancelledRef.current = true; clearTimeout(skippableTimer) }
  }, [])

  const bgSrc = phase === PHASE.TAXI
    ? '/assets/scenes/taxi_interior.png'
    : phase === PHASE.DESCENT
      ? '/assets/scenes/plane_descent_london.png'
      : '/assets/scenes/plane_window_clouds.png'

  return (
    <div
      onClick={skip}
      style={{
        position: 'fixed', inset: 0, background: '#000', overflow: 'hidden',
        fontFamily: "'Inter', sans-serif", cursor: skippable ? 'pointer' : 'default',
      }}
    >
      {/* Background */}
      <img
        key={bgSrc}
        src={bgSrc}
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          animation: phase === PHASE.CLOUDS
            ? 'cinemaDrift 10s ease-in-out infinite alternate'
            : 'cinemaFadeIn 1.2s ease',
        }}
      />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Letterbox bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8%', background: '#000' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8%', background: '#000' }} />

      {/* London title card on descent */}
      {phase === PHASE.DESCENT && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -55%)',
          textAlign: 'center', animation: 'cinemaTitleIn 0.9s ease',
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 7vw, 60px)',
            fontWeight: 700, color: '#F5F0E8',
            textShadow: '0 2px 30px rgba(0,0,0,0.9)',
            letterSpacing: 6, textTransform: 'uppercase',
          }}>
            London
          </div>
          <div style={{
            color: 'rgba(200,164,90,0.75)', fontSize: 13,
            letterSpacing: 5, marginTop: 10, textTransform: 'uppercase',
          }}>
            51°30′N · 0°7′W
          </div>
        </div>
      )}

      {/* Billy phone notification on taxi */}
      {phase === PHASE.TAXI && (
        <div style={{
          position: 'absolute', top: '14%', right: '6%', maxWidth: 230,
          background: 'rgba(10,8,4,0.88)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16, padding: '14px 16px',
          backdropFilter: 'blur(16px)',
          animation: 'cinemaFadeIn 0.5s ease',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <img src="/assets/characters/billy_neutral.png" alt=""
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(200,164,90,0.4)' }}
              onError={e => e.target.style.display = 'none'}
            />
            <div>
              <div style={{ color: '#F5F0E8', fontSize: 13, fontWeight: 600 }}>Billy</div>
              <div style={{ color: 'rgba(200,164,90,0.6)', fontSize: 10, letterSpacing: 1 }}>now</div>
            </div>
          </div>
          <div style={{ color: 'rgba(245,240,232,0.85)', fontSize: 13, lineHeight: 1.55 }}>
            {BILLY_LINE}
          </div>
        </div>
      )}

      {/* Subtitle */}
      <div style={{
        position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)',
        width: '88%', maxWidth: 560, textAlign: 'center',
        opacity: subtitleOn ? 1 : 0, transition: 'opacity 0.45s ease',
        zIndex: 5,
      }}>
        <span style={{
          background: 'rgba(0,0,0,0.72)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, color: '#F5F0E8',
          fontSize: 'clamp(14px, 3.2vw, 17px)',
          fontStyle: 'italic', lineHeight: 1.65,
          padding: '10px 18px', display: 'inline-block',
        }}>
          {subtitle}
        </span>
      </div>

      {/* Skip hint */}
      {skippable && (
        <div style={{
          position: 'absolute', bottom: '10%', right: 24,
          color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: 2.5,
          textTransform: 'uppercase',
        }}>
          Tap to skip
        </div>
      )}

      <style>{`
        @keyframes cinemaDrift {
          from { transform: scale(1) translateX(0); }
          to   { transform: scale(1.06) translateX(-14px); }
        }
        @keyframes cinemaFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cinemaTitleIn {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to   { opacity: 1; transform: translate(-50%, -55%); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
      `}</style>
    </div>
  )
}
