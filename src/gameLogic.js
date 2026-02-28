// Returns an array of 5 { letter, status } objects for a submitted guess.
// status is one of: 'correct' | 'present' | 'absent'
export function evaluateGuess(guess, target) {
  const result = guess.split('').map(letter => ({ letter, status: 'absent' }))
  const remaining = target.split('')

  // First pass: mark correct positions
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      result[i].status = 'correct'
      remaining[i] = null
    }
  }

  // Second pass: mark letters present elsewhere (but not already used)
  for (let i = 0; i < 5; i++) {
    if (result[i].status === 'correct') continue
    const idx = remaining.indexOf(guess[i])
    if (idx !== -1) {
      result[i].status = 'present'
      remaining[idx] = null
    }
  }

  return result
}

// Returns a map of letter → best status across all guesses so far.
// Used to color the keyboard keys.
export function getLetterStatuses(guesses) {
  const priority = { correct: 3, present: 2, absent: 1 }
  const statuses = {}

  for (const { result } of guesses) {
    for (const { letter, status } of result) {
      const current = statuses[letter]
      if (!current || priority[status] > priority[current]) {
        statuses[letter] = status
      }
    }
  }

  return statuses
}
