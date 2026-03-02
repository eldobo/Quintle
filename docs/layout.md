# Layout System

## Overview

Quintle has two layout modes — **mobile** and **desktop** — both using a single stacked
column (board above keyboard). Desktop mode is the same structure at a larger scale: wider
window, bigger tiles, taller keys. There is no side-by-side grid.

## Toggle

The header contains two icon buttons (always visible):

| Icon | Mode | Canonical window size |
|------|------|-----------------------|
| Phone | Mobile | 500 × 720 (logical px) |
| Monitor | Desktop | 700 × 840 (logical px) |

The **active** icon is colored green (`var(--correct)`). The inactive icon is gray
(`var(--tile-border-empty)`). Clicking an icon:

1. Sets the `isDesktop` React state
2. Calls the Tauri `window.setSize()` API to snap to the canonical size
3. Calls `window.center()` to keep the window centred on screen

In a browser (non-Tauri) the resize and center steps are silently skipped via try/catch.

## Auto-detect from Manual Resize

A `resize` event listener on `window` watches `innerWidth` and updates the icon state
without triggering another programmatic resize:

| Condition | Action |
|-----------|--------|
| `innerWidth ≥ 620px` and currently mobile | Switch to desktop |
| `innerWidth < 570px` and currently desktop | Switch to mobile |
| `570–620px` (hysteresis band) | No change |

The hysteresis band prevents icon flicker when the window edge sits near the boundary.
The listener also fires once on mount to sync initial state with the actual window size.

## CSS Sizing System

Tile and key sizes are computed proportionally from the window height, so the game fills
the available space at any window size. The mechanism is CSS custom properties:

| Variable | Purpose | Mobile | Desktop |
|----------|---------|--------|---------|
| `--tile-scale` | Canonical tile px (unitless) | `62` | `80` |
| `--key-scale` | Canonical key height px (unitless) | `58` | `68` |
| `--ref-h` | Canonical non-header height px (unitless) | `670` | `790` |
| `--app-max-w` | Content max-width | `500px` | `700px` |
| `--key-w` | Key min-width | `43px` | `52px` |
| `--key-wide-w` | Wide key (Enter/Backspace) min-width | `65px` | `80px` |

The scaling formulas:

```css
/* Tile: fills height proportionally, capped by horizontal space */
--tile-natural: calc(var(--tile-scale) / var(--ref-h) * (100dvh - 50px));
--tile-w-max:   calc((min(100vw, var(--app-max-w)) - 20px) / 5);
--tile-actual:  clamp(24px, var(--tile-natural), var(--tile-w-max));

/* Key: proportional height, fixed min-width */
--key-natural: calc(var(--key-scale) / var(--ref-h) * (100dvh - 50px));
height: clamp(24px, var(--key-natural), 100px);
```

At the canonical window height the formulas evaluate to exactly the canonical px values
(e.g. at 840px desktop window: `80 / 790 * 790 = 80px`). Tiles and keys have `transition:
150ms ease` on size properties so the layout morphs visibly when the class changes.

The mode switch is a single class toggle (`app--desktop`) on the root element.

### Desktop sizing math

- Board: 6 rows × 80px + 5 × 5px gap = **505px**
- Keyboard: 3 rows × 68px + 2 × 8px gap = **220px**
- Header + padding ≈ **115px**
- Total content ≈ 840px → window height **840px**
- Keyboard row 1: 10 × 52px + 9 × 6px = 574px → fits in **700px** window width

## Narrow-screen Fallbacks

Below `max-width: 480px` the keyboard scales down (32px keys, 4px gaps) to prevent
overflow on phones. These media queries are independent of the mobile/desktop mode toggle.

## Tauri Capabilities

The Tauri window resize and center calls require explicit capability grants in
`src-tauri/capabilities/default.json`:

```json
"core:window:allow-set-size",
"core:window:allow-center"
```

Without these, the API calls are silently rejected at runtime.
