(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const KEY='tryamm.streetverse.marine.lifecycle.v1'
  const species={
    whale:{adult:6,young:1,min:4,max:12,birth:1,group:'pod',protected:true,cycle:'calving'},
    dolphin:{adult:12,young:3,min:8,max:28,birth:1,group:'pod',protected:true,cycle:'calving'},
    shark:{adult:7,young:2,min:4,max:16,birth:2,group:'school',protected:false,cycle:'nursery'},
    ray:{adult:9,young:3,min:5,max:20,birth:2,group:'school',protected:false,cycle:'nursery'},
    seal:{adult:8,young:2,min:5,max:18,birth:1,group:'colony',protected:true,cycle:'pupping'},
    'sea-turtle':{adult:10,young:4,min:6,max:24,birth:4,group:'nest',protected:true,cycle:'nesting'},
    octopus:{adult:10,young:5,min:5,max:24,birth:4,group:'den',protected:false,cycle:'hatching'},
    squid:{adult:18,young:8,min:8,max:42,birth:6,group:'school',protected:false,cycle:'spawning'},
    jellyfish:{adult:22,young:12,min:10,max:55,birth:8,group:'bloom',protected:false,cycle:'bloom'},
    crab:{adult:24,young:10,min:12,max:60,birth:6,group:'colony',protected:false,cycle:'hatching'},
    lobster:{adult:14,young:5,min:7,max:32,birth:4,group:'reef',protected:false,cycle:'hatching'},
    'reef-fish':{adult:40,young:18,min:20,max:100,birth:10,group:'school',protected:false,cycle:'spawning'},
    'school-fish':{adult:55,young:25,min:25,max:140,birth:14,group:'school',protected:false,cycle:'spawning'}
  }
  const migration=new Set(['whale','dolphin','shark','sea-turtle'])
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n))
  function fresh(){const populations={};Object.entries(species).forEach(([n,s])=>populations[n]={adult:s.adult,young:s.young,generation:1});return {cycle:0,populations,updatedAt:Date.now()}}
  function load(){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p?.populations)return p}catch{}return fresh()}
  let state=load(),timer=0
  const emit=(type,detail)=>window.dispatchEvent(new CustomEvent(type,{detail:{source:'simulated-game-marine-ecology',...detail}}))
  const total=n=>{const p=state.populations[n];return p?(p.adult||0)+(p.young||0):0}
  function tick(){
    state.cycle++
    Object.entries(species).forEach(([name,s],i)=>{
      const p=state.populations[name];if(!p)return
      const matured=Math.min(p.young,Math.floor(p.young*.25));p.young-=matured;p.adult+=matured
      let babies=0
      if(state.cycle%4===i%4&&p.adult>=2&&total(name)<s.max){babies=clamp(Math.max(1,Math.floor((p.adult/8)*s.birth)),1,s.max-total(name));p.young+=babies;p.generation+=babies?1:0}
      p.adult=clamp(p.adult,s.min,s.max);p.young=clamp(p.young,0,Math.max(0,s.max-p.adult))
      if(babies)emit('tryamm:streetverse-marine-offspring',{species:name,babies,stage:s.cycle,group:s.group,protected:s.protected,generation:p.generation})
      if(matured)emit('tryamm:streetverse-marine-matured',{species:name,count:matured,stage:'juvenile-to-adult'})
      if(migration.has(name)&&state.cycle%5===0)emit('tryamm:streetverse-marine-migration',{species:name,group:s.group,behavior:'seasonal-route'})
    })
    state.updatedAt=Date.now();localStorage.setItem(KEY,JSON.stringify(state))
    emit('tryamm:streetverse-marine-cycle',{cycle:state.cycle,populations:state.populations,features:['pods','calves','pups','nesting','hatching','spawning','schools','blooms','migration']})
  }
  window.StreetVerseMarineLifecycle={snapshot:()=>JSON.parse(JSON.stringify(state)),tick,protectedSpecies:Object.entries(species).filter(([,s])=>s.protected).map(([n])=>n)}
  localStorage.setItem(KEY,JSON.stringify(state))
  emit('tryamm:streetverse-marine-lifecycle-ready',{populations:state.populations,protectedSpecies:window.StreetVerseMarineLifecycle.protectedSpecies,features:['pods','calves','pups','nesting','hatching','spawning','schools','blooms','migration']})
  timer=window.setInterval(tick,36000)
  addEventListener('pagehide',()=>{if(timer)clearInterval(timer)},{once:true})
})()
