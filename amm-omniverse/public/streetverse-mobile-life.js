(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const reduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  let mounted=false
  const css=`
  #tryamm-mobile-life{position:absolute;inset:0;pointer-events:none;z-index:7;overflow:hidden}
  #tryamm-mobile-life .sv-car{position:absolute;width:18px;height:34px;border-radius:6px;box-shadow:0 7px 13px #0008;will-change:transform}
  #tryamm-mobile-life .sv-car:before{content:'';position:absolute;left:3px;right:3px;top:5px;height:8px;border-radius:2px;background:#bde8ff}
  #tryamm-mobile-life .sv-car:after{content:'';position:absolute;left:4px;right:4px;bottom:3px;height:3px;border-radius:2px;background:#ff4050}
  #tryamm-mobile-life .lane-a{left:41%;top:18%;background:#e64b45;animation:svDriveA 8s linear infinite}
  #tryamm-mobile-life .lane-b{left:55%;top:63%;background:#e6c845;animation:svDriveB 10s linear infinite}
  #tryamm-mobile-life .lane-c{left:35%;top:70%;background:#3b7dde;animation:svDriveA 11.5s linear infinite -4s}
  #tryamm-mobile-life .sv-person{position:absolute;width:14px;height:31px;will-change:transform;animation:svWalk 3.4s ease-in-out infinite alternate}
  #tryamm-mobile-life .sv-person .head{width:10px;height:10px;border-radius:50%;margin:auto;background:#8d5a3a}
  #tryamm-mobile-life .sv-person .body{width:13px;height:15px;border-radius:5px 5px 2px 2px;margin:1px auto;background:#7fe8c7}
  #tryamm-mobile-life .sv-person .legs{width:9px;height:7px;margin:auto;border-left:3px solid #16191e;border-right:3px solid #16191e}
  #tryamm-mobile-life .p1{left:12%;top:43%;animation-delay:-.8s}#tryamm-mobile-life .p2{left:23%;top:58%;animation-delay:-1.7s}#tryamm-mobile-life .p3{left:78%;top:49%;animation-delay:-2.2s}#tryamm-mobile-life .p4{left:86%;top:63%;animation-delay:-.2s}
  @keyframes svDriveA{0%{transform:translateY(-80px) scale(.62)}100%{transform:translateY(520px) scale(1.08)}}
  @keyframes svDriveB{0%{transform:translateY(360px) rotate(180deg) scale(1.04)}100%{transform:translateY(-360px) rotate(180deg) scale(.64)}}
  @keyframes svWalk{from{transform:translateX(-5px) translateY(0)}to{transform:translateX(12px) translateY(-2px)}}
  @media (prefers-reduced-motion:reduce){#tryamm-mobile-life *{animation:none!important}}
  `
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]')
    if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='tryamm-mobile-life-style';style.textContent=css;document.head.appendChild(style)
    const layer=document.createElement('div');layer.id='tryamm-mobile-life';layer.setAttribute('aria-hidden','true')
    layer.innerHTML='<div class="sv-car lane-a"></div><div class="sv-car lane-b"></div><div class="sv-car lane-c"></div>'+[1,2,3,4].map(i=>`<div class="sv-person p${i}"><div class="head"></div><div class="body"></div><div class="legs"></div></div>`).join('')
    main.appendChild(layer)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-life-ready',{detail:{traffic:3,pedestrians:4,reducedMotion:reduceMotion()}}))
  }
  const observer=new MutationObserver(()=>mount());observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
