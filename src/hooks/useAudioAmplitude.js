import { useEffect, useRef, useState } from 'react'
import { getAmplitude } from '../services/elevenLabsService'

// Returns live amplitude 0-1 from whatever ElevenLabs is currently playing.
// Updates at 60fps when active is true.
export function useAudioAmplitude(active) {
  const [amplitude, setAmplitude] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) {
      setAmplitude(0)
      return
    }
    const loop = () => {
      setAmplitude(getAmplitude())
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  return amplitude
}

// Maps amplitude to mouth state string
export function amplitudeToMouthState(amplitude) {
  if (amplitude < 0.04) return 'neutral'
  if (amplitude < 0.15) return 'talking'
  return 'talking'
}
