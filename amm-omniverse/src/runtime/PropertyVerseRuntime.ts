import { getPropertyVerseRegistry,PROPERTYVERSE_LANES,readPropertyListings,savePropertyListing,searchPropertyListings,type PropertyLane,type PropertyListing } from '../data/PropertyVerseRegistry'

let installed=false
function emitState(){window.dispatchEvent(new CustomEvent('tryamm:propertyverse-state',{detail:{...getPropertyVerseRegistry(),listings:readPropertyListings()}}))}
export function installPropertyVerseRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  window.addEventListener('tryamm:propertyverse-open',()=>emitState())
  window.addEventListener('tryamm:propertyverse-search',(event:Event)=>{const d=(event as CustomEvent<{lane?:PropertyLane}>).detail||{};window.dispatchEvent(new CustomEvent('tryamm:propertyverse-results',{detail:{lane:d.lane,results:searchPropertyListings(d.lane)}}))})
  window.addEventListener('tryamm:propertyverse-save',(event:Event)=>{const d=(event as CustomEvent<PropertyListing>).detail;if(d?.id&&d?.lane){savePropertyListing(d);emitState()}})
  window.addEventListener('tryamm:propertyverse-lane',(event:Event)=>{const d=(event as CustomEvent<{lane?:PropertyLane}>).detail||{};const lane=d.lane;const config=lane?Object.values(PROPERTYVERSE_LANES).find(x=>x.id===lane):undefined;window.dispatchEvent(new CustomEvent('tryamm:propertyverse-lane-ready',{detail:{lane:config,listings:lane?searchPropertyListings(lane):[]}}))})
  window.dispatchEvent(new CustomEvent('tryamm:propertyverse-ready',{detail:{...getPropertyVerseRegistry(),networkConnections:['marketplace','payments-gate','creator-media','StreetVerse','My World recovery','Omniverse event fabric'],governmentEndorsement:false}}))
  queueMicrotask(emitState)
}
