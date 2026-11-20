/**
 * TRYAMM Earth Eye Director: original, read-only geographic planning and
 * time-machine handoff; no imported OSINT tracker and no surveillance features.
 * Source data are static city coordinates. No live satellite imagery, GPS,
 * weather, map tiles, device geolocation, payments, or player teleporting.
 */
export type EarthEyeCity={id:string;label:string;region:string;country:string;lat:number;lon:number;worldState:'chicago-code'|'preview-only'}
export const EARTH_EYE_CITIES:readonly EarthEyeCity[]=[
 {id:'chicago',label:'Chicago',region:'Illinois',country:'US',lat:41.8781,lon:-87.6298,worldState:'chicago-code'},
 {id:'detroit',label:'Detroit',region:'Michigan',country:'US',lat:42.3314,lon:-83.0458,worldState:'preview-only'},
 {id:'tampa',label:'Tampa',region:'Florida',country:'US',lat:27.9506,lon:-82.4572,worldState:'preview-only'},
 {id:'memphis',label:'Memphis',region:'Tennessee',country:'US',lat:35.1495,lon:-90.049,worldState:'preview-only'},
 {id:'atlanta',label:'Atlanta',region:'Georgia',country:'US',lat:33.749,lon:-84.388,worldState:'preview-only'},
 {id:'new-york',label:'New York City',region:'New York',country:'US',lat:40.7128,lon:-74.006,worldState:'preview-only'},
 {id:'philadelphia',label:'Philadelphia',region:'Pennsylvania',country:'US',lat:39.9526,lon:-75.1636,worldState:'preview-only'},
 {id:'dallas',label:'Dallas',region:'Texas',country:'US',lat:32.7767,lon:-96.797,worldState:'preview-only'},
 {id:'houston',label:'Houston',region:'Texas',country:'US',lat:29.7604,lon:-95.3698,worldState:'preview-only'},
 {id:'los-angeles',label:'Los Angeles',region:'California',country:'US',lat:34.0522,lon:-118.2437,worldState:'preview-only'},
 {id:'san-diego',label:'San Diego',region:'California',country:'US',lat:32.7157,lon:-117.1611,worldState:'preview-only'},
 {id:'las-vegas',label:'Las Vegas',region:'Nevada',country:'US',lat:36.1699,lon:-115.1398,worldState:'preview-only'},
 {id:'miami',label:'Miami',region:'Florida',country:'US',lat:25.7617,lon:-80.1918,worldState:'preview-only'},
 {id:'addis-ababa',label:'Addis Ababa',region:'Addis Ababa',country:'ET',lat:9.03,lon:38.74,worldState:'preview-only'},
 {id:'lagos',label:'Lagos',region:'Lagos',country:'NG',lat:6.5244,lon:3.3792,worldState:'preview-only'},
]
export type EarthEyeAction='inspect'|'time-preview'|'tile-export-plan'
export type EarthEyeCommand={cityId:string;action:EarthEyeAction}
export type EarthEyeReceipt={ok:boolean;city?:EarthEyeCity;action?:EarthEyeAction;source:'original-static-catalog';authority:'read-only'|'proposal-only';status:'city-summary'|'conceptual-time-preview'|'offline-tile-export-plan'|'unknown-city'|'invalid-command';productionMutation:false;liveData:false;playableTravel:false;notes:string[]}
export function resolveEarthEyeCommand(value:unknown):EarthEyeReceipt{
 const base={source:'original-static-catalog' as const,productionMutation:false as const,liveData:false as const,playableTravel:false as const}
 if(!value||typeof value!=='object')return {...base,ok:false,authority:'read-only',status:'invalid-command',notes:['Use a named city and supported read-only action.']}
 const input=value as Partial<EarthEyeCommand>
 if(!['inspect','time-preview','tile-export-plan'].includes(String(input.action)))return {...base,ok:false,authority:'read-only',status:'invalid-command',notes:['Unsupported Earth Eye action.']}
 const city=EARTH_EYE_CITIES.find(x=>x.id===input.cityId)
 if(!city)return {...base,ok:false,authority:'read-only',status:'unknown-city',notes:['Unknown city; no automatic fallback to a real player spawn.']}
 if(input.action==='inspect')return {...base,ok:true,city,action:input.action,authority:'read-only',status:'city-summary',notes:['Static coordinates only, no live satellite or weather source.','Construct may query the approved world catalog but cannot publish or move a player.',city.worldState==='chicago-code'?'Chicago code exists; device proof still required.':'Preview destination only; no certified gameplay landing.']}
 if(input.action==='time-preview')return {...base,ok:true,city,action:input.action,authority:'proposal-only',status:'conceptual-time-preview',notes:['Time Machine must label evidence level conceptual until independently verified archival sources exist.','Historical reconstruction requires human review and does not overwrite current city state.']}
 return {...base,ok:true,city,action:input.action,authority:'proposal-only',status:'offline-tile-export-plan',notes:['Planetiler processes licensed regional OSM extracts offline; it does not generate buildings/interiors/physics.','No on-device whole-Earth build, provider calls or published assets.','Retain required OpenStreetMap attribution and review data redistribution terms.']}
}
export function installStreetVerseEarthEyeDirector(){
 if(typeof window==='undefined')return()=>{}
 const onCommand=(e:Event)=>{
  const result=resolveEarthEyeCommand((e as CustomEvent).detail)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-earth-eye-result',{detail:result}))
  if(!result.ok||!result.city)return
  if(result.action==='inspect')window.dispatchEvent(new CustomEvent('tryamm:shared-world-context-query',{detail:{surface:'cursor',mode:'inspect',city:result.city.id,query:result.city.label}}))
  if(result.action==='time-preview')window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-request',{detail:{title:result.city.label+' • conceptual reconstruction',mode:'RECONSTRUCTION',era:'unspecified',evidenceLevel:'conceptual',description:'Original Earth Eye planning request; no historical period or verified archive supplied.',objective:'Create evidence review plan only, not an authoritative historical city.',source:'streetverse-earth-eye',cityId:result.city.id,autoPreview:false}}))
 }
 window.addEventListener('tryamm:streetverse-earth-eye-command',onCommand)
 return()=>window.removeEventListener('tryamm:streetverse-earth-eye-command',onCommand)
}
