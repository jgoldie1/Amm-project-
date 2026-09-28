export type IntentSource='touch'|'keyboard'|'voice'|'sign'|'aac'|'switch'|'cursor'|'benny'
export type UniversalIntent='navigate'|'enter-vehicle'|'exit-vehicle'|'open-mission'|'open-store'|'call-benny'|'translate'|'construct-proposal'|'undo'|'escape'
export type IntentRequest={id:string;source:IntentSource;intent:UniversalIntent;targetId?:string;utterance?:string;confidence?:number}
const highRisk=new Set<UniversalIntent>(['construct-proposal'])
export function routeUniversalIntent(r:IntentRequest){
 if(typeof r.confidence==='number'&&r.confidence<.8)return {status:'clarify' as const,reason:'low-confidence',request:r}
 if(highRisk.has(r.intent))return {status:'approval-required' as const,request:r,productionMutation:false}
 return {status:'ready' as const,request:r,productionMutation:false}
}
export function installUniversalIntentRouter(){
 if(typeof window==='undefined')return()=>{}
 const handler=(e:Event)=>{const r=(e as CustomEvent<IntentRequest>).detail;if(!r)return
  const result=routeUniversalIntent(r)
  window.dispatchEvent(new CustomEvent('tryamm:universal-intent-routed',{detail:result}))
  if(result.status==='ready')window.dispatchEvent(new CustomEvent('tryamm:universal-intent-action',{detail:r}))
 }
 window.addEventListener('tryamm:universal-intent',handler)
 window.dispatchEvent(new CustomEvent('tryamm:universal-intent-ready',{detail:{multiInput:true,undo:true,escape:true,productionMutation:false}}))
 return()=>window.removeEventListener('tryamm:universal-intent',handler)
}
