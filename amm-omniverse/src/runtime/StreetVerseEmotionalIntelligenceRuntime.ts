import {requestStreetVerseExpression} from '../data/streetVerseFacialExpressions'
import {streetVerseAffect,type StreetVerseAffectId} from '../data/streetVerseEmotionalAffects'

export type StreetVerseEmotionState=Readonly<{
 characterId:string
 affect:StreetVerseAffectId
 valence:number
 arousal:number
 trust:number
 affection:number
 embarrassment:number
 blush:number
 pupilDilation:number
 breathing:number
 posture:'open'|'neutral'|'guarded'|'withdrawn'|'energized'
 updatedAt:string
 authority:'RUNTIME'
}>

const clamp01=(n:number)=>Math.max(0,Math.min(1,n))
const clampSigned=(n:number)=>Math.max(-1,Math.min(1,n))

export function installStreetVerseEmotionalIntelligenceRuntime(characterId='bj-stubbs'){
 let state:StreetVerseEmotionState={
  characterId,
  affect:'calm',
  valence:.15,
  arousal:.15,
  trust:.5,
  affection:.35,
  embarrassment:0,
  blush:0,
  pupilDilation:0,
  breathing:.15,
  posture:'neutral',
  updatedAt:new Date().toISOString(),
  authority:'RUNTIME',
 }
 let adultLane=false
 let romanticConsent=false

 const publish=()=>{
  window.dispatchEvent(new CustomEvent('tryamm:character-emotion-state',{detail:state}))
  window.dispatchEvent(new CustomEvent('tryamm:character-affect-visual',{detail:{
   characterId,
   affect:state.affect,
   blush:state.blush,
   pupilDilation:state.pupilDilation,
   breathing:state.breathing,
   posture:state.posture,
   source:'emotional-intelligence',
  }}))
 }

 const setAffect=(id:StreetVerseAffectId,source:string)=>{
  const affect=streetVerseAffect(id)
  if(affect.adultOnly&&(!adultLane||!romanticConsent)){
   window.dispatchEvent(new CustomEvent('tryamm:character-emotion-blocked',{detail:{characterId,affect:id,reason:!adultLane?'adult-lane-required':'consent-required',source}}))
   return false
  }
  state={
   ...state,
   affect:id,
   valence:affect.valence,
   arousal:affect.arousal,
   trust:clamp01(state.trust+affect.trustDelta),
   affection:clamp01(state.affection+affect.affectionDelta),
   embarrassment:clamp01(affect.embarrassment),
   blush:clamp01(affect.blush),
   pupilDilation:clampSigned(affect.pupilDilation),
   breathing:clamp01(affect.breathing),
   posture:affect.posture,
   updatedAt:new Date().toISOString(),
  }
  requestStreetVerseExpression({characterId,expression:affect.expression,source:'emotional-intelligence'})
  publish()
  return true
 }

 const onSet=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string;affect?:StreetVerseAffectId;source?:string}>).detail||{}
  if(d.characterId&&d.characterId!==characterId)return
  if(d.affect)setAffect(d.affect,String(d.source||'external'))
 }
 const onConsent=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string;adultLane?:boolean;romanticConsent?:boolean}>).detail||{}
  if(d.characterId&&d.characterId!==characterId)return
  if(typeof d.adultLane==='boolean')adultLane=d.adultLane
  if(typeof d.romanticConsent==='boolean')romanticConsent=d.romanticConsent
  window.dispatchEvent(new CustomEvent('tryamm:character-emotion-consent-state',{detail:{characterId,adultLane,romanticConsent}}))
 }
 const onDialogue=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string;sentiment?:string;relationship?:string;consensualFlirt?:boolean}>).detail||{}
  if(d.characterId&&d.characterId!==characterId)return
  if(d.consensualFlirt)setAffect('flirtatious','dialogue')
  else if(d.sentiment==='positive')setAffect('happy','dialogue')
  else if(d.sentiment==='negative')setAffect('sad','dialogue')
 }
 const onCelebrate=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string}>).detail||{}
  if(d.characterId&&d.characterId!==characterId)return
  setAffect('proud','celebrate')
 }
 const onDamage=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string}>).detail||{}
  if(d.characterId&&d.characterId!==characterId)return
  setAffect('afraid','damage')
 }

 window.addEventListener('tryamm:character-affect-set',onSet)
 window.addEventListener('tryamm:character-emotion-consent',onConsent)
 window.addEventListener('tryamm:streetverse-npc-dialogue',onDialogue)
 window.addEventListener('tryamm:streetverse-character-celebrate',onCelebrate)
 window.addEventListener('tryamm:streetverse-character-damage',onDamage)
 queueMicrotask(publish)

 return{
  setAffect,
  getState:()=>state,
  dispose:()=>{
   window.removeEventListener('tryamm:character-affect-set',onSet)
   window.removeEventListener('tryamm:character-emotion-consent',onConsent)
   window.removeEventListener('tryamm:streetverse-npc-dialogue',onDialogue)
   window.removeEventListener('tryamm:streetverse-character-celebrate',onCelebrate)
   window.removeEventListener('tryamm:streetverse-character-damage',onDamage)
  }
 }
}
