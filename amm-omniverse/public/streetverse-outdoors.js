(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  let mounted=false
  const protectedSpecies=new Set(['whale','dolphin','sea-turtle','seal','sea-lion','sea-otter','parrot','dog','cat','hamster','guinea-pig','parakeet','turtle','aquarium-fish'])
  const activities=[
    {id:'fish',label:'🎣 FISH',desc:'Simulated fishing with population conservation floors.'},
    {id:'hunt',label:'🦌 HUNT',desc:'Non-graphic simulated hunting for game-approved species only.'},
    {id:'release',label:'↩️ CATCH & RELEASE',desc:'Fishing challenge that returns the catch to the simulated habitat.'},
    {id:'track',label:'🐾 TRACK',desc:'Follow simulated tracks, calls and habitat clues.'},
    {id:'photo',label:'📸 WILDLIFE PHOTO',desc:'Photo-safari mission with no harvest.'},
    {id:'birdwatch',label:'🔭 BIRDWATCH',desc:'Spot pigeons, raptors, waterfowl, parrots and songbirds.'},
    {id:'rescue',label:'🛟 RESCUE',desc:'Game-world injured/stranded wildlife rescue mission.'},
    {id:'camp',label:'⛺ CAMP',desc:'Rest, listen to nature and discover ecology missions.'}
  ]
  const css=`
  #sv-outdoors-open{position:absolute;left:12px;top:108px;z-index:21;min-height:44px;padding:0 11px;border-radius:12px;border:1px solid #a6ef9b;background:#071b10e8;color:#fff;font:900 10px/1 system-ui;box-shadow:0 6px 18px #0008;pointer-events:auto}
  #sv-outdoors{position:absolute;left:10px;right:10px;bottom:12px;z-index:28;display:none;max-height:52%;overflow:auto;border-radius:14px;border:1px solid #8df2a5;background:#03140ff2;color:#fff;padding:10px;box-shadow:0 10px 30px #000b;pointer-events:auto;font-family:system-ui,sans-serif}
  #sv-outdoors[data-open="true"]{display:block}
  #sv-outdoors h3{margin:0 0 5px;font-size:14px;color:#b9ffc6}#sv-outdoors p{margin:0 0 8px;font-size:10px;line-height:1.35;color:#d9f7df}
  #sv-outdoors .grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
  #sv-outdoors button{min-height:44px;border-radius:10px;border:1px solid #7edb91;background:#0c2a19;color:#fff;font:800 10px/1.15 system-ui;padding:6px}
  #sv-outdoors .status{margin-top:8px;padding:7px;border-radius:8px;background:#071a11;border:1px solid #4c9f65;color:#d7ffe0;font:800 9px/1.25 system-ui}
  #sv-outdoors .close{float:right;min-width:44px}
  #sv-outdoors button:focus,#sv-outdoors-open:focus{outline:3px solid #fff;outline-offset:2px}
  `
  const emit=(type,detail)=>window.dispatchEvent(new CustomEvent(type,{detail:{source:'simulated-game-outdoors',...detail}}))
  function choose(list){return list[Math.floor(Math.random()*list.length)]}
  function action(activity,status){
    const terrestrial=['deer','rabbit'];
    const fish=['fish'];
    const trackable=['deer','rabbit','squirrel','coyote','pigeon','goose','owl','hawk','dog','cat'];
    const birds=['pigeon','crow','sparrow','robin','cardinal','parrot','eagle','owl','duck','goose','swan'];
    if(activity==='fish'){
      const result=window.StreetVerseEcologyLifecycle?.requestFish?.(1)
      status.textContent=result?.ok?`Fishing result: caught ${result.count} simulated fish. Population now ${result.population}.`:`Fishing unavailable: ${result?.reason||'ecology system not ready'}.`
      emit('tryamm:streetverse-outdoors-action',{activity:'fishing',result})
      return
    }
    if(activity==='hunt'){
      const target=choose(terrestrial);if(protectedSpecies.has(target))return
      const result=window.StreetVerseEcologyLifecycle?.requestHunt?.(target,1)
      status.textContent=result?.ok?`Hunt complete: ${target}. Non-graphic game event; population now ${result.population}.`:`Hunt blocked: ${result?.reason||'ecology system not ready'}.`
      emit('tryamm:streetverse-outdoors-action',{activity:'hunting',target,result,graphic:false})
      return
    }
    if(activity==='release'){
      const snapshot=window.StreetVerseEcologyLifecycle?.snapshot?.();const population=snapshot?.populations?.fish
      status.textContent=`Catch & release: simulated fish returned safely. Fish population unchanged${population?` at ${(population.adult||0)+(population.young||0)}`:''}.`
      emit('tryamm:streetverse-outdoors-action',{activity:'catch-release',species:'fish',released:true})
      return
    }
    if(activity==='track'){
      const target=choose(trackable);status.textContent=`Tracking mission: follow ${target} signs toward the next habitat marker.`
      emit('tryamm:streetverse-outdoors-action',{activity:'tracking',target,harvest:false})
      return
    }
    if(activity==='photo'){
      const target=choose([...trackable,'butterfly','spider','dolphin','whale']);status.textContent=`Photo safari: capture a non-invasive image of ${target}.`
      emit('tryamm:streetverse-outdoors-action',{activity:'wildlife-photo',target,harvest:false})
      return
    }
    if(activity==='birdwatch'){
      const target=choose(birds);status.textContent=`Birdwatch mission: spot and identify a ${target}. No harvest.`
      emit('tryamm:streetverse-outdoors-action',{activity:'birdwatching',target,harvest:false})
      return
    }
    if(activity==='rescue'){
      const target=choose(['bird','rabbit','turtle','seal']);status.textContent=`Rescue mission: assist a simulated ${target} and bring it to the game-world care point.`
      emit('tryamm:streetverse-outdoors-action',{activity:'wildlife-rescue',target,harvest:false})
      return
    }
    if(activity==='camp'){
      status.textContent='Camp established. Nature audio, ecology cycles and nearby wildlife missions remain active.'
      emit('tryamm:streetverse-outdoors-action',{activity:'camping',harvest:false})
    }
  }
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]');if(!city)return
    const main=city.querySelector('main');if(!main)return
    mounted=true
    const style=document.createElement('style');style.id='sv-outdoors-style';style.textContent=css;document.head.appendChild(style)
    const open=document.createElement('button');open.id='sv-outdoors-open';open.type='button';open.textContent='🌲 OUTDOORS';open.setAttribute('aria-controls','sv-outdoors');open.setAttribute('aria-expanded','false')
    const panel=document.createElement('section');panel.id='sv-outdoors';panel.dataset.open='false';panel.setAttribute('aria-label','StreetVerse simulated outdoors activities')
    panel.innerHTML=`<button class="close" type="button" aria-label="Close outdoors panel">✕</button><h3>STREETVERSE OUTDOORS</h3><p>Simulated game activities only. Protected species and pets cannot be hunted. Wildlife populations use conservation floors.</p><div class="grid">${activities.map(a=>`<button type="button" data-activity="${a.id}" title="${a.desc}">${a.label}</button>`).join('')}</div><div class="status" aria-live="polite">Choose an outdoors activity.</div>`
    const setOpen=v=>{panel.dataset.open=String(v);open.setAttribute('aria-expanded',String(v))}
    open.addEventListener('click',()=>setOpen(panel.dataset.open!=='true'));panel.querySelector('.close')?.addEventListener('click',()=>setOpen(false))
    const status=panel.querySelector('.status');panel.querySelectorAll('[data-activity]').forEach(btn=>btn.addEventListener('click',()=>action(btn.dataset.activity,status)))
    main.append(open,panel)
    emit('tryamm:streetverse-outdoors-ready',{activities:activities.map(a=>a.id),protectedSpecies:[...protectedSpecies],graphic:false,simulated:true})
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
