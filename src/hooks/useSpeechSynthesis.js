import { useCallback, useRef } from 'react'

// Wraps window.speechSynthesis to speak short confirmation messages back
// to the user, completing a hands-free voice-in/voice-out loop.
// Free, built into the browser, no API key required.
export function useSpeechSynthesis(lang = 'en-US') {
  const enabledRef = useRef(true)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback((text) => {
    if (!isSupported || !enabledRef.current || !text) return
    try {
      window.speechSynthesis.cancel() // avoid overlapping utterances
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1.05
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    } catch {
      // fail silently — voice output is a nice-to-have, never block the app
    }
  }, [isSupported, lang])

  const setEnabled = useCallback((val) => {
    enabledRef.current = val
    if (!val && isSupported) window.speechSynthesis.cancel()
  }, [isSupported])

  return { speak, setEnabled, isSupported }
}