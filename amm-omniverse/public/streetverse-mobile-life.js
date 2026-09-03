(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const reduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const hour=new Date().getHours()
  const phase=hour<6?'night':hour<9?'morning':hour<17?'day':hour<20?'evening':'night'
  const weatherModes=['clear','overcast','rain','light-snow']
  const storedWeather=localStorage.getItem('tryamm.streetverse.sim-weather')
  const weather=weatherModes.includes(storedWeather)?storedWeather:'clear'
  const behaviorStates=['walk','wait','shop','talk','watch','travel','event','argue','fight','cheer','scared']
  const behaviorLabels={walk:'WALK',wait:'WAIT',shop:'SHOP',talk:'TALK',watch:'WATCH',travel:'TRAVEL',event:'EVENT',argue:'ARGUE',fight:'FIGHT',cheer:'CHEER',scared:'SCARED'}
  const dialogue={
    talk:[['Γεια σου! Τι κάνεις;','Hello! How are you?'],['Πάμε στην αγορά.','Let’s go to the market.']],
    argue:[['Μη μου μιλάς έτσι!','Don’t talk to me like that!'],['Ηρέμησε, μπορούμε να το λύσουμε.','Calm down, we can work it out.']],
    fight:[['Σταμάτα! Δεν αξίζει!','Stop! It’s not worth it!'],['Κάντε πίσω!','Back off!']],
    cheer:[['Πάμε! Πάμε!','Let’s go!'],['Μπράβο!','Bravo!']],
    scared:[['Τι ήταν αυτό;','What was that?'],['Φύγε από εδώ!','Get out of here!']],
    event:[['Η κούρσα αρχίζει!','The race is starting!'],['Όλοι στο StreetVerse!','Everybody to StreetVerse!']]
  }
  const destinations={
    shop:[{left:9,top:34,label:'Omni Market'},{left:83,top:40,label:'64 Track Studio'}],
    talk:[{left:45,top:49,label:'Creator Plaza'},{left:62,top:46,label:'Holo Plaza'}],
    watch:[{left:62,top:28,label:'Creator Pop-Up'}],
    event:[{left:84,top:69,label:'Race Night'}],
    argue:[{left:46,top:52,label:'Creator Plaza'},{left:78,top:62,label:'Race Night Entrance'}],
    fight:[{left:79,top:65,label:'Race Night Security Zone'}],
    cheer:[{left:82,top:67,label:'Race Night Crowd'}],
    scared:[{left:68,top:58,label:'Event Exit'}],
    travel:[{left:18,top:61,label:'West District'},{left:71,top:55,label:'Marketplace District'},{left:52,top:31,label:'Riverwalk Route'}]
  }
  let mounted=false,behaviorTimer=0,lastSpokenAt=0
  const voiceKey='tryamm.streetverse.npc-greek-voice'
  let voiceOn=localStorage.getItem(voiceKey)==='on'
  const css=`
  #tryamm-mobile-life{position:absolute;inset:0;pointer-events:none;z-index:7;overflow:hidden}
  #tryamm-mobile-life .sv-atmos{position:absolute;inset:0;transition:background .3s ease}
  #tryamm-mobile-life[data-phase="morning"] .sv-atmos{background:linear-gradient(#ffd6a233,#ffd6a200 42%)}
  #tryamm-mobile-life[data-phase="day"] .sv-atmos{background:linear-gradient(#7bd4ff12,#7bd4ff00 45%)}
  #tryamm-mobile-life[data-phase="evening"] .sv-atmos{background:linear-gradient(#ff7a5940,#68155e12 54%,transparent 72%)}
  #tryamm-mobile-life[data-phase="night"] .sv-atmos{background:linear-gradient(#02081bb0,#0a123c45 50%,#05060c40)}
  #tryamm-mobile-life .sv-car{position:absolute;width:18px;height:34px;border-radius:6px;box-shadow:0 7px 13px #0008;will-change:transform}
  #tryamm-mobile-life .sv-car:before{content:'';position:absolute;left:3px;right:3px;top:5px;height:8px;border-radius:2px;background:#bde8ff}
  #tryamm-mobile-life .sv-car:after{content:'';position:absolute;left:4px;right:4px;bottom:3px;height:3px;border-radius:2px;background:#ff4050}
  #tryamm-mobile-life .lane-a{left:41%;top:18%;background:#e64b45;animation:svDriveA 8s linear infinite;transform:rotate(180deg)}
  #tryamm-mobile-life .lane-b{left:55%;top:63%;background:#e6c845;animation:svDriveB 10s linear infinite}
  #tryamm-mobile-life .lane-c{left:35%;top:70%;background:#3b7dde;animation:svDriveC 11.5s linear infinite -4s;transform:rotate(180deg)}
  #tryamm-mobile-life .sv-bus{position:absolute;left:49%;top:64%;width:28px;height:62px;border-radius:7px;background:#1aa9c9;border:2px solid #e9fbff;box-shadow:0 8px 15px #0009;animation:svBus 18s linear infinite -7s}
  #tryamm-mobile-life .sv-bus:before{content:'CTA';position:absolute;left:3px;right:3px;top:5px;height:12px;border-radius:2px;background:#c8efff;color:#123;font:900 7px/12px system-ui;text-align:center}
  #tryamm-mobile-life .sv-bus:after{content:'';position:absolute;left:4px;right:4px;bottom:4px;height:4px;background:#ff4d5b;border-radius:2px}
  #tryamm-mobile-life .sv-person{position:absolute;width:14px;height:31px;will-change:left,top,transform;animation:svWalk 3.4s ease-in-out infinite alternate;transition:left 1.5s ease,top 1.5s ease,transform .45s ease,filter .25s ease,opacity .25s ease}
  #tryamm-mobile-life .sv-person .head{width:10px;height:10px;border-radius:50%;margin:auto;background:#8d5a3a}
  #tryamm-mobile-life .sv-person .body{width:13px;height:15px;border-radius:5px 5px 2px 2px;margin:1px auto;background:var(--shirt,#7fe8c7)}
  #tryamm-mobile-life .sv-person .legs{width:9px;height:7px;margin:auto;border-left:3px solid #16191e;border-right:3px solid #16191e}
  #tryamm-mobile-life .sv-bubble{position:absolute;left:50%;bottom:36px;transform:translateX(-50%);min-width:72px;max-width:118px;padding:4px 6px;border-radius:7px;background:#020713eb;border:1px solid #c7eeff88;color:#fff;font:800 7px/1.15 system-ui;text-align:center;opacity:0;transition:opacity .2s ease;box-shadow:0 4px 12px #0009}
  #tryamm-mobile-life .sv-person[data-dialogue="on"] .sv-bubble{opacity:1}
  #tryamm-mobile-life .sv-person[data-state="wait"]{animation:none;filter:saturate(.8)}
  #tryamm-mobile-life .sv-person[data-state="shop"]{animation:none;transform:scale(.94)}
  #tryamm-mobile-life .sv-person[data-state="talk"]{animation:svTalk 1.1s ease-in-out infinite alternate;filter:brightness(1.08)}
  #tryamm-mobile-life .sv-person[data-state="watch"]{animation:none;transform:translateY(-4px) scale(1.03)}
  #tryamm-mobile-life .sv-person[data-state="travel"]{animation:svTravel 4.8s linear infinite alternate}
  #tryamm-mobile-life .sv-person[data-state="event"]{animation:svEventBounce .8s ease-in-out infinite alternate;filter:drop-shadow(0 0 5px #ff7ce8)}
  #tryamm-mobile-life .sv-person[data-state="argue"]{animation:svArgue .42s ease-in-out infinite alternate;filter:drop-shadow(0 0 5px #ffb347)}
  #tryamm-mobile-life .sv-person[data-state="fight"]{animation:svFight .34s ease-in-out infinite alternate;filter:drop-shadow(0 0 6px #ff5b5b)}
  #tryamm-mobile-life .sv-person[data-state="cheer"]{animation:svCheer .55s ease-in-out infinite alternate;filter:drop-shadow(0 0 6px #77ffb0)}
  #tryamm-mobile-life .sv-person[data-state="scared"]{animation:svScared .25s ease-in-out infinite alternate;filter:grayscale(.15) brightness(1.15)}
  #tryamm-mobile-life .p1{left:12%;top:43%;--shirt:#7fe8c7;animation-delay:-.8s}#tryamm-mobile-life .p2{left:23%;top:58%;--shirt:#ff7ce8;animation-delay:-1.7s}#tryamm-mobile-life .p3{left:78%;top:49%;--shirt:#ffd166;animation-delay:-2.2s}#tryamm-mobile-life .p4{left:86%;top:63%;--shirt:#8dd7ff;animation-delay:-.2s}#tryamm-mobile-life .p5{left:17%;top:67%;--shirt:#f78c6c;animation-delay:-2.8s}#tryamm-mobile-life .p6{left:69%;top:57%;--shirt:#b9f18c;animation-delay:-1.1s}#tryamm-mobile-life .p7{left:74%;top:35%;--shirt:#cba7ff;animation-delay:-2.4s}
  #tryamm-mobile-life .sv-shop{position:absolute;padding:4px 6px;border:1px solid #73e8ff88;border-radius:6px;background:#041420df;color:#bff7ff;font:800 7px/1.1 system-ui;box-shadow:0 0 12px #31d9ff33;animation:svPulse 3.5s ease-in-out infinite}
  #tryamm-mobile-life .shop-a{left:6%;top:31%}.shop-b{right:6%;top:37%;animation-delay:-1.2s}.shop-c{left:58%;top:24%;animation-delay:-2.1s}
  #tryamm-mobile-life .sv-event{position:absolute;right:4%;top:70%;padding:5px 7px;border-radius:7px;background:#210b2fdd;border:1px solid #ff7ce899;color:#fff;font:900 7px/1.15 system-ui;box-shadow:0 0 15px #ff44cc44;animation:svPulse 2.8s ease-in-out infinite}
  #tryamm-mobile-life .sv-voice{position:absolute;right:12px;top:58px;z-index:10;pointer-events:auto;min-height:44px;padding:0 10px;border-radius:12px;border:1px solid #84e7ff;background:#031521e8;color:#fff;font:900 10px system-ui;box-shadow:0 6px 18px #0008}
  #tryamm-mobile-life .sv-weather{position:absolute;inset:0;overflow:hidden}
  #tryamm-mobile-life[data-weather="overcast"] .sv-weather{background:#34445a35}
  #tryamm-mobile-life .drop{position:absolute;top:-12%;width:1px;height:14px;background:#d5efffb8;animation:svRain 1.15s linear infinite}
  #tryamm-mobile-life .flake{position:absolute;top:-10%;font-size:8px;color:#fff;animation:svSnow 5.5s linear infinite}
  @keyframes svDriveA{0%{transform:translateY(-80px) rotate(180deg) scale(.62)}100%{transform:translateY(520px) rotate(180deg) scale(1.08)}}
  @keyframes svDriveB{0%{transform:translateY(360px) scale(1.04)}100%{transform:translateY(-360px) scale(.64)}}
  @keyframes svDriveC{0%{transform:translateY(-120px) rotate(180deg) scale(.58)}100%{transform:translateY(500px) rotate(180deg) scale(1.05)}}
  @keyframes svBus{0%{transform:translateY(420px) scale(1.06)}100%{transform:translateY(-420px) scale(.58)}}
  @keyframes svWalk{from{transform:translateX(-5px) translateY(0)}to{transform:translateX(12px) translateY(-2px)}}
  @keyframes svTalk{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
  @keyframes svTravel{from{transform:translateX(-10px)}to{transform:translateX(10px)}}
  @keyframes svEventBounce{from{transform:translateY(0)}to{transform:translateY(-5px)}}
  @keyframes svArgue{from{transform:translateX(-3px) rotate(-4deg)}to{transform:translateX(3px) rotate(4deg)}}
  @keyframes svFight{from{transform:translate(-4px,1px) rotate(-6deg)}to{transform:translate(4px,-2px) rotate(6deg)}}
  @keyframes svCheer{from{transform:translateY(0) scale(1)}to{transform:translateY(-7px) scale(1.08)}}
  @keyframes svScared{from{transform:translateX(-2px)}to{transform:translateX(2px)}}
  @keyframes svPulse{0%,100%{opacity:.72}50%{opacity:1}}
  @keyframes svRain{to{transform:translateY(760px)}}
  @keyframes svSnow{0%{transform:translate(0,0) rotate(0)}100%{transform:translate(35px,760px) rotate(240deg)}}
  @media (prefers-reduced-motion:reduce){#tryamm-mobile-life *{animation:none!important;transition:none!important}.sv-weather{display:none!important}}
  `
  function precipitation(){
    if(weather==='rain')return Array.from({length:16},(_,i)=>`<i class="drop" style="left:${(i*7)%100}%;animation-delay:-${(i%7)*.16}s"></i>`).join('')
    if(weather==='light-snow')return Array.from({length:12},(_,i)=>`<i class="flake" style="left:${(i*9)%100}%;animation-delay:-${(i%6)*.7}s">•</i>`).join('')
    return ''
  }
  function speakGreek(text){
    if(!voiceOn||!('speechSynthesis' in window)||!text)return
    const now=Date.now();if(now-lastSpokenAt<6500)return;lastSpokenAt=now
    try{
      speechSynthesis.cancel()
      const u=new SpeechSynthesisUtterance(text);u.lang='el-GR';u.rate=.92;u.pitch=1
      const voices=speechSynthesis.getVoices();const greek=voices.find(v=>String(v.lang).toLowerCase().startsWith('el'))
      if(greek)u.voice=greek
      speechSynthesis.speak(u)
    }catch{}
  }
  function routePerson(person,state,index,stamp){
    const pool=destinations[state]
    if(!pool?.length)return
    const dest=pool[(stamp+index)%pool.length]
    person.style.left=`${dest.left+(index%3-1)*2}%`
    person.style.top=`${dest.top+(index%2?2:-2)}%`
    person.dataset.destination=dest.label
  }
  function setDialogue(person,state,index,stamp){
    const lines=dialogue[state]
    const bubble=person.querySelector('.sv-bubble')
    if(!bubble){return}
    if(!lines?.length){person.dataset.dialogue='off';bubble.textContent='';return}
    const line=lines[(stamp+index)%lines.length]
    bubble.textContent=line[0]
    bubble.title=line[1]
    person.dataset.dialogue='on'
    if(index===0||state==='argue'||state==='fight'||state==='cheer')speakGreek(line[0])
  }
  function cycleBehaviors(layer){
    if(reduceMotion())return
    const people=[...layer.querySelectorAll('.sv-person')]
    const stamp=Math.floor(Date.now()/5600)
    people.forEach((person,i)=>{
      const state=behaviorStates[(stamp+i*2)%behaviorStates.length]
      person.dataset.state=state
      person.dataset.behaviorLabel=behaviorLabels[state]
      if(destinations[state])routePerson(person,state,i,stamp)
      else if(state==='walk'){
        person.style.left=`${12+((i*13+stamp*7)%74)}%`
        person.style.top=`${38+((i*9+stamp*5)%31)}%`
        person.dataset.destination='City Walk'
      }else person.dataset.destination='Current Block'
      setDialogue(person,state,i,stamp)
    })
    const counts=people.reduce((acc,p)=>{const s=p.dataset.state||'walk';acc[s]=(acc[s]||0)+1;return acc},{})
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-behavior',{detail:{npcOnly:true,states:counts,cycleSeconds:5.6,destinationAware:true,emotionAware:true,greekDialogue:true,voiceEnabled:voiceOn,destinations:people.map(p=>p.dataset.destination||'Current Block')}}))
  }
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]')
    if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='tryamm-mobile-life-style';style.textContent=css;document.head.appendChild(style)
    const layer=document.createElement('div');layer.id='tryamm-mobile-life';layer.dataset.phase=phase;layer.dataset.weather=weather;layer.setAttribute('aria-hidden','false')
    const people=[1,2,3,4,5,6,7].map(i=>`<div class="sv-person p${i}" data-state="walk" data-destination="City Walk" data-dialogue="off" aria-label="StreetVerse NPC resident"><div class="sv-bubble"></div><div class="head"></div><div class="body"></div><div class="legs"></div></div>`).join('')
    layer.innerHTML=`<div class="sv-atmos" aria-hidden="true"></div><div class="sv-weather" aria-hidden="true">${precipitation()}</div><div class="sv-car lane-a" aria-hidden="true"></div><div class="sv-car lane-b" aria-hidden="true"></div><div class="sv-car lane-c" aria-hidden="true"></div><div class="sv-bus" aria-hidden="true"></div>${people}<div class="sv-shop shop-a" aria-hidden="true">OMNI MARKET • OPEN</div><div class="sv-shop shop-b" aria-hidden="true">64 TRACK • SESSION</div><div class="sv-shop shop-c" aria-hidden="true">CREATOR POP-UP</div><div class="sv-event" aria-hidden="true">RACE NIGHT • NPC CROWD</div><button class="sv-voice" type="button" aria-pressed="${voiceOn?'true':'false'}">NPC VOICE ${voiceOn?'ON':'OFF'}</button>`
    main.appendChild(layer)
    const voiceButton=layer.querySelector('.sv-voice')
    voiceButton?.addEventListener('click',()=>{
      voiceOn=!voiceOn;localStorage.setItem(voiceKey,voiceOn?'on':'off');voiceButton.textContent=`NPC VOICE ${voiceOn?'ON':'OFF'}`;voiceButton.setAttribute('aria-pressed',voiceOn?'true':'false')
      if(voiceOn)speakGreek('Καλώς ήρθες στο StreetVerse!')
    })
    cycleBehaviors(layer)
    behaviorTimer=window.setInterval(()=>cycleBehaviors(layer),5600)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-life-ready',{detail:{traffic:4,pedestrians:7,storefronts:3,ambientEvents:1,behaviorStates:behaviorStates.length,destinationAware:true,emotionAware:true,greekDialogue:true,greekVoiceAvailable:'speechSynthesis' in window,voiceEnabled:voiceOn,phase,weather,weatherSource:'simulated-world-weather',reducedMotion:reduceMotion(),npcOnly:true,nonGraphicConflict:true}}))
  }
  const observer=new MutationObserver(()=>mount());observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>{observer.disconnect();if(behaviorTimer)clearInterval(behaviorTimer);try{speechSynthesis?.cancel()}catch{}},{once:true})
})()
