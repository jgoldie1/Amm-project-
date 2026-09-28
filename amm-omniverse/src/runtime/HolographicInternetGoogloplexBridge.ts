import {searchGoogloplexCatalog} from './GoogloplexCatalogMemory'
export type HoloClientCapabilities={webgl:boolean;webxr:boolean;bandwidth:'low'|'medium'|'high';deviceMemoryGB?:number;audio:boolean;haptics:boolean}
export type HoloRepresentation='metadata'|'thumbnail'|'mobile-3d'|'full-3d'|'immersive-xr'
export function negotiateHoloRepresentation(c:HoloClientCapabilities):HoloRepresentation{
 if(!c.webgl||c.bandwidth==='low')return c.webgl?'thumbnail':'metadata'
 if(c.webxr&&c.bandwidth==='high'&&(c.deviceMemoryGB??0)>=6)return'immersive-xr'
 if(c.bandwidth==='high'&&(c.deviceMemoryGB??0)>=4)return'full-3d'
 return'mobile-3d'
}
export function queryHolographicInternet(query:string,capabilities:HoloClientCapabilities){
 const representation=negotiateHoloRepresentation(capabilities)
 return searchGoogloplexCatalog(query).filter(r=>r.status==='ready'||r.status==='optimize'||r.status==='reference').map(r=>({
  id:r.id,title:r.title,kind:r.kind,status:r.status,rights:r.rights,city:r.city,tags:r.tags,
  representation,
  assetPointer:r.status==='ready'&&representation!=='metadata'?r.assetPointer:undefined,
  thumbnailPointer:representation!=='metadata'?r.thumbnailPointer:undefined,
  relationships:r.relationships??[]
 }))
}
export function installHolographicInternetBridge(){
 if(typeof window==='undefined')return()=>{}
 const handler=(e:Event)=>{const d=(e as CustomEvent<{query?:string;capabilities?:HoloClientCapabilities}>).detail
  if(!d?.capabilities)return
  const results=queryHolographicInternet(d.query??'',d.capabilities)
  window.dispatchEvent(new CustomEvent('tryamm:holo-internet-results',{detail:{query:d.query??'',results,source:'googloplex-memory'}}))
 }
 window.addEventListener('tryamm:holo-internet-query',handler)
 window.dispatchEvent(new CustomEvent('tryamm:holo-internet-ready',{detail:{catalog:'googloplex',adaptiveDelivery:true}}))
 return()=>window.removeEventListener('tryamm:holo-internet-query',handler)
}
