(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  let mounted=false
  const css=`
  #sv-savanna{position:absolute;left:34%;bottom:4%;width:34%;height:18%;z-index:5;pointer-events:none;overflow:hidden;border-radius:16px;background:linear-gradient(180deg,#b9913d2e,#5c3d143d 55%,#19200982);border:1px solid #e8c56c55;box-shadow:inset 0 0 18px #0007}
  #sv-savanna .animal{position:absolute;filter:drop-shadow(0 3px 4px #0009);will-change:transform}
  #sv-savanna .elephant{left:7%;bottom:12%;font-size:25px;animation:svElephant 12s ease-in-out infinite alternate}
  #sv-savanna .elephant.e2{left:29%;font-size:18px;bottom:14%;animation-delay:-5s}
  #sv-savanna .giraffe{right:9%;bottom:11%;font-size:28px;animation:svGiraffe 11s ease-in-out infinite alternate}
  #sv-savanna .giraffe.g2{right:31%;font-size:20px;bottom:12%;animation-delay:-4s}
  #sv-savanna .grass{position:absolute;left:0;right:0;bottom:0;height:30%;background:linear-gradient(180deg,transparent,#879d3855)}
  #sv-savanna .tree{position:absolute;left:49%;bottom:8%;font-size:22px;opacity:.9}
  #sv-savanna .tag{position:absolute;left:5px;top:4px;padding:3px 5px;border-radius:5px;background:#251a08d9;border:1px solid #efc96666;color:#fff1bc;font:800 6px/1.1 system-ui}
  @keyframes svElephant{from{transform:translateX(-5px)}to{transform:translateX(23px)}}
  @keyframes svGiraffe{from{transform:translate(-18px,0)}to{transform:translate(5px,-2px)}}
  @media(prefers-reduced-motion:reduce){#sv-savanna *{animation:none!important}}
  `
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]');if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='sv-savanna-style';style.textContent=css;document.head.appendChild(style)
    const layer=document.createElement('div');layer.id='sv-savanna';layer.setAttribute('aria-hidden','true')
    layer.innerHTML=`<div class="grass"></div><span class="animal elephant">🐘</span><span class="animal elephant e2">🐘</span><span class="tree">🌳</span><span class="animal giraffe">🦒</span><span class="animal giraffe g2">🦒</span><div class="tag">SIMULATED SAVANNA RESERVE • elephant herd • giraffe tower</div>`
    main.appendChild(layer)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-savanna-ready',{detail:{source:'simulated-game-habitat',species:['elephant','giraffe'],groups:['herd','tower'],young:['elephant-calf','giraffe-calf'],huntingAllowed:false,reducedMotion:reduced()}}))
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
