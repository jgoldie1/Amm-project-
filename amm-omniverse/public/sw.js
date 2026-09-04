// TRYAMM Service Worker
// Network-first app shell so production UI changes are visible immediately.
// 2026-09-03 platform v25 cache rescue release.

const CACHE_NAME = 'tryamm-shell-platform-v25-20260903'
const STATIC_ASSETS = ['/manifest.json?v=20260903-platform-v25','/tryamm-lion-crown-america.svg?v=20260903-platform-v25']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data?.type === 'CLEAR_TRYAMM_CACHE') {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))))
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET') return

  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('livekit') ||
    url.hostname.includes('stripe') ||
    url.hostname.includes('anthropic') ||
    url.hostname.includes('openai') ||
    url.hostname.includes('googleapis')
  ) return

  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/accessibility' || url.pathname === '/accessibility/') {
    event.respondWith(fetch(request, { cache: 'no-store' }))
    return
  }

  if (url.pathname.startsWith('/assets/') && url.pathname.match(/\.(js|css)$/i)) {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match(request)))
    return
  }

  if (url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/i)) {
    event.respondWith(fetch(request, { cache: 'no-store' }).then(response => {
      if (response.ok) {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
      }
      return response
    }).catch(() => caches.match(request)))
    return
  }

  event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match(request)))
})

self.addEventListener('push', (event) => {
  let data = { title: 'TRYAMM', body: 'You have a new notification', icon: '/tryamm-lion-crown-america.svg?v=20260903-platform-v25', badge: '/icons/badge-72.png' }
  if (event.data) {
    try { data = { ...data, ...event.data.json() } } catch { data.body = event.data.text() }
  }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: data.icon, badge: data.badge, vibrate: [200, 100, 200], data }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.matchAll({ type: 'window' }).then(clients => {
    if (clients.length > 0) { clients[0].focus(); return }
    return self.clients.openWindow('/')
  }))
})
