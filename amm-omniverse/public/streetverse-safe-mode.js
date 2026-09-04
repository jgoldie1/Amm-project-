(()=>{
  const isStreetVerse=()=>location.pathname.startsWith('/streetverse')||location.hash.replace(/^#/,'').startsWith('/streetverse')
  if(!isStreetVerse())return
  let safeActive=false
  const STYLE_ID='tryamm-streetverse-safe-life-v2'
  const findRecorderUi=()=>[...document.body.children].filter(el=>{
    const z=Number.parseInt(getComputedStyle(el).zIndex||'0',10)
    return z>=2147482999
  })
  const ensureLifeStyles=()=>{
    if(document.getElementById(STYLE_ID))return
    const style=document.createElement('style')
    style.id=STYLE_ID
    style.textContent=`
      [data-streetverse-html-city="true"] .tryamm-safe-person{transform-origin:50% 100%;filter:drop-shadow(0 4px 3px #0009);animation:tryammSafeWalk 1.15s ease-in-out infinite alternate}
      [data-streetverse-html-city="true"] .tryamm-safe-person:nth-of-type(even){animation-duration:1.35s;animation-delay:-.45s}
      [data-streetverse-html-city="true"] .tryamm-safe-car-a{animation:tryammSafeCarDown 5.8s linear infinite}
      [data-streetverse-html-city="true"] .tryamm-safe-car-b{animation:tryammSafeCarUp 6.7s linear infinite}
      [data-streetverse-html-city="true"] .tryamm-safe-car-c{animation:tryammSafeCarUp2 7.4s linear infinite}
      @keyframes tryammSafeWalk{from{translate:-4px 0;scale:1.18}to{translate:5px -3px;scale:1.3}}
      @keyframes tryammSafeCarDown{0%{top:12%}100%{top:68%}}
      @keyframes tryammSafeCarUp{0%{top:67%}100%{top:8%}}
      @keyframes tryammSafeCarUp2{0%{top:72%}100%{top:18%}}
      @media (prefers-reduced-motion:reduce){[data-streetverse-html-city="true"] .tryamm-safe-person,[data-streetverse-html-city="true"] .tryamm-safe-car-a,[data-streetverse-html-city="true"] .tryamm-safe-car-b,[data-streetverse-html-city="true"] .tryamm-safe-car-c{animation:none!important}}
    `
    document.head.appendChild(style)
  }
  const ensureReelLauncher=()=>{
    const world=document.querySelector('[role="dialog"][aria-label="StreetVerse Living World"]')
    if(!world)return
    const header=world.querySelector('header')
    if(!header||header.querySelector('[data-tryamm-streetverse-reel-launcher="true"]'))return
    const actions=header.lastElementChild
    if(!actions)return
    const button=document.createElement('button')
    button.type='button'
    button.dataset.tryammStreetverseReelLauncher='true'
    button.setAttribute('aria-label','Open StreetVerse Reel Creator')
    button.textContent='● REEL'
    Object.assign(button.style,{minHeight:'42px',borderRadius:'12px',border:'1px solid #ff7ce8',background:'#251027',color:'#fff',fontWeight:'900',padding:'0 13px',cursor:'pointer',boxShadow:'0 6px 18px #0008'})
    button.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'streetverse-living-world'}})))
    actions.insertBefore(button,actions.lastElementChild)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-launcher-ready',{detail:{source:'streetverse-living-world',visible:true}}))
  }
  const markVisibleLife=(city)=>{
    ensureLifeStyles()
    const streets=[...city.querySelectorAll('main > div[aria-hidden="true"]')]
    const street=streets[1]
    if(!street)return
    const all=[...street.querySelectorAll('div')]
    const people=all.filter(el=>el.style.width==='14px'&&el.style.height==='32px')
    people.forEach(el=>el.classList.add('tryamm-safe-person'))
    const cars=all.filter(el=>(el.style.width==='22px'&&el.style.height==='38px')||(el.style.width==='26px'&&el.style.height==='45px')||(el.style.width==='30px'&&el.style.height==='50px'))
    cars.forEach((el,i)=>el.classList.add(i===0?'tryamm-safe-car-a':i===1?'tryamm-safe-car-b':'tryamm-safe-car-c'))
    const headerStatus=[...city.querySelectorAll('header div')].find(el=>el.children.length===0&&/CITY ACTIVE/i.test(el.textContent||''))
    if(headerStatus)headerStatus.textContent='CITY ACTIVE • PEOPLE + TRAFFIC • REEL READY'
    if(!city.dataset.visibleLifeReady){
      city.dataset.visibleLifeReady='true'
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-visible-life-ready',{detail:{htmlCity:true,people:people.length,traffic:cars.length,reelControlsVisible:true}}))
    }
  }
  const sync=()=>{
    ensureReelLauncher()
    const city=document.querySelector('[data-streetverse-html-city="true"]')
    safeActive=!!city
    if(!safeActive)return
    markVisibleLife(city)
    const ui=findRecorderUi()
    const badge=ui.find(el=>el.getAttribute('role')==='status'&&/STREETVERSE/i.test(el.textContent||''))
    if(badge)badge.textContent='STREETVERSE LIVE • HTML CITY ACTIVE • MOBILE REEL READY'
    ui.forEach(el=>{
      if(el.tagName==='BUTTON'&&/^\s*[●•]?\s*REEL\s*$/i.test(el.textContent||''))el.style.display='none'
      if(el.getAttribute('role')==='alert')el.style.display='none'
    })
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-html-city-ready',{detail:{htmlCity:true,webglRequired:false,mobileSafeMode:true}}))
  }
  const observer=new MutationObserver(sync)
  observer.observe(document.documentElement,{childList:true,subtree:true})
  window.addEventListener('tryamm:open-reel-creator',()=>{
    if(!document.querySelector('[data-streetverse-html-city="true"]'))return
    window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse-html-city',title:'StreetVerse Chicago Reel',caption:'Captured in StreetVerse Chicago • #TRYAMM #StreetVerse',mobileSafeMode:true,screenRecordingRecommended:true}}))
    window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Reel Studio opened • recording controls stay visible. On iPhone you can also use Screen Recording, then import/share your clip.'}}))
  })
  window.addEventListener('tryamm:streetverse-reel-fallback',()=>{if(safeActive)sync()})
  sync()
})()
