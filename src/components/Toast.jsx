export default function Toast({ messages }) {
  if (messages.length === 0) return null
  return (
    <div className="toast-stack" aria-live="polite">
      {messages.map((m) => (
        <div key={m.id} className={`toast toast-${m.type}`}>
          {m.text}
        </div>
      ))}
    </div>
  )
}
