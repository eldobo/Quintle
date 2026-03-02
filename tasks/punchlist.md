# Punchlist

Items queued for future work.

---

## Stats tracking

Add a persistent stats panel showing game history across sessions.

**Requirements:**
- Win / loss record and win percentage
- Guess distribution: bar chart of wins by guess number (1–6)
- Average solve time for winning games (time from first keypress to correct guess)

**Design notes:**
- Persist via `localStorage` so stats survive app restarts
- Show stats in a modal or slide-in panel accessible from the header
- Reset option (with confirmation)
- Stats should survive a "New Game" click — only reset on explicit clear
- Timing: start the clock on the first letter typed, stop on the winning Enter
