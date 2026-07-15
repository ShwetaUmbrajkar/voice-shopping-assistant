export default function MicButton({ isListening, isProcessing, onClick, disabled }) {
  return (
    <button
      className={`mic-btn ${isListening ? 'listening' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label="Start voice command"
    >
      <span className="mic-icon">{isProcessing ? '⏳' : isListening ? '🎙️' : '🎤'}</span>
      <span className="mic-label">
        {isProcessing ? 'Processing…' : isListening ? 'Listening…' : 'Tap to speak'}
      </span>
    </button>
  )
}
