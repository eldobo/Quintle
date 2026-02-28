export default function Tile({ letter = '', status = 'empty', delay = 0 }) {
  const isRevealed = status === 'correct' || status === 'present' || status === 'absent'

  return (
    <div
      className={`tile tile--${status}`}
      style={isRevealed ? { animationDelay: `${delay}ms` } : {}}
    >
      {letter.toUpperCase()}
    </div>
  )
}
