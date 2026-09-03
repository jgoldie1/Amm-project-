(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  let mounted=false
  const css=`
  #tryamm-ecology{position:absolute;inset:0;z-index:6;pointer-events:none;overflow:hidden;font-family:system-ui,sans-serif}
  #tryamm-ecology .eco{position:absolute;filter:drop-shadow(0 2px 3px #0008);will-change:transform}
  #tryamm-ecology .dog{left:14%;top:63%;font-size:20px;animation:ecoDog 9s ease-in-out infinite alternate}
  #tryamm-ecology .squirrel{left:8%;top:52%;font-size:15px;animation:ecoSquirrel 5s ease-in-out infinite alternate}
  #tryamm-ecology .rabbit{right:10%;top:56%;font-size:15px;animation:ecoRabbit 6.5s ease-in-out infinite alternate}
  #tryamm-ecology .bird{font-size:13px;animation:ecoBird 8s linear infinite}.bird.b2{animation-delay:-2.2s}.bird.b3{animation-delay:-4.8s}.bird.b4{animation-delay:-6.1s}
  #tryamm-ecology .goose{font-size:15px;animation:ecoFlock 11s linear infinite}.goose.g2{animation-delay:-1.8s}.goose.g3{animation-delay:-3.6s}.goose.g4{animation-delay:-5.4s}
  #tryamm-ecology .bug{font-size:9px;animation:ecoBug 7s ease-in-out infinite}.bug.i2{animation-delay:-2s}.bug.i3{animation-delay:-4s}.bug.i4{animation-delay:-5.3s}
  #tryamm-ecology .spider{right:6%;top:27%;font-size:13px;animation:ecoSpider 5s ease-in-out infinite alternate}
  #tryamm-ecology .river{position:absolute;left:3%;right:3%;top:22%;height:10%;border-radius:50%;background:linear-gradient(180deg,#55b8e91a,#0e6c9e38);overflow:hidden}
  #tryamm-ecology .fish{position:absolute;font-size:12px;animation:ecoFish 8s linear infinite}.fish.f2{top:28%;animation-delay:-1.5s}.fish.f3{top:52%;animation-delay:-3s}.fish.f4{top:66%;animation-delay:-4.7s}.fish.f5{top:38%;animation-delay:-6s}
  #tryamm-ecology .herd{position:absolute;left:2%;bottom:5%;width:30%;height:12%;opacity:.88}
  #tryamm-ecology .deer{position:absolute;font-size:16px;animation:ecoHerd 12s ease-in-out infinite alternate}.deer.h2{left:28px;top:8px;animation-delay:-1.3s}.deer.h3{left:55px;top:2px;animation-delay:-2.6s}.deer.h4{left:78px;top:10px;animation-delay:-3.9s}
  #tryamm-ecology .label{position:absolute;left:8px;bottom:8px;padding:4px 6px;border-radius:6px;background:#03131cbd;border:1px solid #70e6ff55;color:#c8f7ff;font:800 7px/1.1 system-ui}
  @keyframes ecoDog{from{transform:translateX(0)}to{transform:translateX(58px)}}
  @keyframes ecoSquirrel{from{transform:translate(0,0)}to{transform:translate(34px,-8px)}}
  @keyframes ecoRabbit{from{transform:translateX(0)}to{transform:translateX(-42px)}}
  @keyframes ecoBird{0%{transform:translate(-12vw,12vh)}100%{transform:translate(112vw,-4vh)}}
  @keyframes ecoFlock{0%{transform:translate(-15vw,18vh)}100%{transform:translate(115vw,8vh)}}
  @keyframes ecoBug{0%,100%{transform:translate(0,0)}25%{transform:translate(22px,-15px)}50%{transform:translate(40px,8px)}75%{transform:translate(12px,18px)}}
  @keyframes ecoSpider{from{transform:translateY(-6px)}to{transform:translateY(20px)}}
  @keyframes ecoFish{0%{left:-10%;transform:scaleX(1)}49%{left:95%;transform:scaleX(1)}50%{left:95%;transform:scaleX(-1)}100%{left:-10%;transform:scaleX(-1)}}
  @keyframes ecoHerd{from{transform:translateX(-8px)}to{transform:translateX(30px)}}
  @media(prefers-reduced-motion:reduce){#tryamm-ecology *{animation:none!important}}
  `
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]');if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='tryamm-ecology-style';style.textContent=css;document.head.appendChild(style)
    const layer=document.createElement('div');layer.id='tryamm-ecology';layer.setAttribute('aria-hidden','true')
    layer.innerHTML=`
      <div class="river">${[1,2,3,4,5].map(i=>`<span class="fish f${i} eco">🐟</span>`).join('')}</div>
      <span class="eco dog">🐕</span><span class="eco squirrel">🐿️</span><span class="eco rabbit">🐇</span>
      ${[1,2,3,4].map((i)=>`<span class="eco bird b${i}" style="top:${10+i*3}%;left:${-8-i*3}%">🐦</span>`).join('')}
      ${[1,2,3,4].map((i)=>`<span class="eco goose g${i}" style="top:${16+i*2}%;left:${-12-i*4}%">🪿</span>`).join('')}
      ${[1,2,3,4].map((i)=>`<span class="eco bug i${i}" style="left:${24+i*13}%;top:${30+i*7}%">${i%2?'🦋':'🐝'}</span>`).join('')}
      <span class="eco spider">🕷️</span>
      <div class="herd">${[1,2,3,4].map(i=>`<span class="deer h${i}">🦌</span>`).join('')}</div>
      <div class="label">SIMULATED GAME ECOLOGY • flock • herd • school</div>`
    main.appendChild(layer)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-ecology-ready',{detail:{source:'simulated-game-ecology',animals:['dog','squirrel','rabbit','bird','goose','deer'],insects:['butterfly','bee','spider'],aquatic:['fish'],groupBehaviors:['flock','herd','school'],reducedMotion:reduced()}}))
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
