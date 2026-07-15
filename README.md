# Voice Command Shopping Assistant

A voice-based shopping list manager with smart suggestions, built as a client-only
React app so it's free to run, free to host, and requires no API keys.

**Live demo:** https://voice-shopping-assistant-omega.vercel.app

**Repo:** https://github.com/ShwetaUmbrajkar/voice-shopping-assistant.git

---

## Features implemented

| # | Requirement | How it's implemented |
|---|---|---|
| 1 | Voice Command Recognition | Browser-native `SpeechRecognition` (Web Speech API) via `useSpeechRecognition` hook |
| 1 | NLP for varied phrases | Rule-based intent parser (`src/utils/nlp.js`) recognizes many trigger phrases ("add", "I need", "I want to buy", "get me"…) |
| 1 | Multilingual support | Language dropdown (English US/IN, Hindi, Spanish, French, German) sets `recognition.lang`; NLP trigger dictionary also includes Spanish & Hindi (transliterated) keywords |
| 2 | Product recommendations | "Running low on…" suggestions from purchase-frequency history stored in `localStorage` |
| 2 | Seasonal recommendations | Static month-keyed seasonal picks (`src/data/seasonal.js`) |
| 2 | Substitutes | Keyword-based substitute map (`src/data/substitutes.js`) surfaced as a toast whenever a matching item is added |
| 3 | Add/remove/modify by voice | `parseCommand` → `add` / `remove` intents; +/− quantity steppers in the UI |
| 3 | Auto categorization | Keyword-to-category map (`src/data/categoryMap.js`) groups items into Dairy, Produce, Bakery, Snacks, Beverages, Pantry, Household, Personal Care |
| 3 | Quantity management | Number & basic word-number extraction ("2 bottles of water", "a dozen eggs") |
| 4 | Voice-activated search | `search` intent queries a local product catalog (`src/data/catalog.json`) by name |
| 4 | Price range / brand filtering | "under $5" parsed into `priceMax`; qualifiers like "organic" filter results |
| 11 | Minimalist UI | Single-column mobile-first layout, category-grouped list |
| 11 | Visual feedback | Toast stack shows "Heard: …", confirmations, and errors in real time; mic button animates while listening/processing |
| 11 | Mobile/voice-first | Responsive layout capped at 480px, large tap target mic button, text-input fallback for accessibility/typing |
| 12 | Hosting | Static Vite build — deployable to Vercel/Netlify/Firebase Hosting in one command (see below) |

**Error handling / loading states:** unsupported-browser banner, mic permission
denied message, "no speech detected" message, a text-command fallback input so the
app is always usable, and a "Processing…" mic state while a command is parsed.

---

## Architecture

```
voice-shopping-assistant/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── public/
│   ├── manifest.json         # PWA manifest (installable app)
│   ├── sw.js                 # Service worker (offline caching)
│   ├── icon-192.png
│   └── icon-512.png
└── src/
    ├── main.jsx                 # React entry point + service worker registration
    ├── App.jsx                  # Main app logic & state
    ├── App.css / index.css      # Styling (incl. dark mode CSS variables)
    ├── hooks/
    │   ├── useSpeechRecognition.js   # Web Speech API wrapper (voice IN)
    │   └── useSpeechSynthesis.js     # SpeechSynthesis wrapper (voice OUT)
    ├── utils/
    │   ├── nlp.js               # Intent parser (add/remove/search + qty/price)
    │   ├── storage.js           # localStorage persistence + purchase history
    │   └── productApi.js        # Live Open Food Facts search client
    ├── data/
    │   ├── catalog.json         # Sample product catalog (search/price filter)
    │   ├── categoryMap.js       # Keyword → category rules
    │   ├── substitutes.js       # Keyword → substitute suggestions
    │   └── seasonal.js          # Month → seasonal picks
    └── components/
        ├── MicButton.jsx
        ├── ShoppingList.jsx
        ├── Suggestions.jsx
        ├── SearchResults.jsx     # Now shows LIVE-tagged real product results
        ├── LanguageSelector.jsx
        └── Toast.jsx
```
Why no backend? Everything (list, history, catalog) runs client-side with localStorage. This meets the "reliable hosting platform" requirement via a static host (Vercel) while keeping the whole build free-tier and removable of any server maintenance — a deliberate scope decision to fit the 8-hour budget without sacrificing any required feature.

---

## Run locally (using Anaconda Prompt / VS Code terminal)

```bash
# 1. Create an isolated env with Node (via conda-forge) — run in Anaconda Prompt
conda create -n voiceassistant nodejs=20 -c conda-forge -y
conda activate voiceassistant

# 2. Go to the project folder (after you unzip it)
cd path\to\voice-shopping-assistant

# 3. Install dependencies
npm install

# 4. Run the dev server
npm run dev
Open the printed URL (usually http://localhost:5173) in Chrome or Edge (Web Speech API support is best there; Firefox/Safari support is partial). Click the mic button, allow microphone access, and try:

"Add milk"
"I need 2 bottles of water"
"I want to buy bananas"
"Remove milk from my list"
"Find me organic apples"
"Find toothpaste under $5"
If mic access isn't available (e.g., no microphone, or testing on a restricted network), use the text box under the mic button — it runs through the exact same NLP pipeline.

---

## Approach 

> I built the assistant as a single-page React (Vite) app so voice input,
> NLP, list management, and hosting could all be free-tier and dependency-light,
> fitting the 8-hour scope. Voice capture uses the browser's native Web Speech
> API — no external speech-to-text service or API key required — with a
> language selector for multilingual input (English, Hindi, Spanish, French,
> German). Transcripts pass through a rule-based NLP parser that matches
> trigger phrases across languages ("add"/"I need"/"quiero comprar") and
> extracts intent, item name, quantity, price ceiling, and qualifiers like
> "organic" using targeted regex — avoiding the latency/cost of a full LLM
> call for well-scoped grocery commands. Items are auto-categorized via a
> keyword map, and smart suggestions come from three sources: purchase
> frequency stored in `localStorage` ("running low on…"), a static
> seasonal-picks calendar, and a substitute map surfaced as a toast when a
> relevant item is added. Voice search filters a local product catalog by
> name, price ceiling, and qualifiers. The UI is mobile-first and minimal,
> with real-time toast feedback for every recognized command, loading/listening
> states on the mic button, and a text-input fallback for accessibility and
> for environments without microphone access.
---

