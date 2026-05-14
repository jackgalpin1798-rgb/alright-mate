import React from 'react'
import { getLevel } from '../store/gameStore'

export default function HUD({ xp, streak, streakShields, survivalDots, onExit }) {
  const level = getLevel(xp)

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
      fontFamily: 'Inter, sans-serif',
      pointerEvents: 'none',
    }}>
      {/* Left: exit */}
      <button
        onClick={onExit}
        style={{
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 4,
          color: '#a09080',
          fontSize: 12,
          padding: '6px 12px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: 1,
          pointerEvents: 'all',
        }}
      >
        ← Exit
      </button>

      {/* Centre: level + survival dots */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ color: '#C8A45A', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
          {level.name}
        </div>
        {survivalDots && (
          <div style={{ display: 'flex', gap: 6 }}>
            {survivalDots.map((alive, i) => (
              <div
                key={i}
                style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: alive ? '#C41E3A' : 'rgba(255,255,255,0.15)',
                  boxShadow: alive ? '0 0 6px rgba(196,30,58,0.6)' : 'none',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: XP + streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ color: '#7a6a5a', fontSize: 12 }}>
          <span style={{ color: '#C8A45A', fontWeight: 600 }}>{xp}</span> XP
        </div>
        {streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ color: '#F5A623', fontSize: 13, fontWeight: 600 }}>{streak}</span>
            {streakShields > 0 && <span style={{ fontSize: 12 }}>{'🛡️'.repeat(Math.min(streakShields, 2))}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
