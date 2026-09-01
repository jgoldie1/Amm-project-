export type AutomanAction=
 | 'streetverse.navigate'
 | 'streetverse.vehicle.enter'
 | 'streetverse.vehicle.exit'
 | 'streetverse.race.start'
 | 'streetverse.drift.start'
 | 'streetverse.city.event'
 | 'streetverse.npc.routine'
 | 'gameverse.open'
 | 'sportverse.open'
 | 'holo.overlay'
 | 'holo.benny'
 | 'creator.reel.capture'
 | 'creator.live.open'
 | 'command-nexus.status'

export type AutomanRisk='low'|'provider-gated'|'blocked'
export type AutomanCommand={
 action:AutomanAction
 source?:'user'|'hologpt'|'benny'|'construct'|'system'
 target?:string
 metadata?:Record<string,unknown>
}
export type AutomanReceipt={
 id:string
 action:AutomanAction
 risk:AutomanRisk
 accepted:boolean
 reason?:string
 createdAt:string
 source:string
}

type AutomanWindow=typeof window&{
 __tryammAutomanCommand?:(command:AutomanCommand|string)=>AutomanReceipt
 __tryammAutomanState?:()=>{active:boolean;lastReceipt?:AutomanReceipt;receipts:AutomanReceipt[]}
 __recordStreetVerseWorldEvent?:(event:any)=>unknown
 __dispatchStreetVerseCityEvent?:(event:any)=>unknown
}

const receipts:AutomanReceipt[]=[]
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))
const id=()=>`automan_${Date.now()}_${Math.random().toString(36).slice(2,8)}`

function classify(command:AutomanCommand):AutomanRisk{
 const m=command.metadata||{}
 if(m['realMoney']===true||m['externalSettlement']===true||m['physicalHardwareControl']===true)return 'provider-gated'
 if(m['bypassSafety']===true||m['disableModeration']===true)return 'blocked'
 return 'low'
}

function fromText(text:string):AutomanCommand{
 const q=text.toLowerCase()
 if(q.includes('drift'))return {action:'streetverse.drift.start',source:'user',metadata:{prompt:text}}
 if(q.includes('race'))return {action:'streetverse.race.start',source:'user',metadata:{prompt:text}}
 if(q.includes('enter')&&q.includes('car'))return {action:'streetverse.vehicle.enter',source:'user',metadata:{prompt:text}}
 if(q.includes('exit')&&q.includes('car'))return {action:'streetverse.vehicle.exit',source:'user',metadata:{prompt:text}}
 if(q.includes('reel')||q.includes('record'))return {action:'creator.reel.capture',source:'user',metadata:{prompt:text}}
 if(q.includes('live')||q.includes('broadcast'))return {action:'creator.live.open',source:'user',metadata:{prompt:text}}
 if(q.includes('benny'))return {action:'holo.benny',source:'user',metadata:{prompt:text}}
 if(q.includes('holo')||q.includes('ar')||q.includes('overlay'))return {action:'holo.overlay',source:'user',metadata:{prompt:text}}
 if(q.includes('sport'))return {action:'sportverse.open',source:'user',metadata:{prompt:text}}
 if(q.includes('game'))return {action:'gameverse.open',source:'user',metadata:{prompt:text}}
 if(q.includes('traffic')||q.includes('concert')||q.includes('nightlife')||q.includes('rain'))return {action:'streetverse.city.event',source:'user',metadata:{prompt:text}}
 return {action:'command-nexus.status',source:'user',metadata:{prompt:text}}
}

function route(command:AutomanCommand){
 const w=window as AutomanWindow
 switch(command.action){
  case 'streetverse.navigate': emit('tryamm:streetverse-automan-navigate',command); break
  case 'streetverse.vehicle.enter': emit('tryamm:streetverse-vehicle-enter-request',command); break
  case 'streetverse.vehicle.exit': emit('tryamm:streetverse-vehicle-exit-request',command); break
  case 'streetverse.race.start':
   w.__recordStreetVerseWorldEvent?.({eventId:id(),kind:'circuit-race',playerId:'local-player',locationId:command.target||'district-01',metadata:{...command.metadata,automan:true}})
   emit('tryamm:streetverse-race-start',command); break
  case 'streetverse.drift.start':
   w.__recordStreetVerseWorldEvent?.({eventId:id(),kind:'drift-challenge',playerId:'local-player',locationId:command.target||'district-01',metadata:{...command.metadata,automan:true}})
   emit('tryamm:streetverse-drift-start',command); break
  case 'streetverse.city.event':
   w.__dispatchStreetVerseCityEvent?.({type:'traffic',locationId:command.target||'district-01',severity:Number(command.metadata?.['severity']||1)})
   emit('tryamm:streetverse-city-director',command); break
  case 'streetverse.npc.routine': emit('tryamm:streetverse-npc-routine',command); break
  case 'gameverse.open': emit('tryamm:gameverse-open',{source:'automan',...command}); break
  case 'sportverse.open': emit('tryamm:sportverse-open',{source:'automan',...command}); emit('tryamm:gameverse-open',{source:'automan',lane:'sports'}); break
  case 'holo.overlay': emit('tryamm:holo-overlay-request',{source:'automan',...command}); break
  case 'holo.benny': emit('tryamm:benny-holo-request',{source:'automan',...command}); break
  case 'creator.reel.capture': emit('tryamm:streetverse-reel-toggle',{source:'automan'}); emit('tryamm:creator:clip-opportunity',{source:'automan',surfaces:['reels','live','ctv-ott-fast']}); break
  case 'creator.live.open': emit('tryamm:live-open',{source:'automan',...command}); break
  case 'command-nexus.status': emit('tryamm:command-nexus-status-request',{source:'automan'}); break
 }
 emit('tryamm:omniverse-submit',{detail:{type:'automan.action',title:`Automan • ${command.action}`,source:'automan'}})
}

export function executeAutomanCommand(input:AutomanCommand|string):AutomanReceipt{
 const command=typeof input==='string'?fromText(input):input
 const risk=classify(command)
 const accepted=risk==='low'
 const receipt:AutomanReceipt={id:id(),action:command.action,risk,accepted,reason:accepted?undefined:risk==='provider-gated'?'Provider/compliance approval required before this action can execute.':'Automan safety policy blocked this action.',createdAt:new Date().toISOString(),source:command.source||'user'}
 receipts.unshift(receipt);if(receipts.length>30)receipts.length=30
 if(accepted)route(command)
 emit('tryamm:automan-receipt',receipt)
 return receipt
}

export function installAutomanOrchestrationRuntime(){
 const w=window as AutomanWindow
 if(w.__tryammAutomanCommand)return
 w.__tryammAutomanCommand=executeAutomanCommand
 w.__tryammAutomanState=()=>({active:true,lastReceipt:receipts[0],receipts:[...receipts]})
 const intent=(event:Event)=>{const detail=(event as CustomEvent<AutomanCommand|string>).detail;if(detail)executeAutomanCommand(detail)}
 window.addEventListener('tryamm:automan-command',intent)
 emit('tryamm:automan-ready',{name:'TRYAMM Automan',role:'action-orchestration',systems:['streetverse','gameverse','sportverse','holograms','benny','reels','live','npc-city-director','command-nexus'],safety:['provider-gated-money','provider-gated-hardware','moderation-cannot-be-bypassed']})
}
