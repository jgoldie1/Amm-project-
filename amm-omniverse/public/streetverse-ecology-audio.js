(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const KEY='tryamm.streetverse.ecology.sound'
  let enabled=localStorage.getItem(KEY)==='on'
  let ctx=null,timer=0,mounted=false
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const AudioCtx=window.AudioContext||window.webkitAudioContext
  const css=`
  #sv-eco-sound-toggle{position:absolute;right:12px;top:108px;z-index:20;min-height:44px;padding:0 11px;border-radius:12px;border:1px solid #85eaff;background:#031521e8;color:#fff;font:900 10px/1 system-ui;box-shadow:0 6px 18px #0008;pointer-events:auto}
  #sv-eco-sound-toggle:focus{outline:3px solid #fff;outline-offset:2px}
  `
  function ensureCtx(){if(!AudioCtx)return null;if(!ctx)ctx=new AudioCtx();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx}
  function tone(freq,dur=0.12,type='sine',gain=.018,slide=1){
    const c=ensureCtx();if(!c)return
    const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*slide),c.currentTime+dur);g.gain.setValueAtTime(0.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(gain,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+dur+.02)
  }
  function chirp(){tone(1650,.09,'sine',.018,1.35);setTimeout(()=>tone(2050,.08,'sine',.014,.86),90)}
  function pigeon(){tone(260,.18,'sine',.012,.78);setTimeout(()=>tone(220,.2,'sine',.01,.92),110)}
  function parrot(){tone(1250,.08,'square',.009,1.4);setTimeout(()=>tone(980,.07,'square',.008,.7),90)}
  function bark(){tone(180,.08,'sawtooth',.022,.55);setTimeout(()=>tone(145,.07,'sawtooth',.018,.7),95)}
  function meow(){tone(420,.22,'sine',.016,1.55);setTimeout(()=>tone(610,.16,'sine',.012,.72),120)}
  function goose(){tone(340,.17,'square',.011,.68);setTimeout(()=>tone(300,.15,'square',.009,.8),145)}
  function insect(){tone(4200,.055,'square',.004,1.02);setTimeout(()=>tone(3900,.05,'square',.0035,1.03),70)}
  function water(){tone(115,.35,'sine',.0045,.94);setTimeout(()=>tone(160,.28,'sine',.0035,.9),170)}
  function whale(){tone(82,.75,'sine',.008,1.7);setTimeout(()=>tone(125,.55,'sine',.006,.72),520)}
  function dolphin(){tone(2200,.055,'sine',.008,1.18);setTimeout(()=>tone(2700,.045,'sine',.007,.84),80);setTimeout(()=>tone(2350,.05,'sine',.006,1.1),145)}
  function ocean(){tone(72,.9,'sine',.0038,.96);setTimeout(()=>tone(105,.7,'sine',.003,.92),330)}
  const scenes=[chirp,pigeon,parrot,bark,meow,goose,insect,water,whale,dolphin,ocean]
  function playAmbient(){
    if(!enabled||document.hidden)return
    const i=Math.floor(Math.random()*scenes.length);scenes[i]()
    if(Math.random()>.76)setTimeout(()=>scenes[(i+3)%scenes.length](),420+Math.random()*520)
  }
  function start(){if(!enabled||timer)return;ensureCtx();playAmbient();timer=window.setInterval(playAmbient,4200)}
  function stop(){if(timer){clearInterval(timer);timer=0}try{ctx?.suspend()}catch{}}
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]');if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='sv-eco-sound-style';style.textContent=css;document.head.appendChild(style)
    const btn=document.createElement('button');btn.id='sv-eco-sound-toggle';btn.type='button';btn.setAttribute('aria-pressed',String(enabled));btn.setAttribute('aria-label','Toggle StreetVerse animal and nature sounds')
    const sync=()=>{btn.textContent=enabled?'🔊 ANIMAL SOUND ON':'🔇 ANIMAL SOUND OFF';btn.setAttribute('aria-pressed',String(enabled))}
    btn.addEventListener('click',()=>{enabled=!enabled;localStorage.setItem(KEY,enabled?'on':'off');sync();enabled?start():stop();window.dispatchEvent(new CustomEvent('tryamm:streetverse-ecology-audio',{detail:{enabled,source:'procedural-game-audio',recordings:false}}))})
    sync();main.appendChild(btn);if(enabled)start()
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(enabled)start()})
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-ecology-audio-ready',{detail:{enabled,source:'procedural-game-audio',recordings:false,sounds:['bird-chirp','pigeon-coo','parrot-call','dog-bark','cat-meow','goose-call','insects','water-ambience','whale-call','dolphin-clicks','ocean-ambience'],reducedMotion:reduced()}}))
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>{observer.disconnect();stop();try{ctx?.close()}catch{}},{once:true})
})()
