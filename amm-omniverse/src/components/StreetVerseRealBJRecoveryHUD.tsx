import {useEffect,useState} from 'react'
import {importStreetVerseCharacterFiles,readLocalCastAsset} from '../runtime/StreetVerseCharacterLocalRecovery'

const button:React.CSSProperties={minHeight:54,padding:'9px 12px',border:'2px solid #adf6d3',borderRadius:12,background:'#135640',color:'#fff',font:'900 13px system-ui',touchAction:'manipulation'}
type Mounted={version?:string;actual3DModelMounted?:boolean;skeletonAnimationCount?:number}
export default function StreetVerseRealBJRecoveryHUD(){
 const [expanded,setExpanded]=useState(false)
 const [status,setStatus]=useState('Real BJ V15 is not yet verified on this device.')
 const [mounted,setMounted]=useState(false)
 const [busy,setBusy]=useState(false)
 useEffect(()=>{
  const onMounted=(e:Event)=>{
   const d=(e as CustomEvent<Mounted>).detail||{}
   if(d.version==='V15'&&d.actual3DModelMounted){
    setMounted(true);setStatus('BJ V15 is mounted in the active game with '+(d.skeletonAnimationCount||0)+' animation clips. Check his appearance on screen.')
   }else{setMounted(false);setStatus('Only the fallback BJ character is mounted. Restore the original BJ V15 GLB.')}
  }
  const onFailure=()=>{setMounted(false);setStatus('Original BJ could not load. Restore his model from the saved ZIP or GLB.')}
  window.addEventListener('tryamm:streetverse-bj-hero-mounted',onMounted)
  window.addEventListener('tryamm:bj-meshy-v6-unavailable',onFailure)
  return()=>{window.removeEventListener('tryamm:streetverse-bj-hero-mounted',onMounted);window.removeEventListener('tryamm:bj-meshy-v6-unavailable',onFailure)}
 },[])
 const requestReload=async()=>{
  setBusy(true)
  try{
   const stored=await readLocalCastAsset('bj-stubbs')
   if(!stored){setStatus('BJ V15 is not stored on this device. Select the recovered ZIP or original GLB below.');setExpanded(true)}
   else{setStatus('BJ model found on device. Replacing the in-game player…');window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-v15-preview',{detail:{source:'bj-recovery-button'}}))}
  }catch{setStatus('Phone storage unavailable. Use the original BJ GLB file selector.')}
  finally{setBusy(false)}
 }
 return <aside aria-label="Restore original BJ character" style={{position:'fixed',left:'max(8px,env(safe-area-inset-left))',top:'calc(env(safe-area-inset-top) + 8px)',zIndex:49010,maxWidth:'min(94vw,370px)',fontFamily:'system-ui',color:'#fff'}}>
   <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)} style={{...button,minWidth:148}}>{mounted?'✓ REAL BJ V15':'🎭 RESTORE REAL BJ'}</button>
   {expanded&&<section style={{background:'#071725f5',border:'2px solid #a3f4d5',padding:12,borderRadius:14,display:'grid',gap:10,maxHeight:'65dvh',overflowY:'auto',marginTop:7}}>
     <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'space-between'}}>
       <strong>Original BJ Stubbs • V15</strong>
       <button type="button" aria-label="Close original BJ restoration panel" onClick={()=>setExpanded(false)} style={{...button,minWidth:76,background:'#802b2b',borderColor:'#fff'}}>✕ CLOSE</button>
     </div>
     <p role="status" aria-live="polite" style={{margin:0,fontSize:13}}>{status}</p>
     <button type="button" disabled={busy} onClick={()=>{void requestReload()}} style={button}>{busy?'CHECKING…':'LOAD BJ INTO THE GAME'}</button>
     <label style={{fontWeight:800,fontSize:13}}>Or select the recovered 3-character ZIP / BJ V15 GLB
      <input type="file" accept=".zip,.glb,application/zip,model/gltf-binary" aria-label="Select original BJ model or recovered character ZIP" style={{display:'block',width:'100%',maxWidth:330,minHeight:50,marginTop:7}} disabled={busy}
       onChange={async e=>{
        const files=e.target.files
        if(!files?.length)return
        setBusy(true);setStatus('Saving original BJ model to this device…')
        try{
         const results=await importStreetVerseCharacterFiles(files)
         const bj=results.find(x=>x.id==='bj-stubbs'&&x.stored)
         if(!bj)throw Error('The selected file does not contain the original BJ V15 GLB.')
         setStatus('Original BJ V15 saved. Loading into the active player now…')
         window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-v15-preview',{detail:{source:'bj-recovery-direct-import'}}))
        }catch(error){setStatus(String(error))}
        finally{setBusy(false);e.target.value=''}
       }}/>
     </label>
     <small>Library backup: TRYAMM / StreetVerse / Character_Backups. This loads BJ into gameplay on this device; original GLB publication for all players is separate.</small>
   </section>}
 </aside>
}
