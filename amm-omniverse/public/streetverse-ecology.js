(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const birdRegistry=[
    ['pigeon','🐦'],['crow','🐦‍⬛'],['sparrow','🐦'],['robin','🐦'],['cardinal','🐦'],
    ['parrot','🦜'],['eagle','🦅'],['owl','🦉'],['duck','🦆'],['goose','🪿'],
    ['swan','🦢'],['peacock','🦚'],['flamingo','🦩'],['turkey','🦃'],['chicken','🐓']
  ]
  const petRegistry=[
    ['dog','🐕'],['cat','🐈'],['rabbit','🐇'],['hamster','🐹'],['guinea-pig','🐹'],
    ['parakeet','🦜'],['turtle','🐢'],['aquarium-fish','🐠']
  ]
  let mounted=false
  const css=`
  #tryamm-ecology{position:absolute;inset:0;z-index:6;pointer-events:none;overflow:hidden;font-family:system-ui,sans-serif}
  #tryamm-ecology .eco{position:absolute;filter:drop-shadow(0 2px 3px #0008);will-change:transform}
  #tryamm-ecology .dog{left:14%;top:63%;font-size:20px;animation:ecoDog 9s ease-in-out infinite alternate}
  #tryamm-ecology .cat{right:15%;top:60%;font-size:19px;animation:ecoCat 7s ease-in-out infinite alternate}
  #tryamm-ecology .pet{font-size:14px;animation:ecoPet 8s ease-in-out infinite alternate}.pet.pt2{animation-delay:-1.6s}.pet.pt3{animation-delay:-3.2s}.pet.pt4{animation-delay:-4.8s}.pet.pt5{animation-delay:-6.1s}
  #tryamm-ecology .squirrel{left:8%;top:52%;font-size:15px;animation:ecoSquirrel 5s ease-in-out infinite alternate}
  #tryamm-ecology .rabbit{right:10%;top:56%;font-size:15px;animation:ecoRabbit 6.5s ease-in-out infinite alternate}
  #tryamm-ecology .sky-bird{font-size:13px;animation:ecoBird 9s linear infinite}
  #tryamm-ecology .pigeon{font-size:13px;animation:ecoPigeon 4.8s ease-in-out infinite alternate}.pigeon.pg2{animation-delay:-1.2s}.pigeon.pg3{animation-delay:-2.4s}.pigeon.pg4{animation-delay:-3.6s}.pigeon.pg5{animation-delay:-4.4s}
  #tryamm-ecology .parrot{font-size:16px;animation:ecoParrot 9.5s ease-in-out infinite}.parrot.p2{animation-delay:-3s}.parrot.p3{animation-delay:-6s}
  #tryamm-ecology .goose{font-size:15px;animation:ecoFlock 11s linear infinite}.goose.g2{animation-delay:-1.8s}.goose.g3{animation-delay:-3.6s}.goose.g4{animation-delay:-5.4s}
  #tryamm-ecology .bug{font-size:9px;animation:ecoBug 7s ease-in-out infinite}.bug.i2{animation-delay:-2s}.bug.i3{animation-delay:-4s}.bug.i4{animation-delay:-5.3s}
  #tryamm-ecology .roach{font-size:10px;animation:ecoRoach 4.5s steps(8,end) infinite}.roach.r2{animation-delay:-1.3s}.roach.r3{animation-delay:-2.6s}.roach.r4{animation-delay:-3.8s}
  #tryamm-ecology .spider{right:6%;top:27%;font-size:13px;animation:ecoSpider 5s ease-in-out infinite alternate}
  #tryamm-ecology .river{position:absolute;left:3%;right:3%;top:22%;height:10%;border-radius:50%;background:linear-gradient(180deg,#55b8e91a,#0e6c9e38);overflow:hidden}
  #tryamm-ecology .fish{position:absolute;font-size:12px;animation:ecoFish 8s linear infinite}.fish.f2{top:28%;animation-delay:-1.5s}.fish.f3{top:52%;animation-delay:-3s}.fish.f4{top:66%;animation-delay:-4.7s}.fish.f5{top:38%;animation-delay:-6s}
  #tryamm-ecology .herd{position:absolute;left:2%;bottom:5%;width:30%;height:12%;opacity:.88}
  #tryamm-ecology .deer{position:absolute;font-size:16px;animation:ecoHerd 12s ease-in-out infinite alternate}.deer.h2{left:28px;top:8px;animation-delay:-1.3s}.deer.h3{left:55px;top:2px;animation-delay:-2.6s}.deer.h4{left:78px;top:10px;animation-delay:-3.9s}
  #tryamm-ecology .label{position:absolute;left:8px;bottom:8px;padding:4px 6px;border-radius:6px;background:#03131cbd;border:1px solid #70e6ff55;color:#c8f7ff;font:800 7px/1.1 system-ui}
  @keyframes ecoDog{from{transform:translateX(0)}to{transform:translateX(58px)}}
  @keyframes ecoCat{0%,100%{transform:translate(0,0) scale(1)}35%{transform:translate(-26px,-2px) scale(.96)}70%{transform:translate(-9px,5px) scale(1.02)}}
  @keyframes ecoPet{0%,100%{transform:translate(0,0)}35%{transform:translate(10px,-3px)}70%{transform:translate(-8px,4px)}}
  @keyframes ecoSquirrel{from{transform:translate(0,0)}to{transform:translate(34px,-8px)}}
  @keyframes ecoRabbit{from{transform:translateX(0)}to{transform:translateX(-42px)}}
  @keyframes ecoBird{0%{transform:translate(-15vw,10vh)}100%{transform:translate(115vw,-5vh)}}
  @keyframes ecoPigeon{0%,100%{transform:translate(0,0) rotate(-3deg)}35%{transform:translate(12px,3px) rotate(4deg)}70%{transform:translate(-7px,5px) rotate(-2deg)}}
  @keyframes ecoParrot{0%,100%{transform:translate(0,0) rotate(-6deg)}30%{transform:translate(36px,-18px) rotate(6deg)}60%{transform:translate(82px,8px) rotate(-3deg)}}
  @keyframes ecoFlock{0%{transform:translate(-15vw,18vh)}100%{transform:translate(115vw,8vh)}}
  @keyframes ecoBug{0%,100%{transform:translate(0,0)}25%{transform:translate(22px,-15px)}50%{transform:translate(40px,8px)}75%{transform:translate(12px,18px)}}
  @keyframes ecoRoach{0%{transform:translate(0,0) rotate(0)}25%{transform:translate(24px,3px) rotate(12deg)}50%{transform:translate(45px,-2px) rotate(-8deg)}75%{transform:translate(18px,5px) rotate(6deg)}100%{transform:translate(0,0)}}
  @keyframes ecoSpider{from{transform:translateY(-6px)}to{transform:translateY(20px)}}
  @keyframes ecoFish{0%{left:-10%;transform:scaleX(1)}49%{left:95%;transform:scaleX(1)}50%{left:95%;transform:scaleX(-1)}100%{left:-10%;transform:scaleX(-1)}}
  @keyframes ecoHerd{from{transform:translateX(-8px)}to{transform:translateX(30px)}}
  @media(prefers-reduced-motion:reduce){#tryamm-ecology *{animation:none!important}}
  `
  function birdSky(){
    return birdRegistry.slice(1,10).map(([name,icon],i)=>`<span class="eco sky-bird" data-bird="${name}" style="top:${8+(i%5)*4}%;left:${-10-(i%4)*7}%;animation-delay:-${(i*1.15).toFixed(2)}s;animation-duration:${8+(i%4)*1.4}s">${icon}</span>`).join('')
  }
  function petStreet(){
    return petRegistry.slice(2,7).map(([name,icon],i)=>`<span class="eco pet pt${i+1}" data-pet="${name}" data-behavior="${['follow','wander','sit','play','rest'][i%5]}" style="left:${36+i*10}%;top:${66+(i%2)*5}%">${icon}</span>`).join('')
  }
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]');if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='tryamm-ecology-style';style.textContent=css;document.head.appendChild(style)
    const layer=document.createElement('div');layer.id='tryamm-ecology';layer.setAttribute('aria-hidden','true')
    layer.innerHTML=`
      <div class="river">${[1,2,3,4,5].map(i=>`<span class="fish f${i} eco">🐟</span>`).join('')}</div>
      <span class="eco dog" data-pet="dog" data-behavior="follow">🐕</span><span class="eco cat" data-pet="cat" data-behavior="wander">🐈</span>${petStreet()}
      <span class="eco squirrel">🐿️</span><span class="eco rabbit">🐇</span>
      ${birdSky()}
      ${[1,2,3,4,5].map((i)=>`<span class="eco pigeon pg${i}" style="left:${9+i*5}%;top:${60+(i%2)*4}%">🐦</span>`).join('')}
      ${[1,2,3].map((i)=>`<span class="eco parrot p${i}" style="top:${25+i*4}%;left:${58+i*8}%">🦜</span>`).join('')}
      ${[1,2,3,4].map((i)=>`<span class="eco goose g${i}" style="top:${16+i*2}%;left:${-12-i*4}%">🪿</span>`).join('')}
      ${[1,2,3,4].map((i)=>`<span class="eco bug i${i}" style="left:${24+i*13}%;top:${30+i*7}%">${i%2?'🦋':'🐝'}</span>`).join('')}
      ${[1,2,3,4].map((i)=>`<span class="eco roach r${i}" style="left:${7+i*18}%;top:${72+(i%2)*6}%">🪳</span>`).join('')}
      <span class="eco spider">🕷️</span>
      <div class="herd">${[1,2,3,4].map(i=>`<span class="deer h${i}">🦌</span>`).join('')}</div>
      <div class="label">SIMULATED GAME ECOLOGY • pets • pigeon flock • bird registry • herd • school • insects</div>`
    main.appendChild(layer)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-ecology-ready',{detail:{source:'simulated-game-ecology',pets:petRegistry.map(([name])=>name),petBehaviors:['follow','wander','sit','play','rest'],animals:['squirrel','rabbit','deer'],birds:birdRegistry.map(([name])=>name),insects:['butterfly','bee','roach','spider'],aquatic:['fish'],groupBehaviors:['flock','herd','school'],petsProtectedFromHunting:true,reducedMotion:reduced()}}))
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
