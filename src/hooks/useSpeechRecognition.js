import { useState, useRef, useCallback } from 'react'

const SILENCE_MS = 1800

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const latestTranscriptRef = useRef('')

  const supported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  const startListening = useCallback((onResult, onInterim) => {
    if (!supported) { setError('Speech recognition not supported. Try Chrome.'); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognitionRef.current = recognition
    latestTranscriptRef.current = ''
    recognition.lang = 'en-GB'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    setError(null)
    setListening(true)

    recognition.onresult = (e) => {
      const current = Array.from(e.results).map(r => r[0].transcript).join('')
      latestTranscriptRef.current = current
      onInterim?.(current)
      clearTimeout(silenceTimerRef.current)
      if (e.results[e.results.length - 1].isFinal) {
        silenceTimerRef.current = setTimeout(() => {
          recognition.stop()
          if (current.trim()) onResult?.(current.trim())
        }, 400)
      } else {
        silenceTimerRef.current = setTimeout(() => {
          recognition.stop()
          if (current.trim()) onResult?.(current.trim())
        }, SILENCE_MS)
      }
    }

    recognition.onerror = (e) => {
      clearTimeout(silenceTimerRef.current)
      if (e.error !== 'aborted') {
        setError(e.error === 'no-speech' ? 'No speech detected — try again.' : `Mic error: ${e.error}`)
      }
      setListening(false)
    }

    recognition.onend = () => {
      clearTimeout(silenceTimerRef.current)
      setListening(false)
    }

    recognition.start()
  }, [supported])

  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current)
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, error, supported, startListening, stopListening }
}
