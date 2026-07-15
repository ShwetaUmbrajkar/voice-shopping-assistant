export default function SearchResults({ query, results, isLoadingLive, onAdd, onClose }) {
  return (
    <div className="search-overlay">
      <div className="search-panel">
        <div className="search-header">
          <h3>Results for "{query}"</h3>
          <button onClick={onClose} aria-label="Close search">✕</button>
        </div>
        {results.length === 0 && !isLoadingLive ? (
          <p className="empty-state">No matching products found.</p>
        ) : (
          <ul className="search-results-list">
            {results.map((p) => (
              <li key={p.id} className="search-result-item">
                <div>
                  <strong>{p.name}</strong> {p.live && <span className="live-badge">LIVE</span>}
                  <div className="result-meta">
                    {p.brand} · {p.price != null ? `$${p.price.toFixed(2)}` : 'price n/a'} · {p.category}
                  </div>
                </div>
                <button onClick={() => onAdd(p)}>Add</button>
              </li>
            ))}
          </ul>
        )}
        {isLoadingLive && <p className="loading-hint">Fetching live results…</p>}
      </div>
    </div>
  )
}