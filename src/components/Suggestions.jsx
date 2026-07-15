export default function Suggestions({ historySuggestions, seasonal, onAddSuggestion }) {
  if (historySuggestions.length === 0 && seasonal.length === 0) return null

  return (
    <div className="suggestions-panel">
      {historySuggestions.length > 0 && (
        <div className="suggestion-block">
          <h4>You might be running low on…</h4>
          <div className="chip-row">
            {historySuggestions.map((name) => (
              <button key={name} className="chip" onClick={() => onAddSuggestion(name)}>
                + {name}
              </button>
            ))}
          </div>
        </div>
      )}
      {seasonal.length > 0 && (
        <div className="suggestion-block">
          <h4>In season / on sale this month</h4>
          <div className="chip-row">
            {seasonal.map((name) => (
              <button key={name} className="chip seasonal" onClick={() => onAddSuggestion(name)}>
                + {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
