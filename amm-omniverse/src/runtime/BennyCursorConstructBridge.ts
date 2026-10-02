import {searchGoogloplexCatalog} from './GoogloplexCatalogMemory'
export type AgentSurface='benny'|'cursor'|'construct'
export type SharedWorldContext={surface:AgentSurface;query:string;selectedId?:string;city?:string;mode:'inspect'|'explain'|'navigate'|'propose-build'}
export function resolveSharedWorldContext(c:SharedWorldContext){
 const q=c.selectedId||c.query
 const matches=searchGoogloplexCatalog(q).filter(r=>!c.city||!r.city||r.city===c.city)
 return matches.slice(0,c.surface==='cursor'?1:24).map(r=>({id:r.id,title:r.title,kind:r.kind,status:r.status,rights:r.rights,city:r.city,tags:r.tags,relationships:r.relationships??[],assetPointer:r.assetPointer}))
}
export function installBennyCursorConstructBridge(){
 if(typeof window==='undefined')return()=>{}
 const handler=(e:Event)=>{const d=(e as CustomEvent<SharedWorldContext>).detail;if(!d?.surface)return
  const results=resolveSharedWorldContext(d)
  const canPropose=(d.surface==='construct'||d.surface==='cursor')&&d.mode==='propose-build'
  const detail={surface:d.surface,mode:d.mode,results,
   authority:canPropose?'proposal-only':'read-only',productionMutation:false,requiresApproval:canPropose,
   worldForger:canPropose?{route:'/world-forger',cad:true,meshy:true,texturePolicy:'rights-cleared-or-procedural',streetView:'reference-only'}:undefined}
  window.dispatchEvent(new CustomEvent('tryamm:shared-world-context-result',{detail}))
  if(canPropose)window.dispatchEvent(new CustomEvent('tryamm:world-forge-context-ready',{detail:{query:d.query,selectedId:d.selectedId,city:d.city,results,route:'/world-forger',productionMutation:false}}))
 }
 window.addEventListener('tryamm:shared-world-context-query',handler)
 window.dispatchEvent(new CustomEvent('tryamm:benny-cursor-construct-ready',{detail:{memory:'googloplex',sharedContext:true,productionMutation:false,worldForger:'/world-forger',cad:true,meshy:true}}))
 return()=>window.removeEventListener('tryamm:shared-world-context-query',handler)
}
