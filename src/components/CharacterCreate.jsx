import React, { useState } from 'react'
import { saveProfile } from '../store/gameStore'

const ORIGINS = [
  { value: 'USA', label: '🇺🇸 United States' },
  { value: 'Australia', label: '🇦🇺 Australia' },
  { value: 'Canada', label: '🇨🇦 Canada' },
  { value: 'France', label: '🇫🇷 France' },
  { value: 'Germany', label: '🇩🇪 Germany' },
  { value: 'Spain', label: '🇪🇸 Spain' },
  { value: 'Italy', label: '🇮🇹 Italy' },
  { value: 'Japan', label: '🇯🇵 Japan' },
  { value: 'Brazil', label: '🇧🇷 Brazil' },
  { value: 'India', label: '🇮🇳 India' },
  { value: 'China', label: '🇨🇳 China' },
  { value: 'Korea', label: '🇰🇷 Korea' },
  { value: 'Mexico', label: '🇲🇽 Mexico' },
  { value: 'Argentina', label: '🇦🇷 Argentina' },
  { value: 'Poland', label: '🇵🇱 Poland' },
  { value: 'elsewhere', label: '🌍 Somewhere else' },
]

const REASONS = [
  { value: 'tourism', label: 'Visiting as a tourist' },
  { value: 'work', label: 'Moving here for work' },
  { value: 'study', label: 'Studying here' },
  { value: 'family', label: 'Got family here' },
  { value: 'gap_year', label: 'Gap year adventure' },
  { value: 'love', label: "Followed someone here" },
]

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(200,164,90,0.3)',
  borderRadius: 4,
  color: '#F5F0E8',
  fontFamily: 'Inter, sans-serif',
  fontSize: 16,
  padding: '12px 16px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  display: 'block',
  color: '#a09080',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 2,
  textTransform: 'uppercase',
  marginBottom: 8,
}

export default function CharacterCreate({ onComplete }) {
  const [name, setName] = useState('')
  const [origin, setOrigin] = useState('')
  const [reason, setReason] = useState('')
  const [step, setStep] = useState(0)

  const handleSubmit = () => {
    if (!name.trim()) return
    const profile = {
      name: name.trim(),
      origin: origin || 'abroad',
      reason: reason || 'tourism',
      createdAt: Date.now(),
    }
    saveProfile(profile)
    onComplete(profile)
  }

  const canProceed = step === 0 ? name.trim().length > 0 : step === 1 ? origin !== '' : reason !== ''

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0f0608',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(200,164,90,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: '#C8A45A', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Before you land
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: '#F5F0E8',
            margin: 0,
          }}>
            {step === 0 ? "What's your name?" : step === 1 ? "Where are you from?" : "Why London?"}
          </h2>
          <p style={{ color: '#7a6a5a', fontSize: 14, marginTop: 8 }}>
            {step === 0 ? "Billy will use it — make it easy to say in a Cockney accent."
             : step === 1 ? "The characters will know where you're from. It'll come up."
             : "Your reason changes how Billy introduces you to people."}
          </p>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i <= step ? '#C8A45A' : '#3a2a1a',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Step 0: Name */}
        {step === 0 && (
          <div>
            <label style={labelStyle}>Your name</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Alex, Maria, Kenji..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canProceed) setStep(1) }}
              autoFocus
              maxLength={24}
              onFocus={e => { e.target.style.borderColor = 'rgba(200,164,90,0.7)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(200,164,90,0.3)' }}
            />
          </div>
        )}

        {/* Step 1: Origin */}
        {step === 1 && (
          <div>
            <label style={labelStyle}>Country of origin</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              maxHeight: 300,
              overflowY: 'auto',
            }}>
              {ORIGINS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setOrigin(o.value)}
                  style={{
                    background: origin === o.value ? 'rgba(200,164,90,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${origin === o.value ? '#C8A45A' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 4,
                    color: origin === o.value ? '#C8A45A' : '#a09080',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Reason */}
        {step === 2 && (
          <div>
            <label style={labelStyle}>Why are you in London?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {REASONS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  style={{
                    background: reason === r.value ? 'rgba(200,164,90,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${reason === r.value ? '#C8A45A' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 4,
                    color: reason === r.value ? '#C8A45A' : '#a09080',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 4,
                color: '#7a6a5a',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                padding: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={() => step < 2 ? setStep(s => s + 1) : handleSubmit()}
            disabled={!canProceed}
            style={{
              flex: 3,
              background: canProceed ? '#C8A45A' : '#2a1a0a',
              border: 'none',
              borderRadius: 4,
              color: canProceed ? '#0f0608' : '#5a4a3a',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              padding: '14px',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {step < 2 ? 'Next →' : "Land in London →"}
          </button>
        </div>
      </div>
    </div>
  )
}
