'use strict';
const CACHE='tryamm-shell-v5';
const APP_SHELL=['/app-shell.html','/app-shell.css','/app-shell.js','/manifest.webmanifest','/community-rules.html','/icons/judah-192.png','/icons/judah-512.png','/media/tryamm-judah-splash-poster-v2.jpg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.startsWith('/api/')){event.respondWith(fetch(event.request).catch(()=>new Response(JSON.stringify({error:'Offline'}),{status:503,headers:{'Content-Type':'application/json'}})));return;}
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('/app-shell.html'))));return;}
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();if(response.ok&&response.status===200)caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;})));
});
