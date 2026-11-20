import {useEffect,useState} from 'react'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

/** Approved local publication paths. These are checks, NOT evidence that binaries were deployed. */
import {STREETVERSE_RECOVERED_THREE_CAST} from '../data/StreetVerseRecoveredThreeCast'
import {importStreetVerseCharacterFiles,readLocalCastAsset} from '../runtime/StreetVerseCharacterLocalRecovery'
export const STREETVERSE_THREE_CAST=STREETVERSE_RECOVERED_THREE_CAST
type CastResult={id:string;name:string;status:'passed'|'missing'|'invalid';meshes:number;skins:number;clips:string[];url:string;error?:string}
const btn:React.CSSProperties={minHeight:54,background:'#17465b',color:'white',padding:'10px 13px',borderRadius:12,border:'1px solid #7fc8df',fontWeight:800,touchAction:'manipulation'}
export default function StreetVerseThreeCastAssetAuditHUD(){
 const [open,setOpen]=useState(false)
 const [loading,setLoading]=useState(false)
 const [importing,setImporting]=useState(false)
 const [importMessage,setImportMessage]=useState('Import the recovery ZIP or original GLB files to load the real cast without server assets.')
 const [selectedActor,setSelectedActor]=useState<'bj-stubbs'|'jacobie-stubbs'|'lateasia-monroe'>('jacobie-stubbs')
 const [actionLog,setActionLog]=useState<Array<{actor?:string;action?:string;status:string;reason?:string;matchingMotionClip?:boolean;time:string}>>([])
 const [results,setResults]=useState<CastResult[]>([])
 const [stageResult,setStageResult]=useState<{status:string;results?:Array<{name:string;status:string;error?:string}>;allThreeMounted?:boolean}|null>(null)
 useEffect(()=>{
  const onResult=(e:Event)=>{
   const d=(e as CustomEvent<{status:string;actor?:string;action?:string;reason?:string;matchingMotionClip?:boolean;results?:Array<{name:string;status:string;error?:string}>;allThreeMounted?:boolean}>).detail
   if(['action-started','action-blocked','action-complete'].includes(d.status))setActionLog(old=>[...old.slice(-39),{actor:d.actor,action:d.action,status:d.status,reason:d.reason,matchingMotionClip:d.matchingMotionClip,time:new Date().toISOString()}])
   setStageResult(d)
  }
  window.addEventListener('tryamm:streetverse-cast-stage-result',onResult)
  return()=>window.removeEventListener('tryamm:streetverse-cast-stage-result',onResult)
 },[])
 const test=async()=>{
  if(loading)return
  setLoading(true)
  const next:CastResult[]=[]
  for(const candidate of STREETVERSE_THREE_CAST){
   try{
    let bytes=await readLocalCastAsset(candidate.id)
    if(!bytes){
     const res=await fetch(candidate.url,{cache:'no-store'})
     if(!res.ok||(res.headers.get('content-type')||'').includes('text/html'))throw Error('Missing published GLB. Import recovery ZIP or GLB files.')
     bytes=await res.arrayBuffer()
    }
    if(bytes.byteLength<20||new DataView(bytes).getUint32(0,true)!==0x46546c67)throw Error('not a GLB binary')
    const gltf=await new GLTFLoader().parseAsync(bytes,new URL('.',new URL(candidate.url,window.location.href)).href)
    let meshes=0,skins=0
    gltf.scene.traverse(node=>{if(node instanceof THREE.Mesh)meshes++;if(node instanceof THREE.SkinnedMesh&&node.skeleton?.bones.length)skins++})
    const clips=gltf.animations.map(clip=>clip.name)
    const ok=meshes>0&&skins>0&&clips.length>0
    next.push({id:candidate.id,name:candidate.name,status:ok?'passed':'invalid',meshes,skins,clips,url:candidate.url,error:ok?undefined:'missing animated, skinned mesh or animation clip'})
    gltf.scene.traverse(node=>{if(node instanceof THREE.Mesh)node.geometry?.dispose()})
   }catch(error){next.push({id:candidate.id,name:candidate.name,status:'missing',meshes:0,skins:0,clips:[],url:candidate.url,error:String(error)})}
  }
  setResults(next);setLoading(false)
 }
 const move=(action:'walk'|'run'|'jump'|'hop'|'vault')=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-cast-stage-action',{detail:{actor:selectedActor,action}}))
 const exportReport=()=>{
  const report={schema:'streetverse.three-cast.parkour-check.v2',results,stageResult,actionLog,selectedActor,allAssetsVerified:results.length===3&&results.every(r=>r.status==='passed'),visualAppearanceCertified:false,deviceAnimationCertified:false,exportedAt:new Date().toISOString()}
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}))
  const a=document.createElement('a');a.href=url;a.download='StreetVerse_Three_Cast_Asset_Check.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 return <aside style={{position:'fixed',left:8,top:'max(170px,env(safe-area-inset-top) + 150px)',zIndex:42018,color:'white',fontFamily:'system-ui'}}>
   <button style={btn} aria-expanded={open} onClick={()=>setOpen(x=>!x)}>🎭 BJ / JACOBIE / LaTEASIA</button>
   {open&&<section role="region" aria-label="Verify all three original character assets" style={{background:'#091928f6',padding:12,borderRadius:14,border:'1px solid #75adbf',width:'min(400px,calc(100vw - 16px))',maxHeight:'60dvh',overflowY:'auto',display:'grid',gap:9}}>
    <strong>Three-Character Production Check</strong>
    <p style={{fontSize:13,margin:0}}>Checks whether the restored GLBs actually load from this deployment and contain meshes, skinning and motion clips. Not a likeness or visual gameplay certification.</p>
    <label style={{display:'block',fontSize:14,fontWeight:700}}>IMPORT ORIGINAL 3D CHARACTERS (ZIP or GLB)
      <input aria-label="Import recovered three-character ZIP or GLB files" type="file" accept=".zip,.glb,model/gltf-binary,application/zip" multiple disabled={importing} onChange={async e=>{
       const files=e.target.files
       if(!files?.length)return
       setImporting(true)
       try{
        const results=await importStreetVerseCharacterFiles(files)
        for(const item of results)if(item.stored)try{localStorage.setItem('tryamm:streetverse:cast-source:'+item.id,'device-local')}catch{}
        setImportMessage(results.map(x=>x.name+': '+(x.stored?'saved on device':x.error)).join(' • '))
        if(results.some(x=>x.id==='bj-stubbs'&&x.stored))window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-v15-preview',{detail:{source:'three-cast-local-import'}}))
        const active=new URLSearchParams(window.location.search).get('character')||''
        const recoveredId=active.startsWith('jacobie')?'jacobie-stubbs':active.startsWith('lateasia')?'lateasia-monroe':null
        if(recoveredId&&results.some(x=>x.id===recoveredId&&x.stored))window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-retry',{detail:{characterId:recoveredId,source:'three-cast-local-import'}}))
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-cast-stage-open'))
       }catch(error){setImportMessage(String(error))}
       finally{setImporting(false);e.target.value=''}
      }} style={{display:'block',maxWidth:'100%',minHeight:52}}/>
    </label>
    <p role="status" style={{fontSize:12,margin:0}}>{importing?'Importing original model files…':importMessage}</p>
    <button style={{...btn,background:'#54402c'}} onClick={()=>{try{localStorage.removeItem('tryamm:streetverse:cast-source:jacobie-stubbs');localStorage.removeItem('tryamm:streetverse:cast-source:lateasia-monroe')}catch{};setImportMessage('Restored original Library-backed hosted GLB preference.');window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-retry',{detail:{characterId:selectedActor,source:'restore-hosted-original'}}))}}>RESTORE ORIGINAL LIBRARY MODELS</button>
    <button style={btn} disabled={loading} onClick={()=>{void test()}}>{loading?'CHECKING…':'ONE PUSH — VERIFY ALL 3'}</button>
    {results.map(r=><div key={r.id} style={{borderBottom:'1px solid #33546a',paddingBottom:7,fontSize:13}}><b>{r.name}: {r.status.toUpperCase()}</b><div>{r.meshes} meshes · {r.skins} skinned meshes · {r.clips.length} animations</div>{r.error&&<div>{r.error}</div>}</div>)}
    <button style={btn} disabled={!results.length||loading} onClick={exportReport}>EXPORT CHARACTER REPORT</button>
    <button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-cast-stage-open'))}>LOAD ALL THREE IN 3D SCENE</button>
    <label>Choose character<select style={{width:'100%',minHeight:50}} value={selectedActor} onChange={e=>setSelectedActor(e.target.value as typeof selectedActor)}><option value='bj-stubbs'>BJ Stubbs</option><option value='jacobie-stubbs'>Jacobie Stubbs</option><option value='lateasia-monroe'>LaTeasia Monroe</option></select></label>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>{(['walk','run','jump','hop','vault'] as const).map(action=><button key={action} style={btn} onClick={()=>move(action)}>{action.toUpperCase()}</button>)}<button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-cast-stage-reset'))}>RESET</button></div>
    <small>Jacobie obstacle vault requires a detected low hurdle, JumpRun clip and clear landing. BJ/LaTeasia movement uses available clips; missing jump clips use root-motion placeholders and are not certified stunt animation.</small>
    {actionLog.length>0&&<div role='status' style={{fontSize:12}}>Last action: {actionLog[actionLog.length-1].actor} · {actionLog[actionLog.length-1].action} · {actionLog[actionLog.length-1].status}{actionLog[actionLog.length-1].reason?' — '+actionLog[actionLog.length-1].reason:''}</div>}
    {stageResult&&<div role="status" aria-live="polite"><strong>3D scene: {stageResult.status}</strong>{stageResult.results?.map(x=><div key={x.name}>{x.name}: {x.status}{x.error?' — '+x.error:''}</div>)}{stageResult.status==='done'&&<div>{stageResult.allThreeMounted?'Three characters mounted; visual device acceptance still pending.':'One or more original GLBs not installed or failed to decode.'}</div>}</div>}
   </section>}
 </aside>
}
