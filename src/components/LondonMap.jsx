import React, { useEffect, useRef, useState } from 'react'
import { SCENES, SCENE_ORDER } from '../data/scenes'
import { getLevel, LEVELS } from '../store/gameStore'

// Station layout for the Underground-style map
const STATIONS = [
  {
    id: 'heathrow_arrivals',
    label: 'HEATHROW T5',
    x: 0.1,
    y: 0.62,
    line: 'piccadilly',
    color: '#0019A8',
  },
  {
    id: 'caff_morning',
    label: 'BETHNAL GREEN',
    x: 0.5,
    y: 0.38,
    line: 'central',
    color: '#E32017',
  },
  {
    id: 'crown_pub',
    label: 'SHOREDITCH',
    x: 0.8,
    y: 0.28,
    line: 'overground',
    color: '#EF7B10',
  },
]

function XPBar({ xp }) {
  const level = getLevel(xp)
  const nextLevel = LEVELS[level.index + 1]
  const progress = nextLevel
    ? (xp - level.minXP) / (nextLevel.minXP - level.minXP)
    : 1

  return (
    <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: '#C8A45A', fontSize: 13, fontWeight: 600 }}>{level.name}</span>
        <span style={{ color: '#7a6a5a', fontSize: 12 }}>{xp} XP</span>
      </div>
      <div style={{ height: 4, background: '#2a1a0a', borderRadius: 2 }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: '#C8A45A',
          borderRadius: 2,
          transition: 'width 0.8s ease',
        }} />
      </div>
      {nextLevel && (
        <div style={{ color: '#5a4a3a', fontSize: 11, marginTop: 4 }}>
          {nextLevel.minXP - xp} XP to {nextLevel.name}
        </div>
      )}
    </div>
  )
}

export default function LondonMap({ xp, streak, streakShields, unlockedScenes, onSelectScene, onOpenSlangBank }) {
  const canvasRef = useRef(null)
  const [hoveredStation, setHoveredStation] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    let t = 0
    const draw = () => {
      t += 0.016
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Map background — cream like a real TfL map
      ctx.fillStyle = '#F0EBE0'
      ctx.fillRect(0, 0, W, H)

      // Subtle grid
      ctx.strokeStyle = 'rgba(180,165,140,0.3)'
      ctx.lineWidth = 0.5
      const gridSize = 30
      for (let gx = 0; gx < W; gx += gridSize) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke()
      }
      for (let gy = 0; gy < H; gy += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
      }

      // Thames — thick blue wavy band
      const thamesY = H * 0.78
      ctx.strokeStyle = '#8BB8D4'
      ctx.lineWidth = 18
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, thamesY)
      for (let tx = 0; tx <= W; tx += 10) {
        const ty = thamesY + Math.sin(tx * 0.015 + t * 0.3) * 6
        ctx.lineTo(tx, ty)
      }
      ctx.stroke()
      // Thames label
      ctx.fillStyle = '#6a9ab8'
      ctx.font = 'italic 10px Inter, sans-serif'
      ctx.fillText('River Thames', W * 0.1, thamesY + 30)

      // Draw tube lines connecting stations (simplified diagonal lines — Beck style)
      for (let i = 0; i < STATIONS.length - 1; i++) {
        const s1 = STATIONS[i]
        const s2 = STATIONS[i + 1]
        const x1 = s1.x * W, y1 = s1.y * H
        const x2 = s2.x * W, y2 = s2.y * H
        const unlocked = unlockedScenes.includes(s2.id)

        // 45-degree elbow routing (Beck style)
        const dx = x2 - x1, dy = y2 - y1
        const elbowX = x1 + dx * 0.5
        const elbowY = y1

        ctx.strokeStyle = unlocked ? s2.color : '#c8c0b8'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(elbowX, elbowY)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        // White core line
        ctx.strokeStyle = '#F0EBE0'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(elbowX, elbowY)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Draw stations
      STATIONS.forEach(station => {
        const sx = station.x * W
        const sy = station.y * H
        const unlocked = unlockedScenes.includes(station.id)
        const scene = SCENES[station.id]
        const isHovered = hoveredStation === station.id
        const isSelected = selectedStation === station.id

        const pulse = 1 + (isHovered || isSelected ? Math.sin(t * 4) * 0.12 : 0)

        // Station circle — white with line colour ring
        const outerR = (isHovered ? 14 : 11) * pulse
        const innerR = 7 * pulse

        // Outer ring (line colour)
        ctx.fillStyle = unlocked ? station.color : '#a09080'
        ctx.beginPath()
        ctx.arc(sx, sy, outerR, 0, Math.PI * 2)
        ctx.fill()

        // Inner white
        ctx.fillStyle = '#F0EBE0'
        ctx.beginPath()
        ctx.arc(sx, sy, innerR, 0, Math.PI * 2)
        ctx.fill()

        // Lock icon if locked
        if (!unlocked) {
          ctx.fillStyle = '#8a7a6a'
          ctx.font = `bold ${Math.round(outerR * 0.9)}px Inter`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('🔒', sx, sy)
        }

        // Pulsing outer glow if unlocked
        if (unlocked) {
          const glowA = 0.2 + Math.sin(t * 2.5) * 0.1
          const g = ctx.createRadialGradient(sx, sy, outerR, sx, sy, outerR * 2.5)
          g.addColorStop(0, station.color.replace(')', `,${glowA})`).replace('rgb', 'rgba'))
          g.addColorStop(1, station.color.replace(')', ',0)').replace('rgb', 'rgba'))
          ctx.fillStyle = station.color + '30'
          ctx.beginPath()
          ctx.arc(sx, sy, outerR * 2.5, 0, Math.PI * 2)
          ctx.fill()
        }

        // Station name label — Beck style tick mark placement
        ctx.fillStyle = '#1a1208'
        ctx.font = `bold 10px Inter, sans-serif`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        const labelX = sx + 16
        const labelY = sy - 6
        ctx.fillText(station.label, labelX, labelY)

        // XP required if locked
        if (!unlocked && scene) {
          ctx.fillStyle = '#8a7a6a'
          ctx.font = `9px Inter, sans-serif`
          ctx.fillText(`${scene.xpRequired} XP`, labelX, labelY + 13)
        }

        // Line indicator below station name
        ctx.fillStyle = station.color
        ctx.fillRect(labelX, labelY + (unlocked ? 13 : 24), 18, 3)
      })

      // Map title in top left
      ctx.fillStyle = '#1a1208'
      ctx.font = `bold 14px 'Playfair Display', serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('LONDON', 16, 16)
      ctx.font = `10px Inter, sans-serif`
      ctx.fillStyle = '#6a5a4a'
      ctx.fillText('UNDERGROUND', 16, 34)

      // Compass rose (simplified)
      ctx.fillStyle = '#6a5a4a'
      ctx.font = '10px Inter'
      ctx.textAlign = 'center'
      ctx.fillText('N', W - 24, H - 52)
      ctx.strokeStyle = '#6a5a4a'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(W - 24, H - 44)
      ctx.lineTo(W - 24, H - 32)
      ctx.stroke()

      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => cancelAnimationFrame(raf)
  }, [unlockedScenes, hoveredStation, selectedStation])

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width
    const cy = (e.clientY - rect.top) / rect.height

    const hit = STATIONS.find(s => {
      const dx = s.x - cx, dy = s.y - cy
      return Math.sqrt(dx * dx + dy * dy) < 0.06
    })

    if (hit) {
      if (unlockedScenes.includes(hit.id)) {
        setSelectedStation(hit.id)
        onSelectScene(hit.id)
      } else {
        setHoveredStation(hit.id)
        setTimeout(() => setHoveredStation(null), 2000)
      }
    }
  }

  const handleCanvasMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width
    const cy = (e.clientY - rect.top) / rect.height

    const hit = STATIONS.find(s => {
      const dx = s.x - cx, dy = s.y - cy
      return Math.sqrt(dx * dx + dy * dy) < 0.06
    })
    setHoveredStation(hit?.id ?? null)
    canvas.style.cursor = hit && unlockedScenes.includes(hit.id) ? 'pointer' : 'default'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0f0608',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#0f0608',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: '#F5F0E8', fontSize: 20, fontWeight: 700 }}>
            Alright Mate
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {streak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ color: '#F5A623', fontSize: 14, fontWeight: 600 }}>{streak}</span>
              {streakShields > 0 && <span style={{ fontSize: 14, marginLeft: 2 }}>{'🛡️'.repeat(streakShields)}</span>}
            </div>
          )}
          <button
            onClick={onOpenSlangBank}
            style={{
              background: 'rgba(200,164,90,0.12)',
              border: '1px solid rgba(200,164,90,0.3)',
              borderRadius: 4,
              color: '#C8A45A',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              padding: '6px 14px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Slang Bank
          </button>
        </div>
      </div>

      {/* XP bar */}
      <XPBar xp={xp} />

      {/* Instruction */}
      <div style={{
        padding: '10px 20px',
        color: '#7a6a5a',
        fontSize: 13,
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        Tap a station to start your next conversation
      </div>

      {/* Map canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMove}
          onMouseLeave={() => setHoveredStation(null)}
        />

        {/* Tooltip for locked stations */}
        {hoveredStation && !unlockedScenes.includes(hoveredStation) && (() => {
          const station = STATIONS.find(s => s.id === hoveredStation)
          const scene = SCENES[hoveredStation]
          return station && scene ? (
            <div style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15,6,8,0.95)',
              border: '1px solid rgba(200,164,90,0.3)',
              borderRadius: 6,
              padding: '10px 20px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{ color: '#C8A45A', fontSize: 12, fontWeight: 600 }}>{scene.name}</div>
              <div style={{ color: '#7a6a5a', fontSize: 12 }}>Unlock at {scene.xpRequired} XP</div>
            </div>
          ) : null
        })()}
      </div>
    </div>
  )
}
