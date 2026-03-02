/**
 * generate-words.mjs
 *
 * Regenerates src/validWords.js, src/words.js, and src/wordlist.txt from
 * public-domain sources:
 *
 *   Valid guesses — ENABLE1 word list (public domain)
 *     https://github.com/dolph/dictionary
 *
 *   Answer pool — ENABLE1 five-letter words ranked by Google unigram frequency
 *     https://norvig.com/ngrams/ (Peter Norvig, MIT licence)
 *
 * Usage:
 *   node scripts/generate-words.mjs
 *   node scripts/generate-words.mjs --answers 1200   # change answer pool size
 *
 * Requires Node 18+ (built-in fetch).
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const ENABLE1_URL = 'https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt'
const FREQ_URL    = 'https://norvig.com/ngrams/count_1w.txt'

const answerCount = (() => {
  const flag = process.argv.indexOf('--answers')
  return flag !== -1 ? parseInt(process.argv[flag + 1], 10) : 1000
})()

// ── Fetch ENABLE1 ────────────────────────────────────────────────────────────

console.log('Fetching ENABLE1 word list…')
const enable1Text = await fetch(ENABLE1_URL).then(r => {
  if (!r.ok) throw new Error(`ENABLE1 fetch failed: ${r.status}`)
  return r.text()
})

const enable5 = new Set(
  enable1Text.split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => /^[a-z]{5}$/.test(w))
)
console.log(`ENABLE1: ${enable5.size} five-letter words`)

// ── Fetch word frequencies ───────────────────────────────────────────────────

console.log('Fetching Norvig unigram frequencies…')
const freqText = await fetch(FREQ_URL).then(r => {
  if (!r.ok) throw new Error(`Frequency fetch failed: ${r.status}`)
  return r.text()
})

const freqMap = new Map()
for (const line of freqText.split('\n')) {
  const tab = line.indexOf('\t')
  if (tab === -1) continue
  const word  = line.slice(0, tab).trim().toLowerCase()
  const count = parseInt(line.slice(tab + 1).trim(), 10)
  if (enable5.has(word) && !isNaN(count)) freqMap.set(word, count)
}
console.log(`Frequency data found for ${freqMap.size} of ${enable5.size} five-letter words`)

// ── Build answer pool ────────────────────────────────────────────────────────

const answers = [...freqMap.entries()]
  .sort((a, b) => b[1] - a[1])     // descending frequency
  .slice(0, answerCount)
  .map(([word]) => word)
  .sort()                            // alphabetical for stable diffs

console.log(`Answer pool: ${answers.length} words`)
console.log(`Sample: ${answers.slice(0, 8).join(', ')}`)

// ── Helpers ──────────────────────────────────────────────────────────────────

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function quoted(words) {
  return chunk(words, 10)
    .map(row => '  ' + row.map(w => `'${w}'`).join(', ') + ',')
    .join('\n')
}

// ── Write validWords.js ──────────────────────────────────────────────────────

const validList = [...enable5].sort()

writeFileSync(join(ROOT, 'src/validWords.js'), [
  '// Valid guess words — ENABLE1 word list (public domain)',
  '// Source: https://github.com/dolph/dictionary',
  `// Generated: ${new Date().toISOString().slice(0, 10)}`,
  'export const VALID_WORDS = new Set([',
  quoted(validList),
  '])',
  '',
].join('\n'))
console.log(`Wrote src/validWords.js (${validList.length} words)`)

// ── Write words.js ───────────────────────────────────────────────────────────

writeFileSync(join(ROOT, 'src/words.js'), [
  '// Answer pool — top-frequency five-letter English words from ENABLE1',
  '// Sources: ENABLE1 (public domain) × Norvig/Google unigram frequencies (MIT)',
  '//   https://github.com/dolph/dictionary | https://norvig.com/ngrams/',
  `// Generated: ${new Date().toISOString().slice(0, 10)} | pool size: ${answers.length}`,
  'export const ANSWERS = [',
  quoted(answers),
  ']',
  '',
  'export function getRandomAnswer() {',
  '  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)]',
  '}',
  '',
].join('\n'))
console.log(`Wrote src/words.js (${answers.length} answers)`)

// ── Write wordlist.txt ───────────────────────────────────────────────────────

writeFileSync(join(ROOT, 'src/wordlist.txt'), validList.join('\n') + '\n')
console.log(`Wrote src/wordlist.txt`)
