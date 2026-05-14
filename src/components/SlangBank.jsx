import React, { useState } from 'react'

export default function SlangBank({ slangBank, onClose }) {
  const [search, setSearch] = useState('')

  const filtered = slangBank.filter(p =>
    p.phrase.toLowerCase().includes(search.toLowerCase()) ||
    p.meaning.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'flex-end',
      fontFamily: 'Inter, sans-serif',
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: '100%',
        maxHeight: '88vh',
        background: '#0f0c0a',
        borderRadius: '16px 16px 0 0',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#F5F0E8', fontSize: 22, fontWeight: 700, margin: 0 }}>
              Slang Bank
            </h2>
            <div style={{ color: '#7a6a5a', fontSize: 12, marginTop: 2 }}>
              {slangBank.length} phrase{slangBank.length !== 1 ? 's' : ''} collected
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7a6a5a',
              fontSize: 24,
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <input
            type="text"
            placeholder="Search phrases..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(200,164,90,0.2)',
              borderRadius: 6,
              color: '#F5F0E8',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              padding: '10px 14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 16px 32px' }}>
          {slangBank.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#5a4a3a' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🇬🇧</div>
              <div style={{ fontSize: 15, marginBottom: 8 }}>Your slang bank is empty</div>
              <div style={{ fontSize: 13 }}>Complete conversations to collect British phrases</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: '#5a4a3a', fontSize: 14 }}>
              No phrases matching "{search}"
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, paddingTop: 8 }}>
              {filtered.map((p, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 8,
                    border: '1px solid rgba(200,164,90,0.15)',
                    padding: '12px 14px',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,164,90,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,164,90,0.15)'}
                >
                  <div style={{ color: '#C8A45A', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {p.phrase}
                  </div>
                  <div style={{ color: '#7a6a5a', fontSize: 12, lineHeight: 1.4 }}>
                    {p.meaning}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom legend */}
        {slangBank.length > 0 && (
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { label: 'Cockney', example: 'innit, blinding, gutted' },
                { label: 'British', example: 'sorted, chuffed, proper' },
                { label: 'MLE', example: 'mandem, peng, wagwan' },
              ].map(c => (
                <div key={c.label} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#C8A45A', fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>{c.label}</div>
                  <div style={{ color: '#5a4a3a', fontSize: 10 }}>{c.example}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  )
}
