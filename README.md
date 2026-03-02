# Quintle

A Wordle clone built with React. Guess the 5-letter word in 6 tries. Each guess must be a valid
word. After each guess, tile colors reveal how close you are:

- **Green** — correct letter, correct position
- **Yellow** — correct letter, wrong position
- **Gray** — letter not in the word

## Features

- Full keyboard support (physical keyboard + on-screen)
- Correct duplicate-letter handling (two-pass algorithm matching the original Wordle rules)
- Flip-reveal, pop, and shake animations
- Responsive layout for mobile and desktop

## Getting Started

**Requirements:** Node 18+

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Tech Stack

- [React 19](https://react.dev)
- [Vite 7](https://vite.dev)
- Plain CSS (no UI library)

## Word List

Word lists are generated from public-domain sources:

- **Valid guesses** (`src/validWords.js`, `src/wordlist.txt`) — all 5-letter words from the
  [ENABLE1 word list](https://github.com/dolph/dictionary) (public domain)
- **Answer pool** (`src/words.js`) — top-1000 five-letter words by frequency, derived from
  [Peter Norvig's unigram frequency data](https://norvig.com/ngrams/) (MIT licence, Google corpus)

To regenerate:

```bash
node scripts/generate-words.mjs
# optional: node scripts/generate-words.mjs --answers 1200
```
