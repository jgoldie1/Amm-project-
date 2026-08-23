// AMM Omniverse — Global Swipe Gesture System
// Up/Down/Left/Right swipe navigation for Gen Z / Gen Alpha
// Works on touch screens, mouse drag, and trackpad
// Plugs into every screen in the app

import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../game/state/useGameStore'

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

interface SwipeConfig {
  onSwipe?: (dir: SwipeDirection) => void
  threshold?: number        // px to count as a swipe
  velocityThreshold?: number
  preventScroll?: boolean
}

// ── CORE SWIPE HOOK ──────────────────────────────────────────────────────────
export function useSwipe(config: SwipeConfig) {
  const { onSwipe, threshold = 60, preventScroll = false } = config
  const startX = useRef(0)
  const startY = useRef(0)
  const startTime = useRef(0)
  const swiping = useRef(false)

  const handleStart = useCallback((x: number, y: number) => {
    startX.current = x
    startY.current = y
    startTime.current = Date.now()
    swiping.current = true
  }, [])

  const handleEnd = useCallback((x: number, y: number) => {
    if (!swiping.current) return
    swiping.current = false
    const dx = x - startX.current
    const dy = y - startY.current
    const elapsed = Date.now() - startTime.current
    const speed = Math.sqrt(dx * dx + dy * dy) / elapsed  // px/ms
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (Math.max(absDx, absDy) < threshold) return
    if (speed < 0.1) return  // too slow

    let dir: SwipeDirection
    if (absDx > absDy) {
      dir = dx > 0 ? 'right' : 'left'
    } else {
      dir = dy > 0 ? 'down' : 'up'
    }
    onSwipe?.(dir)
  }, [onSwipe, threshold])

  const handlers = {
    // Touch events
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0]
      handleStart(t.clientX, t.clientY)
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const t = e.changedTouches[0]
      handleEnd(t.clientX, t.clientY)
    },
    onTouchMove: preventScroll ? (e: React.TouchEvent) => {
      if (swiping.current) e.preventDefault()
    } : undefined,

    // Mouse events (desktop drag)
    onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX, e.clientY),
    onMouseUp:   (e: React.MouseEvent) => handleEnd(e.clientX, e.clientY),
  }

  return handlers
}

// ── APP-LEVEL SWIPE NAVIGATOR ────────────────────────────────────────────────
// Wraps the entire app. Swipe to navigate realms.
// UP = open Holoverse | DOWN = open city | LEFT = prev realm | RIGHT = next realm

const REALM_ORDER = ['city', 'sports', 'marketplace', 'music', 'faith', 'blockchain'] as const
type Realm = typeof REALM_ORDER[number]

export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const store = useGameStore()
  const screen = store.screen as string
  const swipeHandlers = useSwipe({
    threshold: 70,
    preventScroll: false,
    onSwipe: (dir) => {
      const currentIdx = REALM_ORDER.indexOf(screen as Realm)

      if (dir === 'up') {
        // Swipe up → Holoverse overlay
        if ((window as any).__showHoloverse) (window as any).__showHoloverse()
        return
      }
      if (dir === 'down') {
        // Swipe down → go to city
        if (screen !== 'city') store.setScreen('city')
        return
      }

      // Horizontal swipe to navigate realms
      if (currentIdx === -1) return  // not on a realm screen
      if (dir === 'left') {
        const next = REALM_ORDER[(currentIdx + 1) % REALM_ORDER.length]
        store.setScreen(next)
        showSwipeIndicator(next, 'left')
      }
      if (dir === 'right') {
        const prev = REALM_ORDER[(currentIdx - 1 + REALM_ORDER.length) % REALM_ORDER.length]
        store.setScreen(prev)
        showSwipeIndicator(prev, 'right')
      }
    }
  })

  return (
    <div {...swipeHandlers} style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}>
      {children}
    </div>
  )
}

function showSwipeIndicator(realm: string, dir: SwipeDirection) {
  const el = document.createElement('div')
  const arrow = dir === 'left' ? '→' : '←'
  el.textContent = `${arrow} ${realm.toUpperCase()}`
  el.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,255,204,0.15);border:1px solid #00ffcc;border-radius:20px;padding:8px 20px;color:#00ffcc;font-family:monospace;font-weight:700;font-size:14px;z-index:99999;pointer-events:none;letter-spacing:3px;`
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 600)
}

// ── SWIPE TUTORIAL OVERLAY ───────────────────────────────────────────────────
export function SwipeTutorial({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,2,18,0.95)', zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}
      onClick={onDismiss}>
      <div style={{ textAlign: 'center', padding: '0 30px' }}>
        <div style={{ fontSize: 48, marginBottom: 20, filter: 'drop-shadow(0 0 16px #00ffcc)' }}>🌐</div>
        <div style={{ color: '#00ffcc', fontWeight: 900, fontSize: 18, marginBottom: 20, letterSpacing: 3 }}>SWIPE TO NAVIGATE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 280, margin: '0 auto 24px' }}>
          {[
            { arrow: '↑', color: '#8800ff', label: 'Swipe UP', desc: 'Open Holoverse' },
            { arrow: '↓', color: '#00cc44', label: 'Swipe DOWN', desc: 'Go to City' },
            { arrow: '←', color: '#00ffcc', label: 'Swipe LEFT', desc: 'Next Realm' },
            { arrow: '→', color: '#ffd700', label: 'Swipe RIGHT', desc: 'Prev Realm' },
          ].map(s => (
            <div key={s.arrow} style={{ background: `${s.color}10`, border: `1px solid ${s.color}44`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 28, color: s.color, marginBottom: 6 }}>{s.arrow}</div>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 11 }}>{s.label}</div>
              <div style={{ color: '#555', fontSize: 10, marginTop: 3 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ color: '#333', fontSize: 11 }}>Tap anywhere to dismiss</div>
      </div>
    </div>
  )
}
