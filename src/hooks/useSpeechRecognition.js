import { useState, useRef, useCallback } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

  const startListening = useCallback((onResult, onInterim) => {
    if (!supported) {
      setError('Speech recognition not supported. Try Chrome.')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang = 'en-GB'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    setTranscript('')
    setError(null)
    setListening(true)
    recognition.onresult = (e) => {
      const current = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(current)
      onInterim?.(current)
      if (e.results[e.results.length - 1].isFinal) onResult?.(current)
    }
    recognition.onerror = (e) => {
      setError(e.error === 'no-speech' ? 'No speech detected — try again.' : `Mic error: ${e.error}`)
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognition.start()
  }, [supported])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { transcript, listening, error, supported, startListening, stopListening }
}
