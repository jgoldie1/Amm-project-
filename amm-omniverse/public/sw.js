// TRYAMM Service Worker
// Network-first app shell so production UI changes and SEO/public pages stay fresh.

const CACHE_NAME = 'tryamm-shell-v11-20260820-judah-v3'
const STATIC_ASSETS = ['/manifest.json?v=20260821-judah-v3','/tryamm-judah-holographic-v3.svg?v=3','/seo-public.css']

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

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase') || url.hostname.includes('livekit') || url.hostname.includes('stripe') || url.hostname.includes('anthropic')) return

  // HTML/public discovery pages are network-first so SEO copy and launch status do not get trapped behind stale caches.
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html') || ['/about/','/streetverse/','/marketplace/','/live/','/archive/','/accessibility/'].includes(url.pathname)) {
    event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{
      if(response.ok){const clone=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,clone))}
      return response
    }).catch(()=>caches.match(request).then(r=>r||caches.match('/index.html'))))
    return
  }

  if (url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/i)) {
    event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response.ok){const clone=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,clone))}
      return response
    })))
    return
  }

  event.respondWith(fetch(request).catch(()=>caches.match(request)))
})

self.addEventListener('push', (event) => {
  let data = { title: 'TRYAMM', body: 'You have a new notification', icon: '/tryamm-judah-holographic-v3.svg?v=3', badge: '/tryamm-judah-holographic-v3.svg?v=3' }
  if (event.data) {
    try { data = { ...data, ...event.data.json() } } catch { data.body = event.data.text() }
  }
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:data.icon,badge:data.badge,vibrate:[200,100,200],data,actions:[{action:'open',title:'Open TRYAMM'},{action:'dismiss',title:'Dismiss'}]}))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  event.waitUntil(self.clients.matchAll({type:'window'}).then(clients=>{
    if(clients.length>0){clients[0].focus();return}
    return self.clients.openWindow('/')
  }))
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-state') event.waitUntil(syncGameState())
  if (event.tag === 'sync-orders') event.waitUntil(syncOrders())
})

async function syncGameState() {
  const state = await getLocalState('amm_game_state')
  if (!state) return
  try { await fetch('/api/sync/game-state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(state)}) } catch (_) {}
}

async function syncOrders() {
  const pendingOrders = await getLocalState('amm_pending_orders')
  if (!pendingOrders) return
  try { await fetch('/api/sync/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pendingOrders)}) } catch (_) {}
}

async function getLocalState(_key) { return null }
