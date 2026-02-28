const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
]

export default function Keyboard({ letterStatuses, onKey }) {
  return (
    <div className="keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map(key => {
            const isSpecial = key === 'Enter' || key === 'Backspace'
            const status = isSpecial ? 'special' : (letterStatuses[key] || 'unknown')
            return (
              <button
                key={key}
                className={`key key--${status}${isSpecial ? ' key--wide' : ''}`}
                onClick={() => onKey(key)}
              >
                {key === 'Backspace' ? '⌫' : key.toUpperCase()}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
