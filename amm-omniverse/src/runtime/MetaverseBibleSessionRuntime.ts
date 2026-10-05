export type MetaverseBibleSession={
 id:string;startedAt:number;updatedAt:number;scripture:boolean;studyLayer:boolean;immersive:boolean;reflection:boolean;
 scriptureRefs:string[];layers:string[];immersiveIds:string[];reflectionText:string;completionRequested:boolean
}

const KEY='tryamm.metaverse-bible.study-session.v1'
let installed=false
const empty=():MetaverseBibleSession=>({id:'mb-'+Date.now().toString(36),startedAt:Date.now(),updatedAt:Date.now(),scripture:false,studyLayer:false,immersive:false,reflection:false,scriptureRefs:[],layers:[],immersiveIds:[],reflectionText:'',completionRequested:false})
export function readMetaverseBibleSession():MetaverseBibleSession{try{return {...empty(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return empty()}}
function write(v:MetaverseBibleSession){v.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(v))}catch{};window.dispatchEvent(new CustomEvent('tryamm:metaverse-bible-session-state',{detail:v}))}
const add=(xs:string[],x:string)=>x&&xs.includes(x)?xs:(x?[...xs,x]:xs)
function maybeComplete(v:MetaverseBibleSession){
 const ready=v.scripture&&v.studyLayer&&v.immersive&&v.reflection
 if(ready&&!v.completionRequested){
  v.completionRequested=true
  window.dispatchEvent(new CustomEvent('tryamm:mission-completion-request',{detail:{missionId:'metaverse-bible-study',source:'metaverse-bible-session',sessionId:v.id,clientPayouts:false,serverRewardAuthority:true}}))
  window.dispatchEvent(new CustomEvent('tryamm:metaverse-bible-session-complete',{detail:{...v,serverVerified:false,rewardClaimed:false}}))
 }
 write(v)
}

export function installMetaverseBibleSessionRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true
 const update=(fn:(v:MetaverseBibleSession)=>void)=>{const v=readMetaverseBibleSession();fn(v);maybeComplete(v)}
 const scripture=(e:Event)=>update(v=>{const d=(e as CustomEvent<any>).detail||{};v.scripture=true;v.scriptureRefs=add(v.scriptureRefs,String(d.reference||d.book||'scripture'))})
 const layer=(e:Event)=>update(v=>{const d=(e as CustomEvent<any>).detail||{};const id=String(d.layer||d.id||'');if(id){v.studyLayer=true;v.layers=add(v.layers,id)}})
 const world=(e:Event)=>update(v=>{const d=(e as CustomEvent<any>).detail||{};const id=String(d.id||d.portal||'world');const immersiveIds=new Set(['faith-chrono','holo-lab','esther-jubilees']);if(immersiveIds.has(id)){v.immersive=true;v.immersiveIds=add(v.immersiveIds,id)}})
 const spatial=(e:Event)=>update(v=>{const d=(e as CustomEvent<any>).detail||{};const id=String(d.portal||d.id||'spatial-world');v.immersive=true;v.immersiveIds=add(v.immersiveIds,id)})
 const chrono=(e:Event)=>update(v=>{const d=(e as CustomEvent<any>).detail||{};const id=String(d.id||'faith-chrono');v.immersive=true;v.immersiveIds=add(v.immersiveIds,id)})
 const reflection=(e:Event)=>update(v=>{const d=(e as CustomEvent<any>).detail||{};const text=String(d.text||'').trim().slice(0,4000);if(text.length>=8){v.reflection=true;v.reflectionText=text}})
 window.addEventListener('tryamm:metaverse-bible-scripture-studied',scripture as EventListener)
 window.addEventListener('tryamm:faith-holobook-layer-selected',layer as EventListener)
 window.addEventListener('tryamm:metaverse-bible-world-entered',world as EventListener)
 window.addEventListener('tryamm:faithverse-spatial-portal-entered',spatial as EventListener)
 window.addEventListener('tryamm:faith-chrono-launched',chrono as EventListener)
 window.addEventListener('tryamm:metaverse-bible-reflection-saved',reflection as EventListener)
 write(readMetaverseBibleSession())
 return()=>{
  window.removeEventListener('tryamm:metaverse-bible-scripture-studied',scripture as EventListener)
  window.removeEventListener('tryamm:faith-holobook-layer-selected',layer as EventListener)
  window.removeEventListener('tryamm:metaverse-bible-world-entered',world as EventListener)
  window.removeEventListener('tryamm:faithverse-spatial-portal-entered',spatial as EventListener)
  window.removeEventListener('tryamm:faith-chrono-launched',chrono as EventListener)
  window.removeEventListener('tryamm:metaverse-bible-reflection-saved',reflection as EventListener)
  installed=false
 }
}

export function resetMetaverseBibleSession(){const v=empty();write(v);return v}