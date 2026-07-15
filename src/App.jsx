import { useEffect, useMemo, useState, useCallback } from 'react'
import MicButton from './components/MicButton.jsx'
import ShoppingList from './components/ShoppingList.jsx'
import Suggestions from './components/Suggestions.jsx'
import SearchResults from './components/SearchResults.jsx'
import LanguageSelector from './components/LanguageSelector.jsx'
import Toast from './components/Toast.jsx'
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis.js'
import { parseCommand } from './utils/nlp.js'
import { categorize } from './data/categoryMap.js'
import { getSubstitutes } from './data/substitutes.js'
import { getSeasonalPicks } from './data/seasonal.js'
import { loadList, saveList, loadHistory, bumpHistory } from './utils/storage.js'
import { searchLiveProducts } from './utils/productApi.js'
import catalog from './data/catalog.json'
import './App.css'

let toastId = 0

export default function App() {
  const [items, setItems] = useState(() => loadList())
  const [lang, setLang] = useState('en-US')
  const [toasts, setToasts] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [search, setSearch] = useState(null) // { query, results }
  const [isLoadingLive, setIsLoadingLive] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [voiceOutputOn, setVoiceOutputOn] = useState(() => localStorage.getItem('vsa_voice_out') !== 'off')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('vsa_dark') === 'on')

  const { speak, setEnabled: setSpeechEnabled } = useSpeechSynthesis(lang)

  useEffect(() => {
    setSpeechEnabled(voiceOutputOn)
    localStorage.setItem('vsa_voice_out', voiceOutputOn ? 'on' : 'off')
  }, [voiceOutputOn, setSpeechEnabled])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('vsa_dark', darkMode ? 'on' : 'off')
  }, [darkMode])

  const pushToast = useCallback((text, type = 'info', { announce } = {}) => {
    const id = ++toastId
    setToasts((t) => [...t, { id, text, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
    if (announce) speak(announce)
  }, [speak])

  useEffect(() => {
    saveList(items)
  }, [items])

  const addItem = useCallback((name, quantity = 1) => {
    const category = categorize(name)
    setItems((prev) => {
      const existing = prev.find((i) => i.name.toLowerCase() === name.toLowerCase())
      if (existing) {
        return prev.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...prev, { id: Date.now() + Math.random(), name, quantity, category }]
    })
    bumpHistory(name)
    pushToast(`Added ${quantity > 1 ? quantity + ' × ' : ''}${name}`, 'success', {
      announce: `Added ${name} to your list`,
    })

    const subs = getSubstitutes(name)
    if (subs.length) {
      pushToast(`Substitutes for ${name}: ${subs.join(', ')}`, 'info')
    }
  }, [pushToast])

  const removeItemByName = useCallback((name) => {
    setItems((prev) => {
      const match = prev.find((i) => i.name.toLowerCase().includes(name.toLowerCase()))
      if (!match) {
        pushToast(`Couldn't find "${name}" in your list`, 'error', { announce: `I couldn't find ${name}` })
        return prev
      }
      pushToast(`Removed ${match.name}`, 'success', { announce: `Removed ${match.name}` })
      return prev.filter((i) => i.id !== match.id)
    })
  }, [pushToast])

  const removeItemById = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const changeQty = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
        .filter(Boolean)
    )
  }, [])

  const clearList = useCallback(() => {
    if (items.length === 0) return
    if (window.confirm('Clear your entire shopping list?')) {
      setItems([])
      pushToast('List cleared', 'info')
    }
  }, [items.length, pushToast])

  const exportList = useCallback(() => {
    if (items.length === 0) {
      pushToast('Nothing to export yet', 'error')
      return
    }
    const lines = items.map((i) => `- ${i.name} x${i.quantity} (${i.category})`)
    const blob = new Blob([`Shopping List\n\n${lines.join('\n')}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'shopping-list.txt'
    a.click()
    URL.revokeObjectURL(url)
    pushToast('List exported', 'success')
  }, [items, pushToast])

  const runSearch = useCallback(async (query, priceMax, qualifier) => {
    const q = query.toLowerCase()
    let localResults = catalog.filter((p) => p.name.toLowerCase().includes(q))
    if (priceMax != null) localResults = localResults.filter((p) => p.price <= priceMax)
    if (qualifier) localResults = localResults.filter((p) => p.name.toLowerCase().includes(qualifier.split(' ')[0]))

    setSearch({ query, results: localResults })
    setIsLoadingLive(true)

    // Enrich with real-world product data from the free Open Food Facts API.
    // Runs after local results are already shown, so search never feels slow.
    const liveResults = await searchLiveProducts(query)
    setIsLoadingLive(false)
    setSearch((prev) => (prev && prev.query === query ? { query, results: [...prev.results, ...liveResults] } : prev))
  }, [])

  const handleTranscript = useCallback((transcript) => {
    setIsProcessing(true)
    pushToast(`Heard: "${transcript}"`, 'heard')

    setTimeout(() => {
      const cmd = parseCommand(transcript)

      if (cmd.intent === 'add' && cmd.item) {
        addItem(cmd.item, cmd.quantity || 1)
      } else if (cmd.intent === 'remove' && cmd.item) {
        removeItemByName(cmd.item)
      } else if (cmd.intent === 'search' && cmd.item) {
        runSearch(cmd.item, cmd.priceMax, cmd.qualifier)
      } else {
        pushToast(`Sorry, I didn't understand: "${transcript}"`, 'error', {
          announce: "Sorry, I didn't catch that",
        })
      }
      setIsProcessing(false)
    }, 300) // small delay so the "processing" state is visible (UX feedback)
  }, [addItem, removeItemByName, runSearch, pushToast])

  const { isListening, isSupported, error, startListening } = useSpeechRecognition({
    lang,
    onResult: handleTranscript,
  })

  useEffect(() => {
    if (error) pushToast(error, 'error')
  }, [error, pushToast])

  // Smart suggestions: items bought 2+ times before, not currently on the list
  const historySuggestions = useMemo(() => {
    const history = loadHistory()
    const currentNames = new Set(items.map((i) => i.name.toLowerCase()))
    return Object.entries(history)
      .filter(([name, count]) => count >= 2 && !currentNames.has(name))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name.replace(/\b\w/g, (c) => c.toUpperCase()))
  }, [items])

  const seasonal = useMemo(() => getSeasonalPicks(), [])

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (!textInput.trim()) return
    handleTranscript(textInput.trim())
    setTextInput('')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>🛒 Voice Shopping Assistant</h1>
        <div className="header-controls">
          <LanguageSelector lang={lang} onChange={setLang} />
          <button
            className="icon-toggle"
            title={voiceOutputOn ? 'Voice replies on' : 'Voice replies off'}
            onClick={() => setVoiceOutputOn((v) => !v)}
          >
            {voiceOutputOn ? '🔊' : '🔇'}
          </button>
          <button
            className="icon-toggle"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="voice-section">
          {!isSupported ? (
            <p className="warning-banner">
              Voice recognition isn't supported in this browser. Try Chrome or Edge, or use the text box below.
            </p>
          ) : (
            <MicButton
              isListening={isListening}
              isProcessing={isProcessing}
              onClick={startListening}
              disabled={isProcessing}
            />
          )}

          <form className="text-fallback" onSubmit={handleTextSubmit}>
            <input
              type="text"
              placeholder='Or type a command, e.g. "Add 2 bottles of water"'
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </section>

        <Suggestions
          historySuggestions={historySuggestions}
          seasonal={seasonal}
          onAddSuggestion={(name) => addItem(name, 1)}
        />

        <section className="list-section">
          <div className="list-header-row">
            <h2>Your Shopping List ({items.reduce((s, i) => s + i.quantity, 0)} items)</h2>
            <div className="list-actions">
              <button className="text-btn" onClick={exportList}>Export</button>
              <button className="text-btn danger" onClick={clearList}>Clear</button>
            </div>
          </div>
          <ShoppingList items={items} onRemove={removeItemById} onQtyChange={changeQty} />
        </section>
      </main>

      {search && (
        <SearchResults
          query={search.query}
          results={search.results}
          isLoadingLive={isLoadingLive}
          onAdd={(p) => {
            addItem(p.name, 1)
            setSearch(null)
          }}
          onClose={() => setSearch(null)}
        />
      )}

      <Toast messages={toasts} />
    </div>
  )
}