import {useEffect,useMemo,useState} from 'react'

type Anchor={id:string;label:string;x:number;z:number;url:string;verified:true}
const MAX_ANCHORS=100
const DISTANCE_METERS=15
/** Only allow explicitly verified, HTTPS storefronts. No user geolocation or NFC access. */
export function normalizeStreetVerseArAnchors(value:unknown):Anchor[]{
 if(!Array.isArray(value))return []
 const result:Anchor[]=[]
 const ids=new Set<string>()
 for(const item of value.slice(0,MAX_ANCHORS)){
  if(!item||typeof item!=='object')continue
  const a=item as Record<string,unknown>
  if(a.verified!==true||typeof a.id!=='string'||typeof a.label!=='string'||typeof a.url!=='string')continue
  if(typeof a.x!=='number'||typeof a.z!=='number'||!Number.isFinite(a.x)||!Number.isFinite(a.z)||a.id.length>80||a.label.length>90||ids.has(a.id))continue
  try{const u=new URL(a.url);if(u.protocol!=='https:'||u.username||u.password)continue}catch{continue}
  ids.add(a.id);result.push({id:a.id,label:a.label,x:a.x as number,z:a.z as number,url:a.url,verified:true})
 }
 return result
}

export default function StreetVerseArDiscoveryHud(){
 const [enabled,setEnabled]=useState(false)
 const [anchors,setAnchors]=useState<Anchor[]>([])
 const [position,setPosition]=useState({x:0,z:0,ready:false})
 useEffect(()=>{
  const onAnchors=(event:Event)=>setAnchors(normalizeStreetVerseArAnchors((event as CustomEvent).detail?.anchors))
  const onPosition=(event:Event)=>{
   const detail=(event as CustomEvent).detail
   if(Number.isFinite(detail?.x)&&Number.isFinite(detail?.z))setPosition({x:detail.x,z:detail.z,ready:true})
  }
  window.addEventListener('tryamm:streetverse-ar-approved-anchors',onAnchors)
  window.addEventListener('tryamm:streetverse-player-position',onPosition)
  return ()=>{window.removeEventListener('tryamm:streetverse-ar-approved-anchors',onAnchors);window.removeEventListener('tryamm:streetverse-player-position',onPosition)}
 },[])
 const nearby=useMemo(()=>enabled&&position.ready?anchors.filter(a=>Math.hypot(a.x-position.x,a.z-position.z)<=DISTANCE_METERS).slice(0,5):[],[anchors,enabled,position])
 return <div data-streetverse-ar-hud="true" style={{position:'fixed',left:'max(12px,env(safe-area-inset-left))',top:'max(65px,calc(env(safe-area-inset-top) + 65px))',zIndex:17050,maxWidth:225,pointerEvents:'auto'}}>
  <button type="button" aria-label={enabled?'Turn off StreetVerse AR discovery':'Turn on StreetVerse AR discovery'} aria-pressed={enabled} onClick={()=>setEnabled(v=>!v)} style={{minHeight:44,padding:'8px 12px',borderRadius:14,border:'1px solid #79e9ff',background:'rgba(2,19,29,.94)',color:'#fff',fontWeight:800}}>◈ AR {enabled?'ON':'OFF'}</button>
  {enabled&&<div role="status" aria-live="polite" style={{marginTop:6,padding:10,borderRadius:12,background:'rgba(2,19,29,.94)',color:'#e2faff',fontSize:12}}>
   <strong>Nearby verified businesses</strong>
   {nearby.length===0?<p>No approved nearby business markers yet.</p>:<ul style={{margin:'6px 0',paddingLeft:18}}>{nearby.map(a=><li key={a.id}><a href={a.url} target="_blank" rel="noopener noreferrer" style={{color:'#9aeaff'}}>{a.label}</a></li>)}</ul>}
  </div>}
 </div>
}
