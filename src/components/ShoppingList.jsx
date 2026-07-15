export default function ShoppingList({ items, onRemove, onQtyChange }) {
  if (items.length === 0) {
    return <p className="empty-state">Your list is empty. Try saying "Add milk".</p>
  }

  const grouped = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="shopping-list">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="category-group">
          <h3 className="category-title">{category}</h3>
          <ul>
            {categoryItems.map((item) => (
              <li key={item.id} className="list-item">
                <span className="item-name">{item.name}</span>
                <div className="item-controls">
                  <button onClick={() => onQtyChange(item.id, -1)} aria-label="Decrease quantity">−</button>
                  <span className="item-qty">{item.quantity}</span>
                  <button onClick={() => onQtyChange(item.id, 1)} aria-label="Increase quantity">+</button>
                  <button className="remove-btn" onClick={() => onRemove(item.id)} aria-label="Remove item">✕</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
