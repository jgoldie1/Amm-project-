'use strict';
const CACHE='tryamm-shell-v18-release-truth';
const APP_SHELL=['/','/styles.css','/app.js','/app-shell.html','/app-shell.css','/app-shell.js','/judah-splash.css','/judah-splash.js','/install-app.css','/install-app.js','/hologpt-widget.css','/hologpt-widget.js','/spaceverse.html','/spaceverse.css','/spaceverse.js','/moon-mission.html','/moon-mission.css','/moon-mission.js','/el-saturn-space.html','/el-saturn-space.css','/el-saturn-space.js','/spaceverse-engine.js','/vendor/model-viewer.min.js','/manifest.webmanifest','/tryamm-hub.html','/tryamm-hub.css','/tryamm-hub.js','/publisher-studio.html','/publisher-studio.js','/whitepapers/TryAMM_Public_White_Paper_v1.pdf','/privacy.html','/terms.html','/community-rules.html','/icons/judah-192.png','/icons/judah-512.png','/media/tryamm-judah-splash-poster-v2.jpg','/media/tryamm-spaceverse-launch-poster-v1.jpg','/media/venus-map-web.webp'];
function injectHoloGPT(html){
  if(!html||html.includes('data-hologpt-global'))return html;
  const css='<link rel="stylesheet" href="/hologpt-widget.css?v=2" data-hologpt-global="true">';
  const js='<script src="/hologpt-widget.js?v=2" defer data-hologpt-global="true"></script>';
  return html.replace('</head>',`${css}</head>`).replace('</body>',`${js}</body>`);
}
async function networkNavigation(request){
  const response=await fetch(request,{cache:'no-store'});
  const type=response.headers.get('content-type')||'';
  if(!response.ok||!type.includes('text/html'))return response;
  const text=injectHoloGPT(await response.text());
  const headers=new Headers(response.headers);headers.delete('content-length');headers.set('cache-control','no-cache, no-store, must-revalidate');headers.set('pragma','no-cache');headers.set('expires','0');
  const enriched=new Response(text,{status:response.status,statusText:response.statusText,headers});
  const copy=enriched.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));
  return enriched;
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.startsWith('/api/')){event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>new Response(JSON.stringify({error:'Offline'}),{status:503,headers:{'Content-Type':'application/json'}})));return;}
  if(event.request.mode==='navigate'){
    event.respondWith(networkNavigation(event.request).catch(()=>caches.match(event.request).then(async cached=>{
      if(cached){const type=cached.headers.get('content-type')||'';if(type.includes('text/html')){const text=injectHoloGPT(await cached.text());return new Response(text,{status:cached.status,statusText:cached.statusText,headers:cached.headers});}return cached;}
      return caches.match('/');
    })));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();if(response.ok&&response.status===200)caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;})));
});
