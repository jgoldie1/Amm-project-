(()=>{
  const isStreetVerse=()=>location.pathname.startsWith('/streetverse')||location.hash.replace(/^#/,'').startsWith('/streetverse')
  if(!isStreetVerse())return
  let safeActive=false
  const findRecorderUi=()=>[...document.body.children].filter(el=>{
    const z=Number.parseInt(getComputedStyle(el).zIndex||'0',10)
    return z>=2147482999
  })
  const sync=()=>{
    const city=document.querySelector('[data-streetverse-html-city="true"]')
    safeActive=!!city
    if(!safeActive)return
    const ui=findRecorderUi()
    const badge=ui.find(el=>el.getAttribute('role')==='status'&&/STREETVERSE/i.test(el.textContent||''))
    if(badge)badge.textContent='STREETVERSE LIVE • HTML CITY ACTIVE • MOBILE REEL READY'
    ui.forEach(el=>{
      if(el.tagName==='BUTTON'&&/REEL|STOP/i.test(el.textContent||''))el.style.display='none'
      if(el.getAttribute('role')==='alert')el.style.display='none'
    })
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-html-city-ready',{detail:{htmlCity:true,webglRequired:false,mobileSafeMode:true}}))
  }
  const observer=new MutationObserver(sync)
  observer.observe(document.documentElement,{childList:true,subtree:true})
  window.addEventListener('tryamm:open-reel-creator',()=>{
    if(!document.querySelector('[data-streetverse-html-city="true"]'))return
    window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse-html-city',title:'StreetVerse Chicago Reel',caption:'Captured in StreetVerse Chicago • #TRYAMM #StreetVerse',mobileSafeMode:true,screenRecordingRecommended:true}}))
    window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Reel Studio opened • on iPhone use Screen Recording, then import/share your clip.'}}))
  })
  window.addEventListener('tryamm:streetverse-reel-fallback',()=>{if(safeActive)sync()})
  sync()
})()
