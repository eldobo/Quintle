import Tile from './Tile'

const ROWS = 6
const COLS = 5

export default function Board({ guesses, currentGuess, invalid }) {
  const currentRow = guesses.length

  return (
    <div className="board">
      {Array.from({ length: ROWS }, (_, r) => {
        const isCurrentRow = r === currentRow
        const isInvalid = isCurrentRow && invalid

        return (
          <div key={r} className={`board-row${isInvalid ? ' board-row--shake' : ''}`}>
            {Array.from({ length: COLS }, (_, c) => {
              if (r < guesses.length) {
                const { letter, status } = guesses[r].result[c]
                return <Tile key={c} letter={letter} status={status} delay={c * 100} />
              }
              if (isCurrentRow) {
                const letter = currentGuess[c] || ''
                return <Tile key={c} letter={letter} status={letter ? 'tbd' : 'empty'} />
              }
              return <Tile key={c} />
            })}
          </div>
        )
      })}
    </div>
  )
}
