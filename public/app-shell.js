'use strict';
const feed=document.querySelector('#liveFeed'),network=document.querySelector('#network');
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadRooms(){try{const res=await fetch('/api/rooms');if(!res.ok)throw new Error('Unable to load rooms');const {rooms=[]}=await res.json();feed.innerHTML=rooms.length?rooms.map(room=>`<article class="room"><header><b>${escapeHtml(room.title)}</b><span class="live">● LIVE</span></header><p>${escapeHtml(room.category)} · ${Number(room.viewerCount||0)} watching</p><a href="/#live">Open room</a></article>`).join(''):'<p>No live rooms right now. Start the next one from the creator dashboard.</p>';}catch(error){feed.innerHTML=`<p>${escapeHtml(error.message)}. The app shell is still available offline.</p>`;}}
function setNetwork(){network.textContent=navigator.onLine?'Online':'Offline';}
window.addEventListener('online',()=>{setNetwork();loadRooms();});window.addEventListener('offline',setNetwork);setNetwork();loadRooms();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}));
