import { useEffect, useRef, useState, useCallback } from 'react'

// Wraps the browser-native Web Speech API (SpeechRecognition).
// This is free, requires no API key, and works offline of any backend,
// which is why it's ideal for an 8-hour scoped project.
export function useSpeechRecognition({ lang = 'en-US', onResult } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.lang = lang

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult && onResult(transcript)
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.')
      } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setError('Microphone permission denied. Please allow mic access.')
      } else {
        setError(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition

    return () => {
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.start()
    } catch (e) {
      // start() throws if already started; ignore safely
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current && recognitionRef.current.stop()
  }, [])

  return { isListening, isSupported, error, startListening, stopListening }
}
