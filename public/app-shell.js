'use strict';
const feed=document.querySelector('#liveFeed'),network=document.querySelector('#network');
const splash=document.querySelector('#appSplash'),splashVideo=document.querySelector('#splashVideo'),splashStart=document.querySelector('#splashStart'),splashSkip=document.querySelector('#splashSkip'),splashReplay=document.querySelector('#splashReplay');
const SPLASH_KEY='tryamm:splash-seen',SPLASH_FAILSAFE_MS=10000;
let splashTimer;
function closeSplash(){clearTimeout(splashTimer);splash.hidden=true;splashStart.hidden=true;splashReplay.hidden=false;try{sessionStorage.setItem(SPLASH_KEY,'1');}catch(_){}}
function startFailsafe(){clearTimeout(splashTimer);splashTimer=setTimeout(closeSplash,SPLASH_FAILSAFE_MS);}
function requestSplashPlayback(){
  splashStart.hidden=true;
  return splashVideo.play().then(()=>{splashStart.hidden=true;}).catch(()=>{splashStart.hidden=false;});
}
function playSplash(){splash.hidden=false;splashReplay.hidden=true;splashVideo.currentTime=0;startFailsafe();requestSplashPlayback();}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let splashSeen=false;try{splashSeen=sessionStorage.getItem(SPLASH_KEY)==='1';}catch(_){}
if(splashSeen||reduceMotion){splash.hidden=true;splashReplay.hidden=false;}else{startFailsafe();requestSplashPlayback();}
splashVideo.addEventListener('ended',closeSplash);splashVideo.addEventListener('error',closeSplash);
splashStart.addEventListener('click',()=>{splashVideo.currentTime=0;startFailsafe();requestSplashPlayback();});
splashSkip.addEventListener('click',closeSplash);splashReplay.addEventListener('click',playSplash);
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadRooms(){try{const res=await fetch('/api/rooms');if(!res.ok)throw new Error('Unable to load rooms');const {rooms=[]}=await res.json();feed.innerHTML=rooms.length?rooms.map(room=>`<article class="room"><header><b>${escapeHtml(room.title)}</b><span class="live">● LIVE</span></header><p>${escapeHtml(room.category)} · ${Number(room.viewerCount||0)} watching</p><a href="/#live">Open room</a></article>`).join(''):'<p>No live rooms right now. Start the next one from the creator dashboard.</p>';}catch(error){feed.innerHTML=`<p>${escapeHtml(error.message)}. The app shell is still available offline.</p>`;}}
function setNetwork(){network.textContent=navigator.onLine?'Online':'Offline';}
window.addEventListener('online',()=>{setNetwork();loadRooms();});window.addEventListener('offline',setNetwork);setNetwork();loadRooms();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}));
