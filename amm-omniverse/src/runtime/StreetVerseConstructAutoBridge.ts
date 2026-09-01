import { enterStreetVerseConstruct,exitStreetVerseConstruct,setConstructTargets,updateConstructPlayerPosition } from './StreetVerseWorldAwareConstructRuntime'

const SAVE='tryamm.streetverse.omniworld.v1'
const MISSIONS=[
 {id:'market',label:'Marketplace Delivery',kind:'mission' as const,x:48,z:-28},
 {id:'studio',label:'Creator Studio Session',kind:'mission' as const,x:-44,z:-32},
 {id:'marina',label:'Marina Charter',kind:'mission' as const,x:55,z:72},
 {id:'ads',label:'Holo Ads Campaign',kind:'mission' as const,x:-45,z:38},
 {id:'network',label:'All American Network',kind:'mission' as const,x:38,z:36},
]
const BUSINESSES=[
 {id:'marketplace',label:'All American Marketplace',kind:'business' as const,x:48,z:-28},
 {id:'creator-studio',label:'Creator Studio',kind:'business' as const,x:-44,z:-32},
 {id:'holo-ads',label:'Holo Ads',kind:'business' as const,x:-45,z:38},
 {id:'network',label:'All American Network',kind:'business' as const,x:38,z:36},
]

function readPlayer(){try{const s=JSON.parse(localStorage.getItem(SAVE)||'{}');return {x:Number(s.x)||0,z:Number(s.z)||58}}catch{return {x:0,z:58}}}
function visible(){return Boolean([...document.querySelectorAll('div')].find(el=>el.textContent?.includes('STREETVERSE • CINEMATIC OMNI DISTRICT')))}
let active=false
let timer=0
export function installStreetVerseConstructAutoBridge(){
 if(typeof window==='undefined'||timer)return
 const tick=()=>{
  const live=visible()
  if(live&&!active){active=true;enterStreetVerseConstruct();setConstructTargets([...MISSIONS,...BUSINESSES]);window.dispatchEvent(new CustomEvent('tryamm:streetverse-enter',{detail:{source:'construct-auto-bridge'}}))}
  if(!live&&active){active=false;exitStreetVerseConstruct();window.dispatchEvent(new CustomEvent('tryamm:streetverse-exit',{detail:{source:'construct-auto-bridge'}}))}
  if(active){const p=readPlayer();updateConstructPlayerPosition(p.x,p.z);window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:p}))}
 }
 timer=window.setInterval(tick,700)
 tick()
 window.dispatchEvent(new CustomEvent('tryamm:construct:auto-bridge-ready',{detail:{missions:MISSIONS.length,businesses:BUSINESSES.length,pollMs:700}}))
}
