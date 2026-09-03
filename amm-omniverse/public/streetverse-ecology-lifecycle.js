(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const KEY='tryamm.streetverse.ecology.lifecycle.v1'
  const VERSION=1
  const species={
    deer:{adult:12,young:3,min:6,max:30,birth:2,prey:true,group:'herd',season:'spring'},
    rabbit:{adult:24,young:8,min:10,max:60,birth:5,prey:true,group:'colony',season:'spring'},
    squirrel:{adult:18,young:5,min:8,max:45,birth:3,prey:true,group:'family',season:'spring'},
    pigeon:{adult:32,young:8,min:15,max:75,birth:3,prey:true,group:'flock',season:'spring'},
    goose:{adult:16,young:4,min:8,max:38,birth:3,prey:true,group:'flock',season:'spring'},
    parrot:{adult:8,young:2,min:4,max:18,birth:2,prey:false,group:'flock',season:'spring'},
    fish:{adult:45,young:20,min:20,max:120,birth:12,prey:true,group:'school',season:'spring'},
    butterfly:{adult:28,young:10,min:12,max:80,birth:8,prey:true,group:'swarm',season:'summer'},
    roach:{adult:35,young:15,min:15,max:90,birth:8,prey:true,group:'colony',season:'summer'},
    spider:{adult:12,young:4,min:6,max:30,birth:3,prey:false,group:'web',season:'summer'},
    coyote:{adult:5,young:1,min:2,max:10,birth:1,prey:false,group:'pack',season:'spring'},
    hawk:{adult:5,young:1,min:2,max:10,birth:1,prey:false,group:'pair',season:'spring'},
    owl:{adult:4,young:1,min:2,max:8,birth:1,prey:false,group:'pair',season:'spring'}
  }
  const predatorMap={coyote:['rabbit','deer','squirrel'],hawk:['pigeon','rabbit','squirrel'],owl:['rabbit','pigeon','roach']}
  const huntable=new Set(['deer','rabbit','fish'])
  const migratory=new Set(['goose','pigeon','hawk'])
  const hibernating=new Set(['butterfly'])
  const seasonForMonth=m=>m===11||m<2?'winter':m<5?'spring':m<8?'summer':'fall'
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n))
  const nowSeason=()=>seasonForMonth(new Date().getMonth())
  function fresh(){
    const populations={};Object.entries(species).forEach(([name,s])=>populations[name]={adult:s.adult,young:s.young,generation:1})
    return {version:VERSION,season:nowSeason(),cycle:0,populations,lastEvent:'ecosystem initialized',updatedAt:Date.now()}
  }
  function load(){
    try{const parsed=JSON.parse(localStorage.getItem(KEY)||'null');if(parsed?.version===VERSION&&parsed.populations)return parsed}catch{}
    return fresh()
  }
  let state=load(),timer=0
  function save(){state.updatedAt=Date.now();localStorage.setItem(KEY,JSON.stringify(state))}
  function total(name){const p=state.populations[name];return p?Number(p.adult||0)+Number(p.young||0):0}
  function emit(type,detail){window.dispatchEvent(new CustomEvent(type,{detail:{source:'simulated-game-ecology',...detail}}))}
  function lifecycle(name,s,season){
    const p=state.populations[name];if(!p)return
    const before={...p}
    // Young mature gradually; reproduction is represented as pairing/nesting -> offspring, not explicit sexual animation.
    const matured=Math.min(p.young,Math.max(0,Math.floor(p.young*.32)))
    p.young-=matured;p.adult+=matured
    const canBreed=(season===s.season||name==='roach'||name==='fish')&&p.adult>=2&&total(name)<s.max
    let births=0
    if(canBreed&&state.cycle%3===0){births=clamp(Math.floor((p.adult/6)*s.birth),1,Math.max(1,s.max-total(name)));p.young+=births;p.generation+=births?1:0}
    const naturalLoss=Math.max(0,Math.floor(p.adult*.015));p.adult=Math.max(s.min,p.adult-naturalLoss)
    p.adult=clamp(p.adult,0,s.max);p.young=clamp(p.young,0,Math.max(0,s.max-p.adult))
    if(births)emit('tryamm:streetverse-wildlife-offspring',{species:name,babies:births,generation:p.generation,group:s.group,stage:'offspring'})
    if(matured)emit('tryamm:streetverse-wildlife-matured',{species:name,count:matured,stage:'juvenile-to-adult'})
    return {before,after:{...p},births,matured}
  }
  function predation(){
    Object.entries(predatorMap).forEach(([predator,preyList],pi)=>{
      if(total(predator)<1)return
      const prey=preyList[(state.cycle+pi)%preyList.length]
      const def=species[prey],p=state.populations[prey]
      if(!p||total(prey)<=def.min+2)return
      const loss=Math.min(1,Math.max(0,p.adult-def.min));if(!loss)return
      p.adult-=loss
      emit('tryamm:streetverse-predator-prey',{predator,prey,count:loss,graphic:false,outcome:'population-balance'})
    })
  }
  function seasonalBehavior(season){
    migratory.forEach(name=>emit('tryamm:streetverse-wildlife-seasonal',{species:name,season,behavior:season==='fall'?'migration-south':season==='spring'?'migration-return':'local-flock'}))
    hibernating.forEach(name=>emit('tryamm:streetverse-wildlife-seasonal',{species:name,season,behavior:season==='winter'?'dormant':'active'}))
  }
  function tick(){
    const season=nowSeason();state.season=season;state.cycle+=1
    const changes={};Object.entries(species).forEach(([name,s])=>changes[name]=lifecycle(name,s,season))
    predation();if(state.cycle%4===0)seasonalBehavior(season)
    state.lastEvent='life-cycle '+state.cycle;save()
    emit('tryamm:streetverse-ecology-cycle',{cycle:state.cycle,season,populations:state.populations,changes,features:['pairing','nesting','offspring','juvenile-growth','herd-growth','flock-growth','school-growth','migration','hibernation','predator-prey','hunting','fishing']})
  }
  function harvest(kind,speciesName,amount=1){
    const name=String(speciesName||'').toLowerCase();const count=clamp(Number(amount)||1,1,3);const def=species[name],p=state.populations[name]
    if(kind==='hunt'&&!huntable.has(name))return {ok:false,reason:'species-not-open-for-game-hunting'}
    if(kind==='fish'&&name!=='fish')return {ok:false,reason:'fishing-only-targets-fish'}
    if(!def||!p)return {ok:false,reason:'unknown-species'}
    if(total(name)-count<def.min)return {ok:false,reason:'population-conservation-floor'}
    p.adult=Math.max(0,p.adult-count);save()
    const result={ok:true,kind,species:name,count,population:total(name),graphic:false,simulated:true}
    emit('tryamm:streetverse-wildlife-harvest',result);return result
  }
  addEventListener('tryamm:streetverse-hunt-request',e=>emit('tryamm:streetverse-hunt-result',harvest('hunt',e.detail?.species,e.detail?.amount)))
  addEventListener('tryamm:streetverse-fish-request',e=>emit('tryamm:streetverse-fish-result',harvest('fish',e.detail?.species||'fish',e.detail?.amount)))
  window.StreetVerseEcologyLifecycle={
    snapshot:()=>JSON.parse(JSON.stringify(state)),
    tick,
    requestHunt:(speciesName,amount)=>harvest('hunt',speciesName,amount),
    requestFish:(amount)=>harvest('fish','fish',amount),
    reset:()=>{state=fresh();save();return JSON.parse(JSON.stringify(state))}
  }
  save();emit('tryamm:streetverse-ecology-lifecycle-ready',{season:state.season,populations:state.populations,features:['mating-pairing','babies-offspring','herd-flock-school-growth','migration','hibernation','predator-prey','hunting','fishing'],graphic:false})
  timer=window.setInterval(tick,30000)
  addEventListener('pagehide',()=>{if(timer)clearInterval(timer)},{once:true})
})()
