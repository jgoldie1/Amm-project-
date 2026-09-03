(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  let mounted=false
  const css=`
  #sv-apex-wildlife{position:absolute;right:4%;bottom:5%;width:34%;height:18%;z-index:5;pointer-events:none;border-radius:16px;background:linear-gradient(180deg,#43552a44,#19220e88);border:1px solid #b9e56c55;overflow:hidden;box-shadow:inset 0 0 18px #0008}
  #sv-apex-wildlife .apex{position:absolute;filter:drop-shadow(0 3px 4px #000a);will-change:transform}
  #sv-apex-wildlife .lion{left:10%;bottom:14%;font-size:22px;animation:svLion 8s ease-in-out infinite alternate}
  #sv-apex-wildlife .lion.l2{left:28%;font-size:18px;animation-delay:-3s}
  #sv-apex-wildlife .wolf{right:18%;bottom:17%;font-size:19px;animation:svWolf 7s ease-in-out infinite alternate}
  #sv-apex-wildlife .wolf.w2{right:5%;bottom:27%;font-size:16px;animation-delay:-2.7s}
  #sv-apex-wildlife .croc{left:42%;bottom:2%;font-size:22px;animation:svCroc 11s ease-in-out infinite alternate}
  #sv-apex-wildlife .water{position:absolute;left:35%;right:2%;bottom:0;height:31%;background:linear-gradient(180deg,#5bd2e922,#0c627344);border-radius:60% 20% 0 0}
  #sv-apex-wildlife .tag{position:absolute;left:5px;top:4px;padding:3px 5px;border-radius:5px;background:#10170ad9;border:1px solid #b6e86a66;color:#e7ffc3;font:800 6px/1.1 system-ui}
  @keyframes svLion{from{transform:translateX(-5px)}to{transform:translateX(18px)}}
  @keyframes svWolf{from{transform:translate(-12px,2px)}to{transform:translate(10px,-3px)}}
  @keyframes svCroc{from{transform:translateX(-8px)}to{transform:translateX(16px)}}
  @media(prefers-reduced-motion:reduce){#sv-apex-wildlife *{animation:none!important}}
  `
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]');if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='sv-apex-wildlife-style';style.textContent=css;document.head.appendChild(style)
    const layer=document.createElement('div');layer.id='sv-apex-wildlife';layer.setAttribute('aria-hidden','true')
    layer.innerHTML=`<div class="water"></div><span class="apex lion">🦁</span><span class="apex lion l2">🦁</span><span class="apex wolf">🐺</span><span class="apex wolf w2">🐺</span><span class="apex croc">🐊</span><div class="tag">SIMULATED WILDLIFE RESERVE • pride • pack • wetland</div>`
    main.appendChild(layer)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-apex-wildlife-ready',{detail:{source:'simulated-game-habitat',species:['lion','wolf','crocodile'],groups:['pride','pack','wetland'],huntingAllowed:false,predatorPreyGraphic:false,reducedMotion:reduced()}}))
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
