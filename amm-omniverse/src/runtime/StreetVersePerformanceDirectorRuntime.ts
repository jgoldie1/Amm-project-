import {findPerformanceAssets,performanceCertification} from '../data/StreetVersePerformanceRegistry'

export type PerformanceRequest={
 performerId:string;city:string;category:'dance'|'stunt'|'fighter'|'acting'|'pose'|'locomotion'|'animal'|'crowd'
 species?:'humanoid'|'quadruped'|'bird'|'creature';style?:string;live?:boolean;reel?:boolean
}

export function installStreetVersePerformanceDirector(){
 if(typeof window==='undefined')return ()=>{}
 const onRequest=(event:Event)=>{
  const detail=(event as CustomEvent<PerformanceRequest>).detail
  if(!detail?.performerId)return
  const matches=findPerformanceAssets({category:detail.category,species:detail.species??'humanoid',city:detail.city,style:detail.style,commercial:true})
  const asset=matches.find(a=>performanceCertification(a).certified)
  if(!asset){
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-performance-fallback',{detail:{...detail,reason:'no-certified-compatible-asset'}}))
   return
  }
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-animation',{detail:{
   npcId:detail.performerId,animation:asset.id,assetId:asset.id,skeletonFamily:asset.skeletonFamily,
   category:asset.category,serverFinancialReward:false
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-performance-vfx',{detail:{
   performerId:detail.performerId,preset:detail.category==='dance'?'stage-pulse':detail.category==='stunt'?'cinematic-impact':'performance-neutral',
   intensity:'mobile-safe'
  }}))
  if(detail.live||detail.reel)window.dispatchEvent(new CustomEvent('tryamm:streetverse-streamer-moment',{detail:{
   kind:'performance',performerId:detail.performerId,assetId:asset.id,live:Boolean(detail.live),reel:Boolean(detail.reel),financialReward:false
  }}))
 }
 window.addEventListener('tryamm:streetverse-performance-request',onRequest)
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-performance-director-ready',{detail:{rightsGate:true,mobileSafeVfx:true}}))
 return ()=>window.removeEventListener('tryamm:streetverse-performance-request',onRequest)
}
