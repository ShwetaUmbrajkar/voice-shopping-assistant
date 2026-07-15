# 🛒 Voice Command Shopping Assistant

A voice-based shopping list manager with smart suggestions, built as a client-only
React app so it's free to run, free to host, and requires no API keys.

**Live demo:** _add your deployed URL here after step 3 below_
**Repo:** _add your GitHub URL here_

---

## ✅ Features implemented (mapped to the brief)

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

## 🏗️ Architecture

```
voice-shopping-assistant/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx                 # React entry point
    ├── App.jsx                  # Main app logic & state
    ├── App.css / index.css      # Styling
    ├── hooks/
    │   └── useSpeechRecognition.js   # Web Speech API wrapper
    ├── utils/
    │   ├── nlp.js               # Intent parser (add/remove/search + qty/price)
    │   └── storage.js           # localStorage persistence + purchase history
    ├── data/
    │   ├── catalog.json         # Sample product catalog (search/price filter)
    │   ├── categoryMap.js       # Keyword → category rules
    │   ├── substitutes.js       # Keyword → substitute suggestions
    │   └── seasonal.js          # Month → seasonal picks
    └── components/
        ├── MicButton.jsx
        ├── ShoppingList.jsx
        ├── Suggestions.jsx
        ├── SearchResults.jsx
        ├── LanguageSelector.jsx
        └── Toast.jsx
```

**Why no backend?** Everything (list, history, catalog) runs client-side with
`localStorage`. This meets the "reliable hosting platform" requirement via a
static host (Vercel/Netlify/Firebase Hosting) while keeping the whole build
free-tier and removable of any server maintenance — a deliberate scope
decision to fit the 8-hour budget without sacrificing any required feature.

---

## 🚀 Run locally (using Anaconda Prompt / VS Code terminal)

You already have Anaconda + VS Code, so Node.js may not be installed yet. Easiest path:

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
```

Open the printed URL (usually `http://localhost:5173`) in **Chrome or Edge**
(Web Speech API support is best there; Firefox/Safari support is partial).
Click the mic button, allow microphone access, and try:

- "Add milk"
- "I need 2 bottles of water"
- "I want to buy bananas"
- "Remove milk from my list"
- "Find me organic apples"
- "Find toothpaste under $5"

If mic access isn't available (e.g., no microphone, or testing on a
restricted network), use the text box under the mic button — it runs through
the exact same NLP pipeline.

---

## ☁️ Deploy (pick one — all free)

### Option A: Vercel (recommended, fastest)
```bash
npm install -g vercel
vercel login
vercel --prod
```
Follow the prompts (accept defaults — Vercel auto-detects Vite). You'll get a
live `https://your-app.vercel.app` URL.

### Option B: Netlify
```bash
npm run build
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option C: Firebase Hosting
```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting   # choose "dist" as the public directory, configure as a single-page app: Yes
firebase deploy
```

> ⚠️ Important: the Web Speech API requires **HTTPS** (or `localhost`). All
> three options above serve over HTTPS by default, so voice input will work
> once deployed.

---

## 📦 Push to GitHub

```bash
cd path\to\voice-shopping-assistant
git init
git add .
git commit -m "Voice Command Shopping Assistant - initial submission"
git branch -M main
git remote add origin https://github.com/<your-username>/voice-shopping-assistant.git
git push -u origin main
```

---

## ✍️ Approach write-up (submit this as your ~200-word summary)

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

(Trim/adjust freely — this is written to be under 200 words as required.)

---

## 💡 Extras beyond the brief (nice to mention in your submission email)

- **Text-command fallback** — types the exact same NLP pipeline as voice, useful for accessibility and for reviewers testing without a mic.
- **Quantity stepper controls** in the list UI (not just voice).
- **Toast-based substitute suggestions** shown automatically when a substitutable item (milk, bread, sugar, etc.) is added.
- **Multilingual trigger dictionary**, not just multilingual transcription — Spanish/Hindi phrases are recognized by the NLP layer itself.
- **LocalStorage-based purchase history** that grows smarter the more you use the app.

## 🔭 Ideas if you get extra time later
- Swap the rule-based NLP for a small LLM call (e.g., free-tier Groq/Gemini) for more flexible phrasing.
- Real product data via a free grocery API (Open Food Facts) instead of the static catalog.
- PWA install support for a true "mobile app" feel.
- Voice output (SpeechSynthesis API) for confirmations — full hands-free loop.
- User accounts + cloud sync (Firebase Auth + Firestore) instead of localStorage.
