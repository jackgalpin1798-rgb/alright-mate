import React, { useState, useEffect } from 'react'
import { speak } from '../services/elevenLabsService'

const BILLY_VOICE = import.meta.env.VITE_VOICE_BILLY

export default function BillyPhone({ messages, isOpen, onClose, onOpen }) {
  const [activeMsg, setActiveMsg] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const [unread, setUnread] = useState(0)

  // Count unread messages
  useEffect(() => {
    const readIds = new Set(JSON.parse(localStorage.getItem('am_billy_read') || '[]'))
    const newUnread = messages.filter(m => !readIds.has(m.id)).length
    setUnread(newUnread)
  }, [messages])

  const markAllRead = () => {
    const ids = messages.map(m => m.id)
    localStorage.setItem('am_billy_read', JSON.stringify(ids))
    setUnread(0)
  }

  const handleOpen = () => {
    markAllRead()
    onOpen()
  }

  const handleSpeak = (msg) => {
    if (speaking) return
    setSpeaking(true)
    setActiveMsg(msg.id)
    speak(msg.text, BILLY_VOICE, null, () => {
      setSpeaking(false)
      setActiveMsg(null)
    }).catch(() => { setSpeaking(false); setActiveMsg(null) })
  }

  return (
    <>
      {/* Floating phone button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          style={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(15,6,8,0.92)',
            border: '2px solid rgba(200,164,90,0.5)',
            boxShadow: unread > 0 ? '0 0 20px rgba(200,164,90,0.35)' : '0 4px 20px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            animation: unread > 0 ? 'phoneBuzz 2s ease-in-out infinite' : 'none',
          }}
          title="Billy's messages"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A45A" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.68 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.79 18 2 2 0 0 1 22 16.92z" />
          </svg>
          {unread > 0 && (
            <div style={{
              position: 'absolute',
              top: -4, right: -4,
              width: 18, height: 18,
              borderRadius: '50%',
              background: '#C41E3A',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, sans-serif',
            }}>{unread}</div>
          )}
        </button>
      )}

      {/* Phone overlay */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '100%',
          maxWidth: 380,
          background: '#0f0c0a',
          borderTop: '1px solid rgba(200,164,90,0.2)',
          borderLeft: '1px solid rgba(200,164,90,0.1)',
          borderRadius: '16px 16px 0 0',
          zIndex: 50,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
          fontFamily: 'Inter, sans-serif',
          animation: 'slideUp 0.3s ease',
        }}>
          {/* Phone header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'rgba(200,164,90,0.15)',
                border: '2px solid rgba(200,164,90,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}>
                🧑
              </div>
              <div>
                <div style={{ color: '#F5F0E8', fontSize: 14, fontWeight: 600 }}>Billy</div>
                <div style={{ color: '#5a4a3a', fontSize: 11 }}>Bethnal Green</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7a6a5a',
                fontSize: 20,
                cursor: 'pointer',
                padding: 4,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            padding: '12px 16px',
            maxHeight: 340,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#5a4a3a', fontSize: 13, padding: '20px 0' }}>
                Complete Heathrow to get Billy's first message
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    maxWidth: '85%',
                    alignSelf: 'flex-start',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '4px 12px 12px 12px',
                    padding: '10px 14px',
                    position: 'relative',
                    cursor: 'pointer',
                    border: activeMsg === msg.id ? '1px solid rgba(200,164,90,0.4)' : '1px solid transparent',
                    transition: 'border-color 0.2s',
                  }}
                  onClick={() => handleSpeak(msg)}
                >
                  <div style={{ color: '#F5F0E8', fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
                  <div style={{ color: '#5a4a3a', fontSize: 10, marginTop: 6 }}>
                    {msg.timestamp} · Tap to hear
                    {activeMsg === msg.id && speaking && (
                      <span style={{ color: '#C8A45A', marginLeft: 8 }}>🎙 playing...</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Typing indicator if no messages yet */}
          <div style={{
            padding: '10px 20px 20px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ color: '#5a4a3a', fontSize: 11, textAlign: 'center' }}>
              Billy's messages unlock as you progress through London
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes phoneRing { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
        @keyframes phoneBuzz { 0%, 90%, 100% { transform: scale(1); } 95% { transform: scale(1.06); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  )
}
