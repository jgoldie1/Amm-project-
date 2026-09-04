// TRYAMM Service Worker
// Network-first app shell with stale-asset self recovery.
// 2026-09-03 platform v26 recovery release.

const CACHE_NAME = 'tryamm-shell-platform-v26-20260903'
const STATIC_ASSETS = ['/manifest.json?v=20260903-platform-v26','/tryamm-lion-crown-america.svg?v=20260903-platform-v26']

async function notifyStaleAsset(url) {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  windows.forEach(client => client.postMessage({ type: 'TRYAMM_STALE_ASSET', url, release: '20260903-platform-v26' }))
}

function recoveryModule(url) {
  const source = `(()=>{const k='tryamm-stale-asset-v26';try{if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,'1');const u=new URL(location.href);u.searchParams.set('_tryamm_recover','v26');location.replace(u.toString())}}catch{location.reload()}})();export {};\n//# sourceURL=tryamm-stale-asset-recovery.js`
  return new Response(source, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-TRYAMM-Recovery': url
    }
  })
}

function recoveryCss(url) {
  return new Response('/* TRYAMM stale stylesheet recovery */', {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-TRYAMM-Recovery': url
    }
  })
}

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
    event.respondWith((async () => {
      const isJs = /\.js$/i.test(url.pathname)
      try {
        const response = await fetch(request, { cache: 'no-store' })
        const type = String(response.headers.get('content-type') || '').toLowerCase()
        const validType = isJs ? type.includes('javascript') : type.includes('text/css')
        if (response.ok && validType) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {})
          return response
        }
        const cached = await caches.match(request)
        if (cached) return cached
        await notifyStaleAsset(url.href)
        return isJs ? recoveryModule(url.href) : recoveryCss(url.href)
      } catch {
        const cached = await caches.match(request)
        if (cached) return cached
        await notifyStaleAsset(url.href)
        return isJs ? recoveryModule(url.href) : recoveryCss(url.href)
      }
    })())
    return
  }

  if (url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/i)) {
    event.respondWith(fetch(request, { cache: 'no-store' }).then(response => {
      if (response.ok) {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {})
      }
      return response
    }).catch(() => caches.match(request)))
    return
  }

  event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match(request)))
})

self.addEventListener('push', (event) => {
  let data = { title: 'TRYAMM', body: 'You have a new notification', icon: '/tryamm-lion-crown-america.svg?v=20260903-platform-v26', badge: '/icons/badge-72.png' }
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
