const LIST_KEY = 'vsa_shopping_list'
const HISTORY_KEY = 'vsa_purchase_history'

export function loadList() {
  try {
    const raw = localStorage.getItem(LIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveList(list) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list))
}

// history = { [itemNameLower]: countAddedOverTime }
export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function bumpHistory(itemName) {
  const history = loadHistory()
  const key = itemName.toLowerCase()
  history[key] = (history[key] || 0) + 1
  saveHistory(history)
  return history
}
