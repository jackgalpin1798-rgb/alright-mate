import React, { useEffect, useRef, useState } from 'react'
import { useAudioAmplitude } from '../hooks/useAudioAmplitude'

// Randomly blinks every 3-6 seconds
function useBlink() {
  const [blinking, setBlinking] = useState(false)
  useEffect(() => {
    let timeout
    const schedule = () => {
      timeout = setTimeout(() => {
        setBlinking(true)
        setTimeout(() => { setBlinking(false); schedule() }, 160)
      }, 3000 + Math.random() * 3000)
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [])
  return blinking
}

export default function AnimatedCharacter({ character, speaking, className = '' }) {
  const amplitude = useAudioAmplitude(speaking)
  const blinking = useBlink()

  // Pick which image to show based on amplitude
  const imgs = character?.images
  if (!imgs) return null

  // Amplitude threshold for open mouth
  const mouthOpen = speaking && amplitude > 0.05

  const src = mouthOpen ? (imgs.talking || imgs.neutral) : imgs.neutral

  return (
    <div
      className={`animated-char ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <img
        src={src}
        alt={character.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
          // Subtle breathing
          animation: 'charBreathe 3.5s ease-in-out infinite',
          // Blink via CSS overlay handled separately
        }}
      />
      {/* Blink overlay */}
      {blinking && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          pointerEvents: 'none',
          // The blink is handled via the image swap — if we had blink images
          // For now just a very subtle dim during blink
          animation: 'charBlink 0.16s ease-in-out',
        }} />
      )}
      {/* Speaking glow */}
      {speaking && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, ${character.glowColor || 'rgba(255,200,100,0.12)'} 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'opacity 0.1s',
          opacity: 0.4 + amplitude * 2,
        }} />
      )}
    </div>
  )
}
