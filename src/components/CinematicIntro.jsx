import React, { useEffect, useRef, useState } from 'react'
import { speak } from '../services/elevenLabsService'

const NARRATOR_VOICE = import.meta.env.VITE_VOICE_NARRATOR
const BILLY_VOICE = import.meta.env.VITE_VOICE_BILLY

const NARRATOR_LINES = [
  "London. A city of 9 million people who all know exactly what they mean.",
  "You are not one of them. Yet.",
]

const BILLY_CINEMATIC_LINE = "Oi. You made it then. Right, let's get you sorted, shall we?"

export default function CinematicIntro({ playerName, onComplete }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState(0) // 0=city-title, 1=narrator, 2=billy, 3=done
  const [lineIndex, setLineIndex] = useState(0)
  const [text, setText] = useState('')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth || window.innerWidth
    canvas.height = canvas.offsetHeight || window.innerHeight
    const W = canvas.width, H = canvas.height

    let t = 0
    let raf

    // City silhouette points (London skyline — simplified)
    const skyline = [
      // Left buildings
      { x: 0, y: H }, { x: 0, y: H * 0.72 }, { x: W * 0.04, y: H * 0.72 },
      { x: W * 0.04, y: H * 0.65 }, { x: W * 0.08, y: H * 0.65 },
      { x: W * 0.08, y: H * 0.7 }, { x: W * 0.11, y: H * 0.7 },
      { x: W * 0.11, y: H * 0.58 }, // Taller
      // BT Tower-ish
      { x: W * 0.14, y: H * 0.58 }, { x: W * 0.14, y: H * 0.38 },
      { x: W * 0.152, y: H * 0.38 }, { x: W * 0.152, y: H * 0.42 },
      { x: W * 0.16, y: H * 0.42 }, { x: W * 0.16, y: H * 0.62 },
      { x: W * 0.2, y: H * 0.62 }, { x: W * 0.2, y: H * 0.55 },
      { x: W * 0.24, y: H * 0.55 }, { x: W * 0.24, y: H * 0.68 },
      // Centre — Shard
      { x: W * 0.3, y: H * 0.68 }, { x: W * 0.32, y: H * 0.28 },
      { x: W * 0.34, y: H * 0.68 }, { x: W * 0.38, y: H * 0.68 },
      { x: W * 0.38, y: H * 0.55 }, { x: W * 0.42, y: H * 0.55 },
      { x: W * 0.42, y: H * 0.6 },
      // Gherkin-ish
      { x: W * 0.47, y: H * 0.6 }, { x: W * 0.48, y: H * 0.45 },
      { x: W * 0.5, y: H * 0.42 }, { x: W * 0.52, y: H * 0.45 },
      { x: W * 0.53, y: H * 0.6 }, { x: W * 0.56, y: H * 0.6 },
      { x: W * 0.56, y: H * 0.52 }, { x: W * 0.6, y: H * 0.52 },
      { x: W * 0.6, y: H * 0.65 }, { x: W * 0.64, y: H * 0.65 },
      // Canary Wharf side
      { x: W * 0.64, y: H * 0.55 }, { x: W * 0.67, y: H * 0.35 },
      { x: W * 0.69, y: H * 0.35 }, { x: W * 0.69, y: H * 0.55 },
      { x: W * 0.72, y: H * 0.55 }, { x: W * 0.72, y: H * 0.62 },
      { x: W * 0.78, y: H * 0.62 }, { x: W * 0.78, y: H * 0.7 },
      { x: W * 0.85, y: H * 0.7 }, { x: W * 0.85, y: H * 0.75 },
      { x: W, y: H * 0.75 }, { x: W, y: H },
    ]

    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#04010a')
      sky.addColorStop(0.5, '#0a0416')
      sky.addColorStop(1, '#160a02')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // Stars
      for (let i = 0; i < 80; i++) {
        const sx = (Math.sin(i * 127.3) * 0.5 + 0.5) * W
        const sy = (Math.sin(i * 83.7) * 0.5 + 0.5) * H * 0.6
        const sa = 0.3 + 0.4 * Math.sin(t * (1 + i * 0.1) + i)
        ctx.fillStyle = `rgba(255,255,255,${sa})`
        ctx.beginPath()
        ctx.arc(sx, sy, 0.6, 0, Math.PI * 2)
        ctx.fill()
      }

      // Thames glow
      const thames = ctx.createLinearGradient(0, H * 0.72, 0, H)
      thames.addColorStop(0, `rgba(30,50,80,${0.3 + Math.sin(t * 0.3) * 0.05})`)
      thames.addColorStop(1, 'rgba(10,20,40,0.6)')
      ctx.fillStyle = thames
      ctx.fillRect(0, H * 0.72, W, H * 0.28)

      // Water shimmer
      for (let i = 0; i < 15; i++) {
        const wx = (i / 15) * W + Math.sin(t * 1.2 + i) * 20
        const wy = H * 0.78 + Math.sin(t * 0.8 + i * 0.7) * 5
        ctx.strokeStyle = `rgba(80,120,180,${0.1 + Math.sin(t * 2 + i) * 0.06})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(wx, wy)
        ctx.lineTo(wx + 30, wy)
        ctx.stroke()
      }

      // London city silhouette
      ctx.fillStyle = '#04010a'
      ctx.beginPath()
      ctx.moveTo(skyline[0].x, skyline[0].y)
      skyline.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.closePath()
      ctx.fill()

      // Window lights in buildings
      const buildingDark = '#04010a'
      for (let i = 0; i < 60; i++) {
        const wx = (Math.sin(i * 93.1) * 0.5 + 0.5) * W
        const wy = (Math.sin(i * 57.3) * 0.5 + 0.5) * H * 0.65
        // Check if this point is in the skyline (approximate — just render all, they clip naturally)
        const wa = 0.4 + 0.5 * Math.sin(t * (0.2 + i * 0.05) + i)
        const wcolor = Math.random() > 0.7 ? `rgba(255,220,150,${wa * 0.6})` : `rgba(200,220,255,${wa * 0.4})`
        ctx.fillStyle = wcolor
        ctx.fillRect(wx, wy, 2, 3)
      }

      // Red bus silhouette crossing left to right
      const busX = ((t * 18) % (W + 100)) - 60
      const busY = H * 0.74
      ctx.fillStyle = '#C41E3A'
      ctx.fillRect(busX, busY - 18, 55, 18)
      ctx.fillStyle = '#a01830'
      ctx.fillRect(busX, busY - 32, 55, 14)
      ctx.fillStyle = '#f0e8d0'
      for (let w = 0; w < 5; w++) {
        ctx.fillRect(busX + 4 + w * 10, busY - 28, 6, 8)
      }
      // Wheels
      ctx.fillStyle = '#1a1a1a'
      ctx.beginPath(); ctx.arc(busX + 12, busY + 2, 6, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(busX + 43, busY + 2, 6, 0, Math.PI * 2); ctx.fill()

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  // Sequence the cinematic
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      // Phase 0: show city title
      await new Promise(r => setTimeout(r, 2000))
      if (cancelled) return

      // Phase 1: narrator speaks
      setPhase(1)
      for (let i = 0; i < NARRATOR_LINES.length; i++) {
        if (cancelled) return
        setText(NARRATOR_LINES[i])
        setVisible(true)
        await new Promise(res => {
          speak(NARRATOR_LINES[i], NARRATOR_VOICE, null, res).catch(res)
        })
        if (cancelled) return
        await new Promise(r => setTimeout(r, 800))
        if (i < NARRATOR_LINES.length - 1) {
          setVisible(false)
          await new Promise(r => setTimeout(r, 500))
        }
      }

      // Phase 2: Billy speaks
      if (cancelled) return
      setVisible(false)
      await new Promise(r => setTimeout(r, 400))
      setPhase(2)
      setText(BILLY_CINEMATIC_LINE)
      setVisible(true)
      await new Promise(res => {
        speak(BILLY_CINEMATIC_LINE, BILLY_VOICE, null, res).catch(res)
      })
      if (cancelled) return
      await new Promise(r => setTimeout(r, 1200))
      if (!cancelled) onComplete()
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#04010a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* City title */}
      {phase === 0 && (
        <div style={{
          position: 'relative', zIndex: 1, textAlign: 'center',
          animation: 'fadeIn 1s ease',
        }}>
          <div style={{ color: '#7a6a5a', fontSize: 12, letterSpacing: 6, textTransform: 'uppercase', marginBottom: 8 }}>
            You are arriving in
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(52px, 12vw, 100px)',
            fontWeight: 900,
            color: '#F5F0E8',
            letterSpacing: 4,
            margin: 0,
            textShadow: '0 0 60px rgba(200,164,90,0.3)',
          }}>
            LONDON
          </h1>
          <div style={{ width: 80, height: 2, background: '#C8A45A', margin: '16px auto 0' }} />
        </div>
      )}

      {/* Narrator / Billy text */}
      {phase >= 1 && (
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 560,
          textAlign: 'center',
          zIndex: 1,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}>
          {phase === 2 && (
            <div style={{ color: '#C8A45A', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
              Billy
            </div>
          )}
          <p style={{
            fontFamily: phase === 2 ? 'Inter, sans-serif' : "'Playfair Display', serif",
            fontSize: phase === 2 ? 18 : 22,
            color: '#F5F0E8',
            lineHeight: 1.5,
            margin: 0,
            textShadow: '0 2px 20px rgba(0,0,0,0.8)',
          }}>
            {text}
          </p>
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={onComplete}
        style={{
          position: 'absolute',
          top: 20, right: 20,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 4,
          color: '#7a6a5a',
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          letterSpacing: 1,
          padding: '8px 16px',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        Skip →
      </button>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
