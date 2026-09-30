import {createStreetVerseBodyState,type StreetVerseBodyState} from '../data/streetVerseBodyNeeds'

const clamp01=(n:number)=>Math.max(0,Math.min(1,n))

export function installStreetVerseBodyNeedsRuntime(characterId='bj-stubbs'){
 let state=createStreetVerseBodyState(characterId)
 let disposed=false

 const publish=()=>{
  window.dispatchEvent(new CustomEvent('tryamm:character-body-state',{detail:state}))
  const staminaPenalty=clamp01(state.hunger*.22+state.thirst*.28+state.fatigue*.34+state.pain*.24+state.injury*.38+state.temperature*.16)
  const movementScale=Math.max(.52,1-staminaPenalty*.62)
  const sprintAllowed=state.stamina>.18&&state.pain<.82&&state.injury<.72&&state.fatigue<.90
  const breathing=clamp01(.12+state.fatigue*.44+state.pain*.18+state.stress*.26+state.temperature*.20)
  const posture=state.pain>.55||state.injury>.45?'guarded':state.fatigue>.72?'withdrawn':state.stress>.72?'guarded':'neutral'
  window.dispatchEvent(new CustomEvent('tryamm:character-body-effects',{detail:{
   characterId,
   movementScale,
   sprintAllowed,
   breathing,
   posture,
   hunger:state.hunger,
   thirst:state.thirst,
   fatigue:state.fatigue,
   pain:state.pain,
   stress:state.stress,
   temperature:state.temperature,
   injury:state.injury,
   stamina:state.stamina,
   source:'body-needs-runtime',
  }}))
  const desired:string[]=[]
  if(state.hunger>.45)desired.push('food','meal','snack')
  if(state.thirst>.40)desired.push('water','drink')
  if(state.pain>.30||state.injury>.20)desired.push('first-aid','recovery')
  if(state.fatigue>.55)desired.push('rest','home')
  if(desired.length)window.dispatchEvent(new CustomEvent('tryamm:pocket-dimension-context',{detail:{characterId,tags:desired,source:'body-needs-runtime'}}))
 }

 const onSync=(event:Event)=>{
  const next=(event as CustomEvent<StreetVerseBodyState>).detail
  if(!next||next.characterId!==characterId||next.authority!=='SERVER')return
  state={
   ...next,
   hunger:clamp01(next.hunger),
   thirst:clamp01(next.thirst),
   fatigue:clamp01(next.fatigue),
   pain:clamp01(next.pain),
   stress:clamp01(next.stress),
   temperature:clamp01(next.temperature),
   injury:clamp01(next.injury),
   stamina:clamp01(next.stamina),
   updatedAt:new Date().toISOString(),
  }
  publish()
 }

 const onActivity=(event:Event)=>{
  const d=(event as CustomEvent<{intensity?:number;source?:string}>).detail||{}
  const intensity=clamp01(Number(d.intensity??.4))
  window.dispatchEvent(new CustomEvent('tryamm:character-body-state-change-request',{detail:{
   characterId,
   changes:{
    hunger:+(.004+intensity*.006),
    thirst:+(.006+intensity*.010),
    fatigue:+(.004+intensity*.012),
    stamina:-(.008+intensity*.020),
   },
   source:String(d.source||'activity'),
   serverValidate:true,
  }}))
 }

 const onRest=()=>window.dispatchEvent(new CustomEvent('tryamm:character-body-state-change-request',{detail:{
  characterId,changes:{fatigue:-.18,stress:-.12,stamina:+.28},source:'rest',serverValidate:true,
 }}))

 const onDamage=(event:Event)=>{
  const d=(event as CustomEvent<{severity?:number}>).detail||{}
  const severity=clamp01(Number(d.severity??.25))
  window.dispatchEvent(new CustomEvent('tryamm:character-body-state-change-request',{detail:{
   characterId,changes:{pain:+severity*.55,injury:+severity*.35,stress:+severity*.28,stamina:-severity*.22},source:'damage',serverValidate:true,
  }}))
 }

 const onConsumableResult=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string;bodyState?:StreetVerseBodyState}>).detail||{}
  if(d.characterId&&d.characterId!==characterId)return
  if(d.bodyState?.authority==='SERVER')onSync(new CustomEvent('sync',{detail:d.bodyState}))
 }

 window.addEventListener('tryamm:character-body-state-sync',onSync)
 window.addEventListener('tryamm:character-activity',onActivity)
 window.addEventListener('tryamm:character-rest',onRest)
 window.addEventListener('tryamm:streetverse-character-damage',onDamage)
 window.addEventListener('tryamm:character-consumable-result',onConsumableResult)
 queueMicrotask(publish)

 return{
  getState:()=>state,
  dispose:()=>{
   disposed=true
   window.removeEventListener('tryamm:character-body-state-sync',onSync)
   window.removeEventListener('tryamm:character-activity',onActivity)
   window.removeEventListener('tryamm:character-rest',onRest)
   window.removeEventListener('tryamm:streetverse-character-damage',onDamage)
   window.removeEventListener('tryamm:character-consumable-result',onConsumableResult)
  },
 }
}
