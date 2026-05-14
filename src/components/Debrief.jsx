import React, { useEffect, useState, useRef } from 'react'
import { scoreConversation, summarizeMemory } from '../services/claudeService'
import { speak } from '../services/elevenLabsService'
import { incrementRelationship, addReputation } from '../lib/memory'

const GRADE_COLOR = { A: '#4ade80', B: '#86efac', C: '#facc15', D: '#fb923c', F: '#f87171' }

function GradeRing({ grade, animated }) {
  const color = GRADE_COLOR[grade] || '#888'
  return (
    <div style={{
      width: 90,
      height: 90,
      borderRadius: '50%',
      border: `4px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 30px ${color}55`,
      flexShrink: 0,
      transition: 'all 0.4s ease',
      transform: animated ? 'scale(1)' : 'scale(0.6)',
      opacity: animated ? 1 : 0,
    }}>
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 42,
        fontWeight: 900,
        color,
        lineHeight: 1,
      }}>{grade}</span>
    </div>
  )
}

function SlangItem({ phrase, meaning, delay }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 12px',
      background: 'rgba(200,164,90,0.08)',
      borderRadius: 6,
      border: '1px solid rgba(200,164,90,0.2)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-12px)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ color: '#C8A45A', fontWeight: 600, fontSize: 14, minWidth: 80 }}>{phrase}</div>
      <div style={{ color: '#a09080', fontSize: 13 }}>{meaning}</div>
    </div>
  )
}

function SharePostcard({ scene, result, playerProfile }) {
  const canvasRef = useRef(null)
  const [sharing, setSharing] = useState(false)

  const generate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 1200, H = 630
    canvas.width = W
    canvas.height = H

    // Background
    ctx.fillStyle = scene.bgGradient || '#0f0608'
    ctx.fillRect(0, 0, W, H)

    // Decorative border
    ctx.strokeStyle = '#C8A45A'
    ctx.lineWidth = 8
    ctx.strokeRect(20, 20, W - 40, H - 40)
    ctx.strokeStyle = '#C8A45A55'
    ctx.lineWidth = 2
    ctx.strokeRect(28, 28, W - 56, H - 56)

    // "SENT FROM LONDON" header
    ctx.fillStyle = '#C8A45A'
    ctx.font = "bold 20px 'Inter', sans-serif"
    ctx.textAlign = 'center'
    ctx.fillText('SENT FROM LONDON', W / 2, 68)

    // Scene name
    ctx.fillStyle = '#F5F0E8'
    ctx.font = "bold 64px 'Playfair Display', serif"
    ctx.fillText(scene.name, W / 2, H / 2 - 40)

    // Grade
    ctx.fillStyle = GRADE_COLOR[result.grade] || '#fff'
    ctx.font = "bold 120px 'Playfair Display', serif"
    ctx.fillText(result.grade, W / 2, H / 2 + 80)

    // Score
    ctx.fillStyle = '#a09080'
    ctx.font = "24px 'Inter', sans-serif"
    ctx.fillText(`${result.score}/100 · ${result.xpEarned} XP earned`, W / 2, H / 2 + 130)

    // Player name
    if (playerProfile?.name) {
      ctx.fillStyle = '#7a6a5a'
      ctx.font = "18px 'Inter', sans-serif"
      ctx.fillText(playerProfile.name, W / 2, H - 56)
    }

    // British stamp (top-right)
    const sx = W - 110, sy = 36
    ctx.fillStyle = '#C41E3A'
    ctx.fillRect(sx, sy, 80, 90)
    ctx.fillStyle = '#fff'
    ctx.font = "bold 11px 'Inter', sans-serif"
    ctx.fillText('🇬🇧', sx + 40, sy + 30)
    ctx.fillText('ALRIGHT', sx + 40, sy + 55)
    ctx.fillText('MATE', sx + 40, sy + 70)

    ctx.textAlign = 'left'
  }

  const handleShare = async () => {
    setSharing(true)
    generate()
    const canvas = canvasRef.current
    if (!canvas) { setSharing(false); return }
    try {
      canvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], 'alright-mate.png', { type: 'image/png' })
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Alright Mate', text: `I scored ${result.grade} at ${scene.name}!` })
          } else {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'alright-mate-result.png'; a.click()
            URL.revokeObjectURL(url)
          }
        } catch {} finally { setSharing(false) }
      })
    } catch { setSharing(false) }
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button
        onClick={handleShare}
        disabled={sharing}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6,
          color: '#a09080',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 500,
          padding: '10px 20px',
          cursor: sharing ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s',
        }}
      >
        <span>↗</span> {sharing ? 'Saving...' : 'Share postcard'}
      </button>
    </>
  )
}

export default function Debrief({ scene, history, playerProfile, onContinue, onNextScene, nextSceneId, onAddXP }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [xpAnimated, setXpAnimated] = useState(0)
  const [gradeAnimated, setGradeAnimated] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        const scored = await scoreConversation(scene, history, playerProfile)
        setResult(scored)
        setLoading(false)

        onAddXP(scored.xpEarned)
        incrementRelationship(scene.character.name)
        addReputation(scene.id, Math.round(scored.score * 0.4))
        summarizeMemory(scene.character.name, history, playerProfile)

        setTimeout(() => setGradeAnimated(true), 200)

        let current = 0
        const step = Math.ceil(scored.xpEarned / 30)
        const xpTimer = setInterval(() => {
          current = Math.min(current + step, scored.xpEarned)
          setXpAnimated(current)
          if (current >= scored.xpEarned) clearInterval(xpTimer)
        }, 40)

        // Billy's comment via ElevenLabs
        if (scored.billyComment) {
          setSpeaking(true)
          const billyVoice = import.meta.env.VITE_VOICE_BILLY
          await speak(scored.billyComment, billyVoice, null, () => setSpeaking(false)).catch(() => setSpeaking(false))
        }
      } catch {
        setLoading(false)
        setResult({
          score: 55, grade: 'C', xpEarned: 20, survived: true,
          highlights: ["You gave it a go!"],
          newSlang: [],
          mistakes: [],
          debrief: "Not bad at all! Keep at it and you'll be sounding like a local before long.",
          billyComment: "Oi, decent effort! Keep practicing, yeah?",
        })
        setTimeout(() => setGradeAnimated(true), 200)
      }
    }
    run()
  }, [])

  const containerStyle = {
    position: 'fixed', inset: 0,
    overflowY: 'auto',
    background: '#0f0608',
    fontFamily: 'Inter, sans-serif',
  }

  const cardStyle = {
    maxWidth: 520,
    margin: '0 auto',
    padding: '24px 20px 48px',
  }

  const sectionStyle = {
    marginBottom: 20,
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.06)',
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80 }}>
          <div style={{
            width: 90, height: 90,
            borderRadius: '50%',
            border: '4px solid rgba(200,164,90,0.2)',
            marginBottom: 24,
            animation: 'spin 1.5s linear infinite',
          }} />
          <div style={{ color: '#7a6a5a', fontSize: 14 }}>Scoring your conversation...</div>
          <div style={{ color: '#5a4a3a', fontSize: 12, marginTop: 8 }}>Billy's watching</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  const gradeColor = GRADE_COLOR[result.grade] || '#fff'

  return (
    <div style={containerStyle}>
      {/* Scene background tint */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: scene.bgImage ? `url(${scene.bgImage})` : undefined,
        backgroundSize: 'cover',
        filter: 'blur(8px) brightness(0.15)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={cardStyle}>
          {/* Header */}
          <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
            <div style={{ fontSize: 12, color: '#7a6a5a', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
              {scene.name}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#F5F0E8', margin: '0 0 4px' }}>
              Debrief
            </h2>
            <div style={{ color: '#5a4a3a', fontSize: 13 }}>{scene.character.name} · {scene.subtitle}</div>
          </div>

          {/* Grade + score */}
          <div style={{ ...sectionStyle, display: 'flex', alignItems: 'center', gap: 20 }}>
            <GradeRing grade={result.grade} animated={gradeAnimated} />
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>
                {result.score}<span style={{ fontSize: 18, color: '#5a4a3a' }}>/100</span>
              </div>
              <div style={{ color: '#C8A45A', fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                +{xpAnimated} XP
              </div>
              <div style={{ marginTop: 6 }}>
                {result.survived
                  ? <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 500 }}>✓ Survived</span>
                  : <span style={{ color: '#f87171', fontSize: 12 }}>✗ Conversation broke down</span>
                }
              </div>
            </div>
          </div>

          {/* Billy speaking indicator */}
          {speaking && (
            <div style={{
              ...sectionStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(200,164,90,0.08)',
              borderColor: 'rgba(200,164,90,0.2)',
            }}>
              <div style={{ fontSize: 18 }}>🎙</div>
              <div>
                <div style={{ color: '#C8A45A', fontSize: 12, fontWeight: 600 }}>Billy</div>
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{
                      width: 3, height: 14, borderRadius: 2, background: '#C8A45A',
                      animation: `billyWave 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Debrief text */}
          <div style={sectionStyle}>
            <p style={{ color: '#d0c8b8', fontSize: 15, lineHeight: 1.65, margin: 0 }}>{result.debrief}</p>
          </div>

          {/* How to sound more natural */}
          {(result.naturalTips?.length > 0 || result.highlights?.length > 0) && (
            <div style={{ ...sectionStyle, borderColor: 'rgba(139,184,212,0.2)', background: 'rgba(139,184,212,0.05)' }}>
              <div style={{ color: '#8BB8D4', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                How to sound more natural
              </div>
              {(result.naturalTips || result.highlights || []).map((tip, i) => {
                const tips = result.naturalTips || result.highlights || []
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < tips.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ color: '#8BB8D4', fontSize: 13, marginTop: 1, flexShrink: 0 }}>→</span>
                    <span style={{ color: '#a09080', fontSize: 13, lineHeight: 1.5 }}>{tip}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* New slang */}
          {result.newSlang?.length > 0 && (
            <div style={{ ...sectionStyle, background: 'rgba(200,164,90,0.05)', borderColor: 'rgba(200,164,90,0.15)' }}>
              <div style={{ color: '#C8A45A', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                New slang added to bank
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.newSlang.map((s, i) => (
                  <SlangItem key={i} phrase={s.phrase} meaning={s.meaning} delay={i * 200 + 400} />
                ))}
              </div>
            </div>
          )}

          {/* Corrections */}
          {result.mistakes?.length > 0 && (
            <div style={sectionStyle}>
              <div style={{ color: '#7a6a5a', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
                Corrections
              </div>
              {result.mistakes.map((m, i) => (
                <div key={i} style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: i < result.mistakes.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: '#f87171', fontSize: 13 }}>"{m.said}"</span>
                    <span style={{ color: '#5a4a3a', fontSize: 12 }}>→</span>
                    <span style={{ color: '#86efac', fontSize: 13 }}>"{m.better}"</span>
                  </div>
                  <div style={{ color: '#7a6a5a', fontSize: 12 }}>{m.note}</div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {nextSceneId && onNextScene && (
              <button onClick={onNextScene} style={{
                background: '#C8A45A', border: 'none', borderRadius: 6,
                color: '#0f0608', fontFamily: 'Inter, sans-serif',
                fontSize: 15, fontWeight: 700, padding: '14px 20px',
                cursor: 'pointer', letterSpacing: 0.5,
              }}>
                Next stop →
              </button>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <SharePostcard scene={scene} result={result} playerProfile={playerProfile} />
              <button onClick={onContinue} style={{
                flex: 1, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                color: '#a09080', fontFamily: 'Inter, sans-serif',
                fontSize: 14, fontWeight: 500, padding: '12px 20px', cursor: 'pointer',
              }}>
                Back to map
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes billyWave { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>
    </div>
  )
}
