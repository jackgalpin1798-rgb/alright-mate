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

const STEPS = ['avatar', 'name', 'origin', 'reason']

export default function CharacterCreate({ onComplete }) {
  const [step, setStep] = useState(0)
  const [avatar, setAvatar] = useState(null)
  const [name, setName] = useState('')
  const [origin, setOrigin] = useState('')
  const [reason, setReason] = useState('')

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))

  const finish = () => {
    onComplete({ name: name.trim(), origin, reason, avatarSrc: AVATARS.find(a => a.id === avatar)?.src })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0804',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i <= step ? '#C8A45A' : 'rgba(255,255,255,0.1)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Step 0: Avatar */}
      {step === 0 && (
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#F5F0E8', marginBottom: 8 }}>
            Who are you?
          </div>
          <div style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 32, letterSpacing: 1 }}>
            Pick your traveller
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12,
            marginBottom: 32,
          }}>
            {AVATARS.map(a => (
              <div
                key={a.id}
                onClick={() => setAvatar(a.id)}
                style={{
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  border: `2px solid ${avatar === a.id ? '#C8A45A' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: avatar === a.id ? '0 0 16px rgba(200,164,90,0.35)' : 'none',
                  transform: avatar === a.id ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 0.2s', aspectRatio: '1/1',
                }}
              >
                <img src={a.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
          <button
            onClick={next} disabled={!avatar}
            style={{
              background: avatar ? 'rgba(200,164,90,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${avatar ? 'rgba(200,164,90,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8, color: avatar ? '#C8A45A' : '#4a4040',
              fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
              padding: '14px 40px', cursor: avatar ? 'pointer' : 'not-allowed',
              letterSpacing: 1, transition: 'all 0.2s',
            }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 1: Name */}
      {step === 1 && (
        <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
          {avatar && (
            <img
              src={AVATARS.find(a => a.id === avatar)?.src}
              alt=""
              style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', marginBottom: 24, border: '2px solid rgba(200,164,90,0.4)' }}
            />
          )}
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#F5F0E8', marginBottom: 8 }}>
            What's your name?
          </div>
          <div style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 28 }}>
            Billy will use this to greet you
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) next() }}
            placeholder="Your name"
            autoFocus
            style={{
              width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(200,164,90,0.3)',
              borderRadius: 8, color: '#F5F0E8', fontFamily: "'Inter', sans-serif",
              fontSize: 18, padding: '14px 18px', outline: 'none', marginBottom: 24, boxSizing: 'border-box',
              textAlign: 'center',
            }}
          />
          <button
            onClick={next} disabled={!name.trim()}
            style={{
              background: name.trim() ? 'rgba(200,164,90,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${name.trim() ? 'rgba(200,164,90,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8, color: name.trim() ? '#C8A45A' : '#4a4040',
              fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
              padding: '14px 40px', cursor: name.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Origin */}
      {step === 2 && (
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#F5F0E8', marginBottom: 8 }}>
            Where are you from?
          </div>
          <div style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 28 }}>
            Billy will tailor his banter
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
            {ORIGINS.map(o => (
              <button
                key={o.value}
                onClick={() => setOrigin(o.value)}
                style={{
                  background: origin === o.value ? 'rgba(200,164,90,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${origin === o.value ? 'rgba(200,164,90,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8, color: origin === o.value ? '#C8A45A' : '#a09080',
                  fontFamily: "'Inter', sans-serif", fontSize: 13, padding: '11px 8px',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button
            onClick={next} disabled={!origin}
            style={{
              background: origin ? 'rgba(200,164,90,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${origin ? 'rgba(200,164,90,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8, color: origin ? '#C8A45A' : '#4a4040',
              fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
              padding: '14px 40px', cursor: origin ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 3: Reason */}
      {step === 3 && (
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#F5F0E8', marginBottom: 8 }}>
            Why are you in London?
          </div>
          <div style={{ color: '#7a6a5a', fontSize: 14, marginBottom: 28 }}>
            Sets the scene for your conversations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            {REASONS.map(r => (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                style={{
                  background: reason === r.value ? 'rgba(200,164,90,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${reason === r.value ? 'rgba(200,164,90,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8, color: reason === r.value ? '#C8A45A' : '#a09080',
                  fontFamily: "'Inter', sans-serif", fontSize: 14, padding: '13px 20px',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={finish} disabled={!reason}
            style={{
              background: reason ? 'rgba(200,164,90,0.25)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${reason ? 'rgba(200,164,90,0.6)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8, color: reason ? '#C8A45A' : '#4a4040',
              fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600,
              padding: '16px 48px', cursor: reason ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              boxShadow: reason ? '0 0 20px rgba(200,164,90,0.15)' : 'none',
            }}
          >
            Let's go →
          </button>
        </div>
      )}
    </div>
  )
}
