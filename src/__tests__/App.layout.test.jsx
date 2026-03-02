import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock the Tauri API modules so dynamic imports don't throw in jsdom.
// The try/catch in handleViewChange would catch runtime errors, but mocking
// gives cleaner test output and lets us assert the calls if needed.
vi.mock('@tauri-apps/api/window', () => ({
  Window: { getCurrent: () => ({ setSize: vi.fn().mockResolvedValue(), center: vi.fn().mockResolvedValue() }) },
}))
vi.mock('@tauri-apps/api/dpi', () => ({
  LogicalSize: class { constructor(w, h) { this.width = w; this.height = h } },
}))

function setWidth(px) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: px })
}

// Reset window width before each test so tests are independent
beforeEach(() => setWidth(400))

// ─── Icon presence ────────────────────────────────────────────────────────────

describe('icon buttons', () => {
  it('renders both phone and monitor buttons', () => {
    render(<App />)
    expect(screen.getByTitle('Mobile layout')).toBeInTheDocument()
    expect(screen.getByTitle('Desktop layout')).toBeInTheDocument()
  })
})

// ─── Active state from window width on mount ──────────────────────────────────

describe('initial active state (auto-detected from window width)', () => {
  it('phone button is active when width is below BREAK_UP (620px)', () => {
    render(<App />)   // width = 400
    expect(screen.getByTitle('Mobile layout')).toHaveClass('view-btn--active')
    expect(screen.getByTitle('Desktop layout')).not.toHaveClass('view-btn--active')
  })

  it('monitor button is active when width exceeds BREAK_UP (620px)', () => {
    setWidth(700)
    render(<App />)
    expect(screen.getByTitle('Desktop layout')).toHaveClass('view-btn--active')
    expect(screen.getByTitle('Mobile layout')).not.toHaveClass('view-btn--active')
  })

  it('app--desktop class is set in desktop mode', () => {
    setWidth(700)
    const { container } = render(<App />)
    expect(container.firstChild).toHaveClass('app--desktop')
  })

  it('app--desktop class is absent in mobile mode', () => {
    const { container } = render(<App />)
    expect(container.firstChild).not.toHaveClass('app--desktop')
  })
})

// ─── Click-driven state change ────────────────────────────────────────────────

describe('clicking toggle buttons', () => {
  it('clicking monitor button switches to desktop mode', async () => {
    const user = userEvent.setup()
    render(<App />)  // starts mobile
    await user.click(screen.getByTitle('Desktop layout'))
    expect(screen.getByTitle('Desktop layout')).toHaveClass('view-btn--active')
    expect(screen.getByTitle('Mobile layout')).not.toHaveClass('view-btn--active')
  })

  it('clicking phone button switches to mobile mode', async () => {
    setWidth(700)
    const user = userEvent.setup()
    render(<App />)  // starts desktop
    await user.click(screen.getByTitle('Mobile layout'))
    expect(screen.getByTitle('Mobile layout')).toHaveClass('view-btn--active')
    expect(screen.getByTitle('Desktop layout')).not.toHaveClass('view-btn--active')
  })

  it('clicking the already-active button leaves state unchanged', async () => {
    const user = userEvent.setup()
    render(<App />)  // starts mobile
    await user.click(screen.getByTitle('Mobile layout'))
    expect(screen.getByTitle('Mobile layout')).toHaveClass('view-btn--active')
  })
})

// ─── Resize listener + hysteresis ────────────────────────────────────────────

describe('auto-detect from manual resize', () => {
  it('switches to desktop when width crosses BREAK_UP (620px) from mobile', () => {
    render(<App />)  // starts mobile at 400px
    act(() => {
      setWidth(650)
      fireEvent(window, new Event('resize'))
    })
    expect(screen.getByTitle('Desktop layout')).toHaveClass('view-btn--active')
  })

  it('switches to mobile when width drops below BREAK_DOWN (570px) from desktop', () => {
    setWidth(700)
    render(<App />)  // starts desktop
    act(() => {
      setWidth(500)
      fireEvent(window, new Event('resize'))
    })
    expect(screen.getByTitle('Mobile layout')).toHaveClass('view-btn--active')
  })

  it('stays mobile in hysteresis band (590px) when coming from mobile', () => {
    render(<App />)  // starts mobile at 400px
    act(() => {
      setWidth(590)
      fireEvent(window, new Event('resize'))
    })
    expect(screen.getByTitle('Mobile layout')).toHaveClass('view-btn--active')
  })

  it('stays desktop in hysteresis band (590px) when coming from desktop', () => {
    setWidth(700)
    render(<App />)  // starts desktop
    act(() => {
      setWidth(590)
      fireEvent(window, new Event('resize'))
    })
    expect(screen.getByTitle('Desktop layout')).toHaveClass('view-btn--active')
  })

  it('exactly at BREAK_UP boundary (620px) switches to desktop from mobile', () => {
    render(<App />)  // starts mobile at 400px
    act(() => {
      setWidth(620)
      fireEvent(window, new Event('resize'))
    })
    expect(screen.getByTitle('Desktop layout')).toHaveClass('view-btn--active')
  })

  it('exactly at BREAK_DOWN boundary (570px) stays desktop (not below)', () => {
    setWidth(700)
    render(<App />)  // starts desktop
    act(() => {
      setWidth(570)
      fireEvent(window, new Event('resize'))
    })
    // 570 is not < 570, so state should not change
    expect(screen.getByTitle('Desktop layout')).toHaveClass('view-btn--active')
  })
})
