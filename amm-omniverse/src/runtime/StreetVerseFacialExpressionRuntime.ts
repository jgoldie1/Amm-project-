import {STREETVERSE_FACE_CHANNELS,type StreetVerseFacePose} from '../data/streetVerseCharacterHeadRig'
import {streetVerseExpression,type StreetVerseExpressionId} from '../data/streetVerseFacialExpressions'

const EMPTY:StreetVerseFacePose={}

const blendPose=(from:StreetVerseFacePose,to:StreetVerseFacePose,t:number):StreetVerseFacePose=>{
 const pose:StreetVerseFacePose={}
 for(const channel of STREETVERSE_FACE_CHANNELS){
  const a=from[channel]??0,b=to[channel]??0
  pose[channel]=a+(b-a)*t
 }
 return pose
}

export function installStreetVerseFacialExpressionRuntime(characterId='bj-stubbs'){
 let current:StreetVerseFacePose={...streetVerseExpression('neutral').pose}
 let from:StreetVerseFacePose={...current}
 let target:StreetVerseFacePose={...current}
 let expression:StreetVerseExpressionId='neutral'
 let transitionStart=performance.now()
 let transitionMs=180
 let holdUntil=0
 let returning=false
 let raf=0
 let disposed=false

 const publish=(pose:StreetVerseFacePose)=>window.dispatchEvent(new CustomEvent('tryamm:character-face-pose',{detail:{characterId,pose,expression,source:'expression-runtime'}}))

 const setExpression=(id:StreetVerseExpressionId,holdMs?:number)=>{
  const preset=streetVerseExpression(id)
  from={...current}
  target={...preset.pose}
  expression=id
  transitionStart=performance.now()
  transitionMs=Math.max(60,preset.transitionMs)
  holdUntil=transitionStart+(holdMs??preset.holdMs)
  returning=false
  window.dispatchEvent(new CustomEvent('tryamm:character-expression-state',{detail:{characterId,expression:id,active:true,source:'expression-runtime'}}))
 }

 const tick=(now:number)=>{
  if(disposed)return
  const t=Math.min(1,Math.max(0,(now-transitionStart)/Math.max(1,transitionMs)))
  const eased=t*t*(3-2*t)
  current=blendPose(from,target,eased)
  publish(current)
  if(t>=1&&expression!=='neutral'&&holdUntil>0&&now>=holdUntil&&!returning){
   from={...current}
   target={...streetVerseExpression('neutral').pose}
   transitionStart=now
   transitionMs=streetVerseExpression('neutral').transitionMs
   returning=true
  }else if(t>=1&&returning){
   expression='neutral'
   current={...target}
   from={...current}
   holdUntil=0
   returning=false
   window.dispatchEvent(new CustomEvent('tryamm:character-expression-state',{detail:{characterId,expression:'neutral',active:false,source:'expression-runtime'}}))
  }
  raf=requestAnimationFrame(tick)
 }

 const onRequest=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;expression?:StreetVerseExpressionId;holdMs?:number}>).detail||{}
  if(detail.characterId&&detail.characterId!==characterId)return
  if(!detail.expression)return
  setExpression(detail.expression,detail.holdMs)
 }

 const onDialogue=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;expression?:StreetVerseExpressionId}>).detail||{}
  if(detail.characterId&&detail.characterId!==characterId)return
  if(detail.expression)setExpression(detail.expression)
 }

 const onCelebrate=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string}>).detail||{}
  if(detail.characterId&&detail.characterId!==characterId)return
  setExpression('proud',2200)
 }

 const onDamage=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string}>).detail||{}
  if(detail.characterId&&detail.characterId!==characterId)return
  setExpression('concerned',1200)
 }

 window.addEventListener('tryamm:character-expression-request',onRequest)
 window.addEventListener('tryamm:streetverse-npc-dialogue',onDialogue)
 window.addEventListener('tryamm:streetverse-character-celebrate',onCelebrate)
 window.addEventListener('tryamm:streetverse-character-damage',onDamage)

 raf=requestAnimationFrame(tick)

 return{
  setExpression,
  getState:()=>({characterId,expression,pose:{...current}}),
  dispose:()=>{
   disposed=true
   cancelAnimationFrame(raf)
   window.removeEventListener('tryamm:character-expression-request',onRequest)
   window.removeEventListener('tryamm:streetverse-npc-dialogue',onDialogue)
   window.removeEventListener('tryamm:streetverse-character-celebrate',onCelebrate)
   window.removeEventListener('tryamm:streetverse-character-damage',onDamage)
   publish(EMPTY)
  }
 }
}
