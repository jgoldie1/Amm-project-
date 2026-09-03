(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const marineRegistry=[
    ['whale','🐋'],['dolphin','🐬'],['shark','🦈'],['ray','🐟'],['seal','🦭'],['sea-lion','🦭'],
    ['sea-otter','🦦'],['sea-turtle','🐢'],['octopus','🐙'],['squid','🦑'],['jellyfish','🪼'],
    ['crab','🦀'],['lobster','🦞'],['shrimp','🦐'],['seahorse','🐠'],['starfish','⭐'],
    ['reef-fish','🐠'],['school-fish','🐟'],['eel','🐍'],['clam','🐚'],['oyster','🐚']
  ]
  let mounted=false
  const css=`
  #sv-marine{position:absolute;left:3%;right:3%;top:20%;height:14%;z-index:5;pointer-events:none;overflow:hidden;border-radius:20px;background:linear-gradient(180deg,#51c6ff12,#0a6c9d35 55%,#03243a55);box-shadow:inset 0 0 18px #62d6ff22}
  #sv-marine .m{position:absolute;filter:drop-shadow(0 2px 3px #0008);will-change:transform}
  #sv-marine .whale{font-size:19px;top:45%;animation:svMarineLong 18s linear infinite -7s}
  #sv-marine .dolphin{font-size:16px;top:18%;animation:svMarineLeap 11s linear infinite -3s}
  #sv-marine .shark{font-size:15px;top:61%;animation:svMarineLong 15s linear infinite -10s}
  #sv-marine .ray{font-size:13px;top:56%;animation:svMarineRay 13s ease-in-out infinite alternate}
  #sv-marine .seal{font-size:15px;right:8%;top:8%;animation:svMarineBob 4s ease-in-out infinite alternate}
  #sv-marine .turtle{font-size:14px;top:35%;animation:svMarineSlow 22s linear infinite -9s}
  #sv-marine .octopus{font-size:14px;left:73%;bottom:4%;animation:svMarineBob 5.5s ease-in-out infinite alternate}
  #sv-marine .squid{font-size:13px;left:37%;top:62%;animation:svMarineSquid 7s ease-in-out infinite alternate}
  #sv-marine .jelly{font-size:13px;left:52%;top:18%;animation:svMarineBob 6s ease-in-out infinite alternate}
  #sv-marine .crab{font-size:12px;left:22%;bottom:0;animation:svMarineCrab 6s steps(8,end) infinite alternate}
  #sv-marine .lobster{font-size:12px;left:61%;bottom:1%;animation:svMarineCrab 7.4s steps(8,end) infinite alternate-reverse}
  #sv-marine .school{font-size:10px;top:44%;animation:svMarineSchool 8s linear infinite}.school.s2{top:62%;animation-delay:-2.6s}.school.s3{top:30%;animation-delay:-5.2s}
  #sv-marine .tag{position:absolute;right:5px;bottom:4px;padding:3px 5px;border-radius:5px;background:#021a29c9;color:#c8f7ff;border:1px solid #64dbff55;font:800 6px/1.1 system-ui}
  @keyframes svMarineLong{0%{left:-12%;transform:scaleX(1)}49%{left:105%;transform:scaleX(1)}50%{left:105%;transform:scaleX(-1)}100%{left:-12%;transform:scaleX(-1)}}
  @keyframes svMarineLeap{0%{left:-10%;transform:translateY(8px) rotate(-8deg)}45%{left:45%;transform:translateY(-14px) rotate(8deg)}100%{left:110%;transform:translateY(8px) rotate(-8deg)}}
  @keyframes svMarineRay{from{transform:translate(-18px,4px)}to{transform:translate(38px,-6px)}}
  @keyframes svMarineBob{from{transform:translateY(-3px)}to{transform:translateY(7px)}}
  @keyframes svMarineSlow{0%{left:-8%}100%{left:108%}}
  @keyframes svMarineSquid{from{transform:translate(-8px,6px)}to{transform:translate(14px,-9px)}}
  @keyframes svMarineCrab{from{transform:translateX(-7px)}to{transform:translateX(25px)}}
  @keyframes svMarineSchool{0%{left:-14%}100%{left:110%}}
  @media(prefers-reduced-motion:reduce){#sv-marine *{animation:none!important}}
  `
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]');if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='sv-marine-style';style.textContent=css;document.head.appendChild(style)
    const layer=document.createElement('div');layer.id='sv-marine';layer.setAttribute('aria-hidden','true')
    layer.innerHTML=`<span class="m whale">🐋</span><span class="m dolphin">🐬</span><span class="m shark">🦈</span><span class="m ray">🐟</span><span class="m seal">🦭</span><span class="m turtle">🐢</span><span class="m octopus">🐙</span><span class="m squid">🦑</span><span class="m jelly">🪼</span><span class="m crab">🦀</span><span class="m lobster">🦞</span><span class="m school s1">🐟🐟🐟</span><span class="m school s2">🐠🐠</span><span class="m school s3">🐟🐟</span><div class="tag">SIMULATED OCEAN HABITAT</div>`
    main.appendChild(layer)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-marine-ready',{detail:{source:'simulated-game-habitat',registry:marineRegistry.map(([name])=>name),sampleRendered:['whale','dolphin','shark','ray','seal','sea-turtle','octopus','squid','jellyfish','crab','lobster','school-fish'],protected:['whale','dolphin','sea-turtle','seal','sea-lion','sea-otter'],reducedMotion:reduced()}}))
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
