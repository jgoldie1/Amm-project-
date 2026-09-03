(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  if(!('geolocation' in navigator))return
  let mounted=false,watchId=null,lastPosition=null
  const anchors={
    chicago:[41.8781,-87.6298],greatLakes:[43.0,-86.5],caribbean:[18.2,-66.5],mediterranean:[36.5,18.0],
    westAfrica:[5.6,-0.2],eastAfrica:[-1.3,36.8],amazon:[-3.1,-60.0],pacific:[21.3,-157.8],arctic:[70.0,-40.0]
  }
  const rad=n=>n*Math.PI/180
  function km(a,b){const R=6371,dLat=rad(b[0]-a[0]),dLon=rad(b[1]-a[1]),x=Math.sin(dLat/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
  function nearestRegion(lat,lon){let best='chicago',dist=Infinity;Object.entries(anchors).forEach(([id,p])=>{const d=km([lat,lon],p);if(d<dist){best=id;dist=d}});return {id:best,distanceKm:Math.round(dist)}}
  function accuracyBand(m){if(m<=50)return 'high';if(m<=500)return 'medium';return 'coarse'}
  const css=`
  #sv-gps-controls{position:absolute;left:12px;top:208px;z-index:24;display:flex;gap:6px;pointer-events:auto}
  #sv-gps-controls button{min-height:44px;padding:0 9px;border-radius:12px;border:1px solid #9de7ff;background:#06192ae8;color:#fff;font:900 9px/1 system-ui;box-shadow:0 6px 18px #0008}
  #sv-gps-controls button[aria-pressed="true"]{background:#0b493e;border-color:#70ffd1}
  #sv-gps-controls button:focus{outline:3px solid #fff;outline-offset:2px}
  #sv-gps-note{position:absolute;left:12px;top:257px;z-index:24;max-width:220px;padding:5px 7px;border-radius:8px;background:#03121fda;color:#d9f6ff;border:1px solid #5ea9c566;font:700 8px/1.25 system-ui;pointer-events:none}
  `
  function emit(kind,pos,region){
    window.dispatchEvent(new CustomEvent(kind,{detail:{source:'device-geolocation',regionId:region?.id||null,distanceKm:region?.distanceKm??null,accuracy:pos?accuracyBand(pos.coords.accuracy):null,coarsePosition:pos?{lat:Number(pos.coords.latitude.toFixed(2)),lon:Number(pos.coords.longitude.toFixed(2))}:null,persistedExactCoordinates:false}}))
  }
  function applyPosition(pos,note){
    lastPosition=pos
    const region=nearestRegion(pos.coords.latitude,pos.coords.longitude)
    const ok=window.StreetVerseGlobalWorld?.travel?.(region.id)
    note.textContent=ok?`GPS region: ${window.StreetVerseGlobalWorld.current().label} • accuracy ${accuracyBand(pos.coords.accuracy)} • exact coordinates not stored.`:`GPS found a position, but WORLD is not ready yet.`
    emit('tryamm:streetverse-gps-region',pos,region)
  }
  function onError(err,note){
    const message=err?.code===1?'Location permission denied. Manual WORLD travel still works.':err?.code===2?'Location unavailable. Manual WORLD travel still works.':'GPS timed out. Try again or use WORLD manually.'
    note.textContent=message;emit('tryamm:streetverse-gps-error',null,null)
  }
  function locate(note){
    note.textContent='Requesting one-time GPS location…'
    navigator.geolocation.getCurrentPosition(pos=>applyPosition(pos,note),err=>onError(err,note),{enableHighAccuracy:false,timeout:9000,maximumAge:60000})
  }
  function stopFollow(btn,note){
    if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null}
    btn.setAttribute('aria-pressed','false');btn.textContent='📡 GPS FOLLOW OFF';note.textContent='GPS follow is off. Exact coordinates are not stored.'
  }
  function startFollow(btn,note){
    if(watchId!==null)return stopFollow(btn,note)
    btn.setAttribute('aria-pressed','true');btn.textContent='📡 GPS FOLLOW ON';note.textContent='GPS follow is on by your choice. Turn it off anytime.'
    watchId=navigator.geolocation.watchPosition(pos=>applyPosition(pos,note),err=>{onError(err,note);stopFollow(btn,note)},{enableHighAccuracy:false,timeout:12000,maximumAge:15000})
  }
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]');if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='sv-gps-style';style.textContent=css;document.head.appendChild(style)
    const controls=document.createElement('div');controls.id='sv-gps-controls';controls.innerHTML='<button type="button" class="locate" aria-label="Use GPS once to select nearby StreetVerse world">📍 GPS LOCATE</button><button type="button" class="follow" aria-pressed="false" aria-label="Toggle live GPS following">📡 GPS FOLLOW OFF</button>'
    const note=document.createElement('div');note.id='sv-gps-note';note.setAttribute('aria-live','polite');note.textContent='GPS is optional and off. Manual WORLD travel works without location access.'
    controls.querySelector('.locate').addEventListener('click',()=>locate(note))
    const follow=controls.querySelector('.follow');follow.addEventListener('click',()=>startFollow(follow,note))
    main.append(controls,note)
    window.StreetVerseGPS={
      locate:()=>new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(p=>{lastPosition=p;resolve(p)},reject,{enableHighAccuracy:false,timeout:9000,maximumAge:60000})),
      currentPosition:()=>lastPosition?{latitude:lastPosition.coords.latitude,longitude:lastPosition.coords.longitude,accuracy:lastPosition.coords.accuracy}:null,
      nearestRegion:(lat,lon)=>nearestRegion(lat,lon),
      stop:()=>stopFollow(follow,note),
      isFollowing:()=>watchId!==null
    }
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-gps-ready',{detail:{optional:true,oneTimeLocate:true,liveFollowOptIn:true,exactCoordinatesPersisted:false}}))
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>{observer.disconnect();if(watchId!==null)navigator.geolocation.clearWatch(watchId)},{once:true})
})()
