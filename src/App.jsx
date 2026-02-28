import { useState, useEffect, useCallback } from 'react'
import Board from './components/Board'
import Keyboard from './components/Keyboard'
import { getRandomAnswer } from './words'
import { VALID_WORDS } from './validWords'
import { evaluateGuess, getLetterStatuses } from './gameLogic'
import './App.css'

const MAX_GUESSES = 6
const WORD_LENGTH = 5
const WIN_MESSAGES = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!']

export default function App() {
  const [target, setTarget] = useState(() => getRandomAnswer())
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState('playing') // 'playing' | 'won' | 'lost'
  const [message, setMessage] = useState('')
  const [invalid, setInvalid] = useState(false)

  const showMessage = useCallback((msg, duration = 1800) => {
    setMessage(msg)
    if (duration) setTimeout(() => setMessage(''), duration)
  }, [])

  const triggerInvalid = useCallback(() => {
    setInvalid(true)
    setTimeout(() => setInvalid(false), 600)
  }, [])

  const handleKey = useCallback((key) => {
    if (gameStatus !== 'playing') return

    if (key === 'Enter') {
      if (currentGuess.length < WORD_LENGTH) {
        showMessage('Not enough letters')
        triggerInvalid()
        return
      }
      if (!VALID_WORDS.has(currentGuess)) {
        showMessage('Not in word list')
        triggerInvalid()
        return
      }

      const result = evaluateGuess(currentGuess, target)
      const newGuesses = [...guesses, { word: currentGuess, result }]
      setGuesses(newGuesses)
      setCurrentGuess('')

      if (currentGuess === target) {
        showMessage(WIN_MESSAGES[guesses.length], 0)
        setGameStatus('won')
      } else if (newGuesses.length >= MAX_GUESSES) {
        showMessage(target.toUpperCase(), 0)
        setGameStatus('lost')
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(g => g.slice(0, -1))
    } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(g => g + key.toLowerCase())
    }
  }, [gameStatus, currentGuess, guesses, target, showMessage, triggerInvalid])

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return
      handleKey(e.key)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleKey])

  const handleNewGame = () => {
    setTarget(getRandomAnswer())
    setGuesses([])
    setCurrentGuess('')
    setGameStatus('playing')
    setMessage('')
  }

  const letterStatuses = getLetterStatuses(guesses)

  return (
    <div className="app">
      <header className="header">
        <h1>Wordle</h1>
      </header>

      {message && <div className="message">{message}</div>}

      <main className="main">
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          invalid={invalid}
        />
      </main>

      <footer className="footer">
        <Keyboard letterStatuses={letterStatuses} onKey={handleKey} />
        {gameStatus !== 'playing' && (
          <button className="new-game-btn" onClick={handleNewGame}>
            New Game
          </button>
        )}
      </footer>
    </div>
  )
}
