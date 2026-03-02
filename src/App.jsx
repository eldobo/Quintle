import { useState, useEffect, useCallback, useRef } from 'react'
import Board from './components/Board'
import Keyboard from './components/Keyboard'
import { getRandomAnswer } from './words'
import { VALID_WORDS } from './validWords'
import { evaluateGuess, getLetterStatuses } from './gameLogic'

const MAX_GUESSES = 6
const WORD_LENGTH = 5
const WIN_MESSAGES = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!']

const DESKTOP_WIDTH  = 700, DESKTOP_HEIGHT = 840
const MOBILE_WIDTH   = 500, MOBILE_HEIGHT  = 720
const BREAK_UP   = 620 // px — switch to desktop when wider than this
const BREAK_DOWN = 570 // px — switch to mobile when narrower than this (hysteresis band)

const PhoneIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="1" width="10" height="18" rx="2"/>
    <circle cx="10" cy="15.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)

const MonitorIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="2" width="18" height="12" rx="1.5"/>
    <path d="M7 18h6M10 14v4" strokeLinecap="round"/>
  </svg>
)

export default function App() {
  const [target, setTarget] = useState(() => getRandomAnswer())
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState('playing') // 'playing' | 'won' | 'lost'
  const [message, setMessage] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const messageTimerRef = useRef(null)

  const showMessage = useCallback((msg, duration = 1800) => {
    clearTimeout(messageTimerRef.current)
    setMessage(msg)
    if (duration) {
      messageTimerRef.current = setTimeout(() => setMessage(''), duration)
    }
  }, [])

  const triggerInvalid = useCallback(() => {
    setInvalid(true)
    setTimeout(() => setInvalid(false), 600)
  }, [])

  // Auto-detect mode from window width (with hysteresis to prevent jitter)
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      setIsDesktop(prev => {
        if (!prev && w >= BREAK_UP)  return true
        if (prev  && w < BREAK_DOWN) return false
        return prev
      })
    }
    window.addEventListener('resize', onResize)
    onResize() // sync initial state
    return () => window.removeEventListener('resize', onResize)
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
    clearTimeout(messageTimerRef.current)
    setTarget(getRandomAnswer())
    setGuesses([])
    setCurrentGuess('')
    setGameStatus('playing')
    setMessage('')
  }

  // Click handler: set state and snap Tauri window to canonical size
  const handleViewChange = async (desktop) => {
    setIsDesktop(desktop)
    try {
      const { Window }      = await import('@tauri-apps/api/window')
      const { LogicalSize } = await import('@tauri-apps/api/dpi')
      const win = Window.getCurrent()
      await win.setSize(new LogicalSize(
        desktop ? DESKTOP_WIDTH : MOBILE_WIDTH,
        desktop ? DESKTOP_HEIGHT : MOBILE_HEIGHT,
      ))
      await win.center()
    } catch { /* running in browser — Tauri API not available */ }
  }

  const letterStatuses = getLetterStatuses(guesses)

  return (
    <div className={`app${isDesktop ? ' app--desktop' : ''}`}>
      <header className="header">
        <h1>Quintle</h1>
        <div className="view-toggle">
          <button
            className={`view-btn${!isDesktop ? ' view-btn--active' : ''}`}
            onClick={() => handleViewChange(false)}
            title="Mobile layout"
          >{PhoneIcon}</button>
          <button
            className={`view-btn${isDesktop ? ' view-btn--active' : ''}`}
            onClick={() => handleViewChange(true)}
            title="Desktop layout"
          >{MonitorIcon}</button>
        </div>
      </header>

      {(message || gameStatus !== 'playing') && (
        <div className="toast-area">
          {message && (
            <div className={`message${gameStatus !== 'playing' ? ' message--end-game' : ''}`}>
              {message}
            </div>
          )}
          {gameStatus !== 'playing' && (
            <button className="new-game-btn" onClick={handleNewGame}>
              New Game
            </button>
          )}
        </div>
      )}

      <main className="main">
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          invalid={invalid}
        />
      </main>

      <footer className="footer">
        <Keyboard letterStatuses={letterStatuses} onKey={handleKey} />
      </footer>
    </div>
  )
}
