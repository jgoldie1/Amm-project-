import {useEffect,useState} from 'react'
import type {AnimationRole,CharacterAnimationManifest} from '../lib/streetverseAnimationFactory'

const actions:readonly {role:AnimationRole;label:string}[]=[
 {role:'idle',label:'STAND'},{role:'walk',label:'WALK'},{role:'run',label:'RUN'},
 {role:'wave',label:'WAVE'},{role:'talk',label:'TALK'},{role:'nod',label:'NOD'},{role:'salon',label:'SALON'}
]
const style={minHeight:48,borderRadius:10,padding:'8px 12px',fontWeight:800,fontSize:14,cursor:'pointer'}
/** One-hand, push-button character acceptance test. Visible only when an asset URL is configured. */
export default function StreetVerseLaTeasiaAnimationTest(){
 const [open,setOpen]=useState(false)
 const [manifest,setManifest]=useState<CharacterAnimationManifest|null>(null)
 const [status,setStatus]=useState('Waiting for animated GLB to load')
 useEffect(()=>{
  const ready=(event:Event)=>{
   const d=(event as CustomEvent<{characterId:string;manifest:CharacterAnimationManifest}>).detail
   if(d?.characterId!=='lateasia-monroe')return
   setManifest(d.manifest)
   setStatus('GLB loaded. Select a test button.')
  }
  const error=(event:Event)=>{
   const d=(event as CustomEvent<{characterId:string;reason:string}>).detail
   if(d?.characterId==='lateasia-monroe')setStatus('GLB load failed: '+d.reason)
  }
  const result=(event:Event)=>{
   const d=(event as CustomEvent<{characterId:string;role:AnimationRole;ok:boolean;reason?:string}>).detail
   if(d?.characterId==='lateasia-monroe')setStatus(d.ok?'Requested '+d.role+' animation — check character visually':'TEST FAILED: '+(d.reason||'Unknown error'))
  }
  window.addEventListener('tryamm:streetverse-character-animation-ready',ready)
  window.addEventListener('tryamm:streetverse-character-animation-error',error)
  window.addEventListener('tryamm:streetverse-character-animation-result',result)
  return ()=>{
   window.removeEventListener('tryamm:streetverse-character-animation-ready',ready)
   window.removeEventListener('tryamm:streetverse-character-animation-error',error)
   window.removeEventListener('tryamm:streetverse-character-animation-result',result)
  }
 },[])
 const test=(role:AnimationRole)=>{
  setStatus('Requesting '+role+'...')
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-animation',{detail:{characterId:'lateasia-monroe',role}}))
 }
 return <div aria-label="LaTeasia character animation test" style={{position:'absolute',left:12,bottom:300,zIndex:30,maxWidth:'min(280px,75vw)',color:'white'}}>
  <button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)} style={{...style,background:'#153f59',color:'white',border:'2px solid #8ae9ff'}}>TEST LATEASIA ANIMATIONS</button>
  {open&&<div style={{marginTop:6,padding:12,borderRadius:12,background:'rgba(8,20,35,.97)',border:'1px solid #8ae9ff'}}>
   <strong>LaTeasia • 3D Animation Test</strong>
   <div role="status" aria-live="polite" style={{margin:'10px 0',fontSize:13}}>{status}</div>
   {manifest&&<div style={{fontSize:12,marginBottom:8}}>Joints: {manifest.jointCount} • Available clips: {manifest.bindings.length}{manifest.warnings.length>0&&<div>Review: {manifest.warnings.join('; ')}</div>}</div>}
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
    {actions.map(action=><button type="button" key={action.role} disabled={!manifest?.bindings.some(b=>b.role===action.role)} onClick={()=>test(action.role)} style={{...style,opacity:manifest?.bindings.some(b=>b.role===action.role)?1:.45}}>{action.label}</button>)}
   </div>
   <button type="button" onClick={()=>setOpen(false)} style={{...style,marginTop:8,width:'100%'}}>CLOSE TEST</button>
   <small style={{display:'block',marginTop:8}}>These buttons test existing GLB clips. A successful request does not prove visual animation quality.</small>
  </div>}
 </div>
}
