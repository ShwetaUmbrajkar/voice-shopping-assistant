export default function SearchResults({ query, results, onAdd, onClose }) {
  return (
    <div className="search-overlay">
      <div className="search-panel">
        <div className="search-header">
          <h3>Results for "{query}"</h3>
          <button onClick={onClose} aria-label="Close search">✕</button>
        </div>
        {results.length === 0 ? (
          <p className="empty-state">No matching products found.</p>
        ) : (
          <ul className="search-results-list">
            {results.map((p) => (
              <li key={p.id} className="search-result-item">
                <div>
                  <strong>{p.name}</strong>
                  <div className="result-meta">{p.brand} · ${p.price.toFixed(2)} · {p.category}</div>
                </div>
                <button onClick={() => onAdd(p)}>Add</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
