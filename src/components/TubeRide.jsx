import React, { useEffect, useRef, useState } from 'react'
import { useAmbientAudio } from '../hooks/useAmbientAudio'
import { SCENES } from '../data/scenes'

const STATION_SEQUENCE = [
  'Heathrow T5', 'Hammersmith', 'Earl\'s Court', 'South Kensington',
  'Knightsbridge', 'Hyde Park Corner', 'Green Park', 'Oxford Circus',
  'Bethnal Green', 'Mile End', 'Bow Road', 'Shoreditch High St'
]

export default function TubeRide({ destinationId, onArrived }) {
  const canvasRef = useRef(null)
  const audio = useAmbientAudio('tube')
  const [progress, setProgress] = useState(0)
  const [stationFlash, setStationFlash] = useState(null)
  const scene = SCENES[destinationId]

  useEffect(() => {
    audio.start()
    return () => audio.stop()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth || window.innerWidth
    canvas.height = canvas.offsetHeight || window.innerHeight
    const W = canvas.width, H = canvas.height

    let t = 0
    let raf

    // Tunnel strip lights
    const lights = []
    for (let i = 0; i < 20; i++) {
      lights.push({ x: (i / 20) * W * 1.5 - W * 0.25, speed: 6 + Math.random() * 2 })
    }

    // Seat texture points
    const seats = []
    for (let i = 0; i < 8; i++) {
      seats.push({ x: W * 0.05 + (i / 7) * W * 0.9, active: Math.random() > 0.6 })
    }

    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      // Carriage interior — dark walls
      ctx.fillStyle = '#0d0c0b'
      ctx.fillRect(0, 0, W, H)

      // Window frames left
      const winH = H * 0.45
      const winY = H * 0.12
      const winCount = 3
      const winW = W * 0.28

      for (let i = 0; i < winCount; i++) {
        const wx = W * 0.03 + i * (winW + 12)
        // Window frame
        ctx.fillStyle = '#1a1812'
        ctx.fillRect(wx - 3, winY - 3, winW + 6, winH + 6)

        // Window — dark tunnel with occasional light streaks
        ctx.fillStyle = '#050408'
        ctx.fillRect(wx, winY, winW, winH)

        // Tunnel wall texture
        ctx.strokeStyle = 'rgba(60,50,40,0.5)'
        ctx.lineWidth = 1
        for (let bk = 0; bk < 8; bk++) {
          const bx = wx + (((bk * 37 + t * 120) % winW))
          ctx.beginPath()
          ctx.moveTo(bx, winY)
          ctx.lineTo(bx, winY + winH)
          ctx.stroke()
        }

        // Speed blur streaks
        lights.forEach(l => {
          const lx = ((l.x + t * 200 * l.speed) % (W * 1.5)) - W * 0.25
          if (lx >= wx && lx <= wx + winW) {
            const la = 0.15 + Math.sin(t * 10 + l.x) * 0.05
            ctx.strokeStyle = `rgba(220,210,180,${la})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(lx, winY + winH * 0.2)
            ctx.lineTo(lx - 15, winY + winH * 0.2)
            ctx.stroke()
          }
        })

        // Station flash
        if (stationFlash) {
          ctx.fillStyle = 'rgba(240,235,220,0.85)'
          ctx.fillRect(wx, winY, winW, winH)
          ctx.fillStyle = '#1a1208'
          ctx.font = `bold ${Math.round(winH * 0.12)}px Inter, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(stationFlash.toUpperCase(), wx + winW / 2, winY + winH / 2)
        }

        // Window reflection tint
        const refl = ctx.createLinearGradient(wx, winY, wx + winW, winY + winH)
        refl.addColorStop(0, 'rgba(60,50,40,0.15)')
        refl.addColorStop(0.5, 'rgba(0,0,0,0)')
        refl.addColorStop(1, 'rgba(60,50,40,0.1)')
        ctx.fillStyle = refl
        ctx.fillRect(wx, winY, winW, winH)
      }

      // Overhead light — TfL strip
      ctx.fillStyle = '#e8e0cc'
      ctx.fillRect(W * 0.2, 0, W * 0.6, 6)
      const lightFlicker = 0.85 + Math.sin(t * 31.7 + Math.sin(t * 8.3) * 5) * 0.07
      const lightGrad = ctx.createLinearGradient(0, 0, 0, H * 0.35)
      lightGrad.addColorStop(0, `rgba(235,225,195,${0.14 * lightFlicker})`)
      lightGrad.addColorStop(1, 'rgba(235,225,195,0)')
      ctx.fillStyle = lightGrad
      ctx.fillRect(0, 0, W, H * 0.35)

      // Carriage ceiling
      ctx.fillStyle = '#1a1710'
      ctx.fillRect(0, 0, W, H * 0.08)

      // Grab handles hanging from rail
      ctx.strokeStyle = '#2a2820'
      ctx.lineWidth = 2
      ctx.fillStyle = '#1a1810'
      const railY = H * 0.08
      for (let h = 0; h < 6; h++) {
        const hx = W * 0.12 + h * W * 0.16
        const swing = Math.sin(t * 2.5 + h * 0.8) * 3
        ctx.beginPath()
        ctx.moveTo(hx, railY)
        ctx.lineTo(hx + swing, railY + 40)
        ctx.stroke()
        ctx.fillRect(hx + swing - 8, railY + 38, 16, 10)
      }

      // Seat row at bottom
      const seatY = H * 0.72
      ctx.fillStyle = '#1a2a3a'
      ctx.fillRect(0, seatY, W, H - seatY)
      // Seat backs
      ctx.fillStyle = '#223040'
      for (let s = 0; s < 7; s++) {
        const sx = W * 0.04 + s * (W * 0.135)
        ctx.fillRect(sx, seatY - 28, W * 0.12, 28)
        // Seat occupant silhouette
        if (seats[s]?.active) {
          ctx.fillStyle = '#0a0808'
          ctx.beginPath()
          ctx.arc(sx + W * 0.06, seatY - 40, 10, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillRect(sx + W * 0.03, seatY - 30, W * 0.06, 20)
          ctx.fillStyle = '#223040'
        }
      }

      // Floor
      ctx.fillStyle = '#0a0c10'
      ctx.fillRect(0, H * 0.85, W, H * 0.15)

      // Carriage number
      ctx.fillStyle = '#3a3020'
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('CAR 4', W - 16, H * 0.1)
      ctx.textAlign = 'left'

      // Destination board (LED-style)
      const boardW = W * 0.55
      const boardH = 36
      const boardX = (W - boardW) / 2
      const boardY = H * 0.62
      ctx.fillStyle = '#0a0c0a'
      ctx.fillRect(boardX, boardY, boardW, boardH)
      ctx.strokeStyle = '#1a2a1a'
      ctx.lineWidth = 1
      ctx.strokeRect(boardX, boardY, boardW, boardH)
      if (scene) {
        ctx.fillStyle = '#f5a030'
        ctx.font = `bold 14px 'Inter', monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`▶ ${scene.name.toUpperCase()} ◀`, W / 2, boardY + boardH / 2)
      }
      ctx.textBaseline = 'alphabetic'

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [stationFlash, destinationId])

  // Station flash sequence and auto-arrive
  useEffect(() => {
    const destScene = SCENES[destinationId]
    if (!destScene) return

    // Randomly flash intermediate stations, then arrive
    const stops = STATION_SEQUENCE.filter(s => s !== destScene.tubeStation)
    let i = 0
    const flashInterval = setInterval(() => {
      if (i < 2) {
        setStationFlash(stops[Math.floor(Math.random() * stops.length)])
        setTimeout(() => setStationFlash(null), 600)
        i++
      } else {
        clearInterval(flashInterval)
        // Show destination, then arrive
        setTimeout(() => {
          setStationFlash(destScene.tubeStation)
          setTimeout(() => {
            setStationFlash(null)
            onArrived()
          }, 1500)
        }, 1200)
      }
    }, 1400)

    return () => clearInterval(flashInterval)
  }, [destinationId])

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Overlay info */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#a09080',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Heading to</div>
        {scene && (
          <div style={{ color: '#F5F0E8', fontSize: 18, fontWeight: 600 }}>{scene.name}</div>
        )}
        {scene && (
          <div style={{ color: '#7a6a5a', fontSize: 13, marginTop: 2 }}>{scene.subtitle}</div>
        )}
      </div>
    </div>
  )
}
