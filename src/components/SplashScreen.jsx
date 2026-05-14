import React, { useEffect, useRef, useState } from 'react'
import { speak } from '../services/elevenLabsService'

const NARRATOR_VOICE = import.meta.env.VITE_VOICE_NARRATOR

const INTRO_LINE = "Welcome to Alright Mate. London's waiting. Don't embarrass yourself."

export default function SplashScreen({ onEnter }) {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const W = canvas.width
    const H = canvas.height

    const particles = []
    // Union Jack bokeh particles
    const colors = ['rgba(196,30,58,', 'rgba(0,25,168,', 'rgba(255,255,255,']
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 3 + Math.random() * 18,
        speed: 0.15 + Math.random() * 0.4,
        drift: (Math.random() - 0.5) * 0.3,
        alpha: 0.04 + Math.random() * 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      })
    }

    let t = 0
    let raf
    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      // Background radial glow
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.5, W * 0.8)
      bg.addColorStop(0, '#1a0a0e')
      bg.addColorStop(0.5, '#0f0608')
      bg.addColorStop(1, '#080304')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Bokeh
      particles.forEach(p => {
        p.y -= p.speed
        p.x += p.drift
        if (p.y < -p.r * 2) { p.y = H + p.r; p.x = Math.random() * W }
        const a = p.alpha * (0.6 + 0.4 * Math.sin(t * 0.8 + p.phase))
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
        g.addColorStop(0, p.color + a + ')')
        g.addColorStop(1, p.color + '0)')
        ctx.fillStyle = g
        ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
      })

      // Central gold glow
      const centre = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.3)
      centre.addColorStop(0, `rgba(200,164,90,${0.06 + Math.sin(t * 0.6) * 0.02})`)
      centre.addColorStop(1, 'rgba(200,164,90,0)')
      ctx.fillStyle = centre
      ctx.fillRect(0, 0, W, H)

      raf = requestAnimationFrame(draw)
    }
    draw()

    // Fade in ready after short delay
    const timer = setTimeout(() => setReady(true), 600)

    return () => { cancelAnimationFrame(raf); clearTimeout(timer) }
  }, [])

  const handleEnter = async () => {
    setSpeaking(true)
    try {
      await speak(INTRO_LINE, NARRATOR_VOICE, null, () => {
        setSpeaking(false)
        onEnter()
      })
    } catch {
      setSpeaking(false)
      onEnter()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f0608',
      fontFamily: 'Inter, sans-serif',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
        {/* British flag accent lines */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg, transparent, #C8A45A)' }} />
          <div style={{ fontSize: 22, letterSpacing: 8, color: '#C8A45A', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            🇬🇧
          </div>
          <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg, #C8A45A, transparent)' }} />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(48px, 12vw, 96px)',
          fontWeight: 900,
          color: '#F5F0E8',
          lineHeight: 1,
          letterSpacing: '-2px',
          margin: '0 0 8px',
          textShadow: '0 2px 40px rgba(200,164,90,0.3)',
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}>
          ALRIGHT
        </h1>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(48px, 12vw, 96px)',
          fontWeight: 900,
          color: '#C8A45A',
          lineHeight: 1,
          letterSpacing: '-2px',
          margin: '0 0 24px',
          textShadow: '0 2px 40px rgba(200,164,90,0.4)',
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
        }}>
          MATE
        </h1>

        <p style={{
          color: '#a09080',
          fontSize: 15,
          letterSpacing: 3,
          textTransform: 'uppercase',
          margin: '0 0 48px',
          fontWeight: 500,
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.8s ease 0.3s',
        }}>
          Learn British English in London
        </p>

        <button
          onClick={handleEnter}
          disabled={speaking}
          style={{
            background: speaking ? '#2a2018' : 'transparent',
            border: '2px solid #C8A45A',
            color: '#C8A45A',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: 'uppercase',
            padding: '16px 40px',
            cursor: speaking ? 'wait' : 'pointer',
            borderRadius: 2,
            transition: 'all 0.2s',
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0)' : 'translateY(8px)',
          }}
          onMouseEnter={e => { if (!speaking) { e.target.style.background = '#C8A45A'; e.target.style.color = '#0f0608' } }}
          onMouseLeave={e => { e.target.style.background = speaking ? '#2a2018' : 'transparent'; e.target.style.color = '#C8A45A' }}
        >
          {speaking ? 'Loading...' : "Let's Go →"}
        </button>

        <p style={{ color: '#4a4040', fontSize: 12, marginTop: 32, letterSpacing: 1 }}>
          Phase 1: London · 3 locations · 9 characters
        </p>
      </div>
    </div>
  )
}
