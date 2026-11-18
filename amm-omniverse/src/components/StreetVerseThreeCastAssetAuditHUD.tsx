import {useState} from 'react'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

/** Approved local publication paths. These are checks, NOT evidence that binaries were deployed. */
export const STREETVERSE_THREE_CAST = [
 {id:'bj-stubbs',name:'BJ Stubbs',url:'/tryamm-assets/meshy/characters/BJ_Stubbs_V15_Black_Suit_Purple_Shirt_Restore.glb',motion:/walk|run|idle/i},
 {id:'jacobie-stubbs',name:'Jacobie Stubbs',url:'/tryamm-assets/meshy/characters/JACOBIE_STUBBS_12_MOTIONS.glb',motion:/walk|jump|run/i},
 {id:'lateasia-monroe',name:'LaTeasia Monroe',url:'/tryamm-assets/meshy/characters/LATEASIA_MONROE_RIGGED.glb',motion:/walk|idle|talk/i},
] as const
type CastResult={id:string;name:string;status:'passed'|'missing'|'invalid';meshes:number;skins:number;clips:string[];url:string;error?:string}
const btn:React.CSSProperties={minHeight:54,background:'#17465b',color:'white',padding:'10px 13px',borderRadius:12,border:'1px solid #7fc8df',fontWeight:800,touchAction:'manipulation'}
export default function StreetVerseThreeCastAssetAuditHUD(){
 const [open,setOpen]=useState(false)
 const [loading,setLoading]=useState(false)
 const [results,setResults]=useState<CastResult[]>([])
 const test=async()=>{
  if(loading)return
  setLoading(true)
  const next:CastResult[]=[]
  for(const candidate of STREETVERSE_THREE_CAST){
   try{
    const res=await fetch(candidate.url,{cache:'no-store'})
    if(!res.ok||/text\/html/i.test(res.headers.get('content-type')||''))throw Error('asset unavailable: HTTP '+res.status)
    const bytes=await res.arrayBuffer()
    if(bytes.byteLength<20||new DataView(bytes).getUint32(0,true)!==0x46546c67)throw Error('not a GLB binary')
    const gltf=await new GLTFLoader().parseAsync(bytes,new URL('.',new URL(candidate.url,window.location.href)).href)
    let meshes=0,skins=0
    gltf.scene.traverse(node=>{if(node instanceof THREE.Mesh)meshes++;if(node instanceof THREE.SkinnedMesh&&node.skeleton?.bones.length)skins++})
    const clips=gltf.animations.map(clip=>clip.name)
    const ok=meshes>0&&skins>0&&clips.length>0&&clips.some(name=>candidate.motion.test(name))
    next.push({id:candidate.id,name:candidate.name,status:ok?'passed':'invalid',meshes,skins,clips,url:candidate.url,error:ok?undefined:'missing animated, skinned mesh or motion clip'})
    gltf.scene.traverse(node=>{if(node instanceof THREE.Mesh)node.geometry?.dispose()})
   }catch(error){next.push({id:candidate.id,name:candidate.name,status:'missing',meshes:0,skins:0,clips:[],url:candidate.url,error:String(error)})}
  }
  setResults(next);setLoading(false)
 }
 const exportReport=()=>{
  const report={schema:'streetverse.three-cast.asset-check.v1',results,allAssetsVerified:results.length===3&&results.every(r=>r.status==='passed'),visualAppearanceCertified:false,deviceAnimationCertified:false,exportedAt:new Date().toISOString()}
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}))
  const a=document.createElement('a');a.href=url;a.download='StreetVerse_Three_Cast_Asset_Check.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 return <aside style={{position:'fixed',left:8,top:'max(170px,env(safe-area-inset-top) + 150px)',zIndex:42018,color:'white',fontFamily:'system-ui'}}>
   <button style={btn} aria-expanded={open} onClick={()=>setOpen(x=>!x)}>🎭 BJ / JACOBIE / LaTEASIA</button>
   {open&&<section role="region" aria-label="Verify all three original character assets" style={{background:'#091928f6',padding:12,borderRadius:14,border:'1px solid #75adbf',width:'min(400px,calc(100vw - 16px))',maxHeight:'60dvh',overflowY:'auto',display:'grid',gap:9}}>
    <strong>Three-Character Production Check</strong>
    <p style={{fontSize:13,margin:0}}>Checks whether the restored GLBs actually load from this deployment and contain meshes, skinning and motion clips. Not a likeness or visual gameplay certification.</p>
    <button style={btn} disabled={loading} onClick={()=>{void test()}}>{loading?'CHECKING…':'ONE PUSH — VERIFY ALL 3'}</button>
    {results.map(r=><div key={r.id} style={{borderBottom:'1px solid #33546a',paddingBottom:7,fontSize:13}}><b>{r.name}: {r.status.toUpperCase()}</b><div>{r.meshes} meshes · {r.skins} skinned meshes · {r.clips.length} animations</div>{r.error&&<div>{r.error}</div>}</div>)}
    <button style={btn} disabled={!results.length||loading} onClick={exportReport}>EXPORT CHARACTER REPORT</button>
   </section>}
 </aside>
}
