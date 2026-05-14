import React, { useState } from 'react'

const AVATARS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  src: `/assets/avatars/avatar_${String(i + 1).padStart(2, '0')}.png`,
}))

const ORIGINS = [
  { value: 'USA',       label: '🇺🇸 United States' },
  { value: 'Argentina', label: '🇦🇷 Argentina' },
  { value: 'Australia', label: '🇦🇺 Australia' },
  { value: 'Brazil',    label: '🇧🇷 Brazil' },
  { value: 'Canada',    label: '🇨🇦 Canada' },
  { value: 'France',    label: '🇫🇷 France' },
  { value: 'Germany',   label: '🇩🇪 Germany' },
  { value: 'India',     label: '🇮🇳 India' },
  { value: 'Italy',     label: '🇮🇹 Italy' },
  { value: 'Japan',     label: '🇯🇵 Japan' },
  { value: 'Spain',     label: '🇪🇸 Spain' },
  { value: 'elsewhere', label: '🌍 Somewhere else' },
]

const REASONS = [
  { value: 'tourism',  label: 'Visiting as a tourist' },
  { value: 'work',     label: 'Moving here for work' },
  { value: 'study',    label: 'Studying here' },
  { value: 'family',   label: 'Got family here' },
  { value: 'gap_year', label: 'Gap year adventure' },
  { value: 'love',     label: 'Followed someone here' },
]

const DIFFICULTIES = [
  { value: 'easy',   label: 'Casual stroll',   desc: 'Clear and friendly — slang explained when used', tag: 'Beginner' },
  { value: 'medium', label: "Local's pace",    desc: 'Natural conversation, proper British slang',      tag: 'Intermediate' },
  { value: 'hard',   label: 'Full immersion',  desc: 'Heavy slang, no hand-holding, no mercy',          tag: 'Advanced' },
]

const STEPS = ['avatar', 'name', 'origin', 'reason', 'difficulty']
const gold = '#C8A45A'

function Btn({ onClick, disabled, children, primary }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? 'rgba(255,255,255,0.04)' : primary ? gold : 'rgba(200,164,90,0.2)',
      border: `1px solid ${disabled ? 'rgba(255,255,255,0.1)' : 'rgba(200,164,90,0.5)'}`,
      borderRadius: 8,
      color: disabled ? '#4a4040' : primary ? '#0a0804' : gold,
      fontFamily: "'Inter', sans-serif",
      fontSize: primary ? 15 : 14,
      fontWeight: 600,
      padding: primary ? '16px 48px' : '14px 40px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      letterSpacing: 0.5,
      boxShadow: disabled || !primary ? 'none' : '0 0 20px rgba(200,164,90,0.2)',
    }}>{children}</button>
  )
}

export default function CharacterCreate({ onComplete }) {
  const [step, setStep] = useState(0)
  const [avatar, setAvatar] = useState(null)
  const [name, setName] = useState('')
  const [origin, setOrigin] = useState('')
  const [reason, setReason] = useState('')
  const [difficulty, setDifficulty] = useState('')

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const finish = () => onComplete({ name: name.trim(), origin, reason, difficulty, avatarSrc: AVATARS.find(a => a.id === avatar)?.src })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0804',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i <= step ? gold : 'rgba(255,255,255,0.1)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {step === 0 && (
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#F5F0E8', marginBottom: 8 }}>Who are you?</div>
          <div style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 32 }}>Pick your traveller</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
            {AVATARS.map(a => (
              <div key={a.id} onClick={() => setAvatar(a.id)} style={{
                borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                border: `2px solid ${avatar === a.id ? gold : 'rgba(255,255,255,0.08)'}`,
                boxShadow: avatar === a.id ? '0 0 16px rgba(200,164,90,0.35)' : 'none',
                transform: avatar === a.id ? 'scale(1.06)' : 'scale(1)',
                transition: 'all 0.2s', aspectRatio: '1/1',
              }}>
                <img src={a.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
          <Btn onClick={next} disabled={!avatar}>Continue →</Btn>
        </div>
      )}

      {step === 1 && (
        <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
          {avatar && (
            <img src={AVATARS.find(a => a.id === avatar)?.src} alt="" style={{
              width: 90, height: 90, borderRadius: '50%', objectFit: 'cover',
              marginBottom: 24, border: '2px solid rgba(200,164,90,0.4)',
            }} />
          )}
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#F5F0E8', marginBottom: 8 }}>What's your name?</div>
          <div style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 28 }}>Billy will use this to greet you</div>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) next() }}
            placeholder="Your name" autoFocus
            style={{
              width: '100%', background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(200,164,90,0.3)', borderRadius: 8,
              color: '#F5F0E8', fontFamily: "'Inter', sans-serif",
              fontSize: 18, padding: '14px 18px', outline: 'none',
              marginBottom: 24, boxSizing: 'border-box', textAlign: 'center',
            }}
          />
          <Btn onClick={next} disabled={!name.trim()}>Continue →</Btn>
        </div>
      )}

      {step === 2 && (
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#F5F0E8', marginBottom: 8 }}>Where are you from?</div>
          <div style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 28 }}>Billy will tailor his banter</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
            {ORIGINS.map(o => (
              <button key={o.value} onClick={() => setOrigin(o.value)} style={{
                background: origin === o.value ? 'rgba(200,164,90,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${origin === o.value ? 'rgba(200,164,90,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8, color: origin === o.value ? gold : '#a09080',
                fontFamily: "'Inter', sans-serif", fontSize: 13, padding: '11px 8px',
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
              }}>{o.label}</button>
            ))}
          </div>
          <Btn onClick={next} disabled={!origin}>Continue →</Btn>
        </div>
      )}

      {step === 3 && (
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#F5F0E8', marginBottom: 8 }}>Why are you in London?</div>
          <div style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 28 }}>Sets the scene for your conversations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            {REASONS.map(r => (
              <button key={r.value} onClick={() => setReason(r.value)} style={{
                background: reason === r.value ? 'rgba(200,164,90,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${reason === r.value ? 'rgba(200,164,90,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8, color: reason === r.value ? gold : '#a09080',
                fontFamily: "'Inter', sans-serif", fontSize: 14, padding: '13px 20px',
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
              }}>{r.label}</button>
            ))}
          </div>
          <Btn onClick={next} disabled={!reason}>Continue →</Btn>
        </div>
      )}

      {step === 4 && (
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#F5F0E8', marginBottom: 8 }}>How deep do you want to go?</div>
          <div style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 32 }}>Sets how much slang they throw at you</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            {DIFFICULTIES.map(d => (
              <button key={d.value} onClick={() => setDifficulty(d.value)} style={{
                background: difficulty === d.value ? 'rgba(200,164,90,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${difficulty === d.value ? 'rgba(200,164,90,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
                transition: 'all 0.15s', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: difficulty === d.value ? gold : '#F5F0E8', fontWeight: 600, fontSize: 15 }}>{d.label}</div>
                  <div style={{ color: '#7a6a5a', fontSize: 12, marginTop: 3 }}>{d.desc}</div>
                </div>
                <div style={{
                  background: difficulty === d.value ? 'rgba(200,164,90,0.2)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${difficulty === d.value ? 'rgba(200,164,90,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 4, padding: '3px 8px',
                  color: difficulty === d.value ? gold : '#5a4a3a',
                  fontSize: 10, letterSpacing: 1, whiteSpace: 'nowrap',
                }}>{d.tag}</div>
              </button>
            ))}
          </div>
          <Btn onClick={finish} disabled={!difficulty} primary>Let's go →</Btn>
        </div>
      )}
    </div>
  )
}
