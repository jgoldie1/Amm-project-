// AMM Omniverse Service Worker
// Handles: offline caching, background sync, push notifications, install prompt

const CACHE_NAME = 'amm-omniverse-v8'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// ── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// ── Fetch strategy: Network first, fallback to cache ─────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Don't cache API calls, auth, or external services
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('livekit') ||
    url.hostname.includes('stripe') ||
    url.hostname.includes('anthropic')
  ) {
    return // Let these go straight to network
  }

  // Cache-first for static assets
  if (
    url.pathname.match(/\.(js|css|woff2?|png|jpg|svg|ico)$/) ||
    url.pathname === '/'
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
          }
          return response
        }).catch(() => cached)
        return cached || networkFetch
      })
    )
    return
  }

  // Network first for everything else
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'AMM Omniverse', body: 'You have a new notification', icon: '/icons/icon-192.png', badge: '/icons/badge-72.png' }
  if (event.data) {
    try { data = { ...data, ...event.data.json() } } catch { data.body = event.data.text() }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        { action: 'open', title: 'Open AMM', icon: '/icons/action-open.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) { clients[0].focus(); return }
      return self.clients.openWindow('/')
    })
  )
})

// ── Background sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-state') {
    event.waitUntil(syncGameState())
  }
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders())
  }
})

async function syncGameState() {
  // When back online, sync local game state to Supabase
  const state = await getLocalState('amm_game_state')
  if (!state) return
  try {
    await fetch('/api/sync/game-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    })
  } catch (e) {
    // Will retry on next sync
  }
}

async function syncOrders() {
  const pendingOrders = await getLocalState('amm_pending_orders')
  if (!pendingOrders) return
  try {
    await fetch('/api/sync/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pendingOrders)
    })
  } catch (e) { /* retry */ }
}

async function getLocalState(key) {
  // Read from IndexedDB (simplified)
  return null
}
