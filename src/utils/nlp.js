// ---------------------------------------------------------------------
// Lightweight, dependency-free NLP intent parser.
// Instead of calling a paid NLP API, we use trigger-phrase dictionaries
// per language + regex extraction for quantity / price / brand. This
// keeps the whole pipeline free, fast, and works fully offline once
// speech has been transcribed by the browser's Web Speech API.
// ---------------------------------------------------------------------

// Trigger phrases that map to an intent, grouped by language.
// Extend this object to add more languages.
const TRIGGERS = {
  add: [
    'add', 'i need', 'i want to buy', 'i want', 'buy', 'get me', 'put',
    'quiero comprar', 'necesito', 'agrega', 'añade', // Spanish
    'mujhe chahiye', 'jodo', 'add karo', 'khareedna hai', // Hindi (transliterated)
  ],
  remove: [
    'remove', 'delete', 'take off', 'cancel',
    'elimina', 'quita', // Spanish
    'hatao', 'remove karo', // Hindi
  ],
  search: [
    'find', 'search for', 'search', 'look for', 'show me',
    'busca', 'encuentra', // Spanish
    'dhoondo', 'khojo', // Hindi
  ],
}

const STOPWORDS = [
  'to my list', 'to the list', 'from my list', 'from the list',
  'please', 'thanks', 'thank you',
]

function stripStopwords(text) {
  let out = text
  for (const sw of STOPWORDS) {
    out = out.replace(new RegExp(sw, 'gi'), '')
  }
  return out.trim()
}

function detectIntent(text) {
  const lower = text.toLowerCase()
  for (const [intent, phrases] of Object.entries(TRIGGERS)) {
    for (const phrase of phrases) {
      if (lower.includes(phrase)) return { intent, phrase }
    }
  }
  return { intent: 'unknown', phrase: null }
}

// Extract a leading quantity, e.g. "2 bottles of water" -> {qty:2, rest:"bottles of water"}
function extractQuantity(text) {
  const match = text.match(/\b(\d+)\b/)
  if (match) {
    return { qty: parseInt(match[1], 10), rest: text.replace(match[0], '').trim() }
  }
  // word numbers (basic set)
  const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, a: 1, an: 1, couple: 2, dozen: 12 }
  for (const [word, num] of Object.entries(words)) {
    const re = new RegExp(`\\b${word}\\b`, 'i')
    if (re.test(text)) {
      return { qty: num, rest: text.replace(re, '').trim() }
    }
  }
  return { qty: 1, rest: text }
}

function extractPriceMax(text) {
  const match = text.match(/(?:under|below|less than|cheaper than)\s*\$?(\d+(?:\.\d+)?)/i)
  return match ? parseFloat(match[1]) : null
}

function extractBrandOrQualifier(text) {
  const qualifiers = ['organic', 'gluten-free', 'gluten free', 'diet', 'sugar-free', 'sugar free']
  const lower = text.toLowerCase()
  return qualifiers.find((q) => lower.includes(q)) || null
}

function cleanItemName(text) {
  return text
    .replace(/\b(of|bottles?|packs?|units?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Parses a raw transcript into a structured command.
 * Returns: { intent, item, quantity, priceMax, qualifier, raw }
 */
export function parseCommand(rawText) {
  const raw = rawText.trim()
  const cleaned = stripStopwords(raw)
  const { intent, phrase } = detectIntent(cleaned)

  if (intent === 'unknown') {
    return { intent: 'unknown', item: null, quantity: null, priceMax: null, qualifier: null, raw }
  }

  // remove the trigger phrase itself from the remainder
  let remainder = cleaned.toLowerCase().replace(phrase, '').trim()

  const priceMax = extractPriceMax(remainder)
  remainder = remainder.replace(/(?:under|below|less than|cheaper than)\s*\$?\d+(?:\.\d+)?/i, '').trim()

  const qualifier = extractBrandOrQualifier(remainder)

  const { qty, rest } = extractQuantity(remainder)
  const item = cleanItemName(rest)

  return {
    intent,          // 'add' | 'remove' | 'search'
    item: item || null,
    quantity: qty,
    priceMax,
    qualifier,
    raw,
  }
}
