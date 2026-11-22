import {useEffect,useState} from 'react'
import {importStreetVerseCharacterFiles} from '../runtime/StreetVerseCharacterLocalRecovery'

type Character='bj'|'jacobie'|'lateasia'
type Evidence={id:string;name:string;loaded:boolean;clips:number;source?:string;movement?:boolean;textureVerified?:boolean;diagnosticAppearance?:boolean}

const LABELS:Record<Character,string>={bj:'BJ',jacobie:'JACOBIE',lateasia:'LATEASIA'}

function targetUrl(character:Character){
 const base='/streetverse?core=1&graphics=character'
 if(character==='bj')return base+'&bj=v15&character=bj'
 if(character==='jacobie')return base+'&character=jacobie&world=greenville'
 return base+'&character=lateasia'
}

export default function StreetVerseCharacterSwitchHUD(){
 const params=new URLSearchParams(window.location.search)
 const initial:Character=params.get('character')?.startsWith('jacobie')?'jacobie':params.get('character')?.startsWith('lateasia')?'lateasia':'bj'
 const [open,setOpen]=useState(false)
 const [active]=useState<Character>(initial)
 const [evidence,setEvidence]=useState<Record<string,Evidence>>({})
 const [moved,setMoved]=useState(false)
 const [loadIssue,setLoadIssue]=useState('')
 const [importing,setImporting]=useState(false)
 const [importNotice,setImportNotice]=useState('')
 const [lastLoadStatus,setLastLoadStatus]=useState<'waiting'|'mounted'|'missing'>('waiting')

 useEffect(()=>{
   const onRecovered=(event:Event)=>{
     const d=(event as CustomEvent<any>).detail||{}
     setEvidence(v=>({...v,[d.id]:{id:d.id,name:d.name||d.id,loaded:d.mounted===true&&d.active3DMesh===true,clips:Array.isArray(d.clips)?d.clips.length:Number(d.clipCount||0),source:d.source,textureVerified:d.textureVerified===true,diagnosticAppearance:d.diagnosticAppearance===true}}))
   }
   const onMounted=(event:Event)=>{const d=(event as CustomEvent<{characterId?:string}>).detail||{};if(d.characterId===activeId){setLastLoadStatus('mounted');setLoadIssue('')}}
   const onMissing=(event:Event)=>{const d=(event as CustomEvent<{characterId?:string;reason?:string}>).detail||{};if(d.characterId===activeId){setLastLoadStatus('missing');setLoadIssue(d.reason||'Original model not available');setOpen(true)}}
   const onBJ=(event:Event)=>{
     const d=(event as CustomEvent).detail
     if(!d?.actual3DModelMounted||d.version!=='V15')return
     setEvidence(v=>({...v,['bj-stubbs']:{id:'bj-stubbs',name:'BJ Stubbs',loaded:true,clips:Number(d.skeletonAnimationCount||0),source:d.source}}))
   }
   const onMove=(event:Event)=>{
     const d=(event as CustomEvent).detail
     if(d?.up||d?.down||d?.left||d?.right||Math.abs(d?.move?.x||0)>.05||Math.abs(d?.move?.y||0)>.05)setMoved(true)
   }
   const onProblem=(event:Event)=>{const d=(event as CustomEvent<{characterId?:string;reason?:string}>).detail||{};if(d.characterId===activeId){setLastLoadStatus('missing');setLoadIssue(d.reason||'GLB failed to load');setOpen(true)}}
   addEventListener('tryamm:streetverse-recovered-playable-mounted',onRecovered)
   addEventListener('tryamm:streetverse-bj-hero-mounted',onBJ)
   addEventListener('tryamm:streetverse-recovered-playable-mounted',onMounted)
   addEventListener('tryamm:streetverse-recovered-playable-missing',onMissing)
   addEventListener('tryamm:streetverse-recovered-playable-error',onProblem)
   addEventListener('tryamm:streetverse-mobile-movement',onMove)
   addEventListener('tryamm:streetverse-world-input',onMove)
   return()=>{removeEventListener('tryamm:streetverse-recovered-playable-mounted',onRecovered);removeEventListener('tryamm:streetverse-bj-hero-mounted',onBJ);removeEventListener('tryamm:streetverse-recovered-playable-mounted',onMounted);removeEventListener('tryamm:streetverse-recovered-playable-missing',onMissing);removeEventListener('tryamm:streetverse-recovered-playable-error',onProblem);removeEventListener('tryamm:streetverse-mobile-movement',onMove);removeEventListener('tryamm:streetverse-world-input',onMove)}
 },[])

 const activeId=active==='bj'?'bj-stubbs':active==='jacobie'?'jacobie-stubbs':'lateasia-monroe'
 const activeEvidence=evidence[activeId]
 const exportReport=()=>{
   const report={
     generatedAt:new Date().toISOString(),
     route:location.href,
     activeCharacter:activeId,
     activeEvidence:activeEvidence||null,
     movementInputObserved:moved,
     verdict:activeEvidence?.loaded&&moved?'INPUT_AND_RIG_EVIDENCE_CAPTURED':'INCOMPLETE_DEVICE_ACCEPTANCE',
     note:'This report records browser runtime evidence. Visual likeness and final device acceptance still require human review on the target device.',
   }
   const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='StreetVerse_Character_Acceptance_'+activeId+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 return <aside style={{position:'fixed',left:'max(10px,env(safe-area-inset-left))',top:'max(8px,env(safe-area-inset-top))',zIndex:2147483646,fontFamily:'system-ui,sans-serif'}}>
   <button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)} style={{minHeight:48,padding:'8px 12px',borderRadius:14,border:'2px solid #c59cff',background:'#16102aee',color:'#fff',fontWeight:950}}>Switch character · {LABELS[active]}</button>
   {open&&<div style={{maxHeight:'min(65vh, calc(100dvh - 210px))',overflowY:'auto',marginTop:7,width:260,maxWidth:'calc(100vw - 20px)',display:'grid',gap:7,padding:10,borderRadius:14,border:'1px solid #694a98',background:'rgba(7,7,18,.96)',color:'#fff'}}>
     <strong>PLAYABLE CHARACTER</strong>
     {(['bj','jacobie','lateasia'] as Character[]).map(id=><a key={id} href={targetUrl(id)} style={{minHeight:44,display:'grid',placeItems:'center',borderRadius:10,border:id===active?'1px solid #fff':'1px solid #37415c',background:id===active?'#4d2f79':'#111827',color:'#fff',fontWeight:900,textDecoration:'none'}}>PLAY AS {LABELS[id]}</a>)}
     {active!=='bj'&&<><div role="status" style={{fontSize:12,fontWeight:900,color:lastLoadStatus==='mounted'?'#9af8c3':'#ffcf8d'}}>Original 3D model: {lastLoadStatus.toUpperCase()}{loadIssue?' • '+loadIssue:''}</div><button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-retry',{detail:{characterId:activeId,source:'character-switch-ui'}}))} style={{minHeight:50,borderRadius:10,border:'1px solid #d4a8ff',background:'#3f2765',color:'#fff',fontWeight:900}}>RELOAD ORIGINAL {LABELS[active]} GLB</button></>}
     {active==='lateasia'&&activeEvidence?.diagnosticAppearance&&<div role="alert" style={{padding:10,borderRadius:10,border:'2px solid #ffbb77',background:'#542b17',fontWeight:900,fontSize:13}}>WRONG APPEARANCE • The old untextured LaTeasia diagnostic model loaded. Import LaTeasia_Monroe_Textured_Seven_Motion_Recovery.glb below to replace it on this device. Do not accept this as the finished character.</div>}
     {active!=='bj'&&<label style={{display:'grid',gap:6,padding:8,border:'1px solid #9bd5df',borderRadius:10,background:'#123649',fontSize:13,fontWeight:900}}>
       {active==='lateasia'?'IMPORT CORRECTED COLOR LATEASIA GLB':'IMPORT ORIGINAL '+LABELS[active]+' GLB / ZIP'}
       <input aria-label={'Choose original '+LABELS[active]+' model ZIP or GLB'} type="file" accept=".glb,.zip,model/gltf-binary" disabled={importing} onChange={async event=>{
         const files=event.target.files
         if(!files?.length)return
         setImporting(true);setImportNotice('Checking and saving original GLB…')
         try{
           const results=await importStreetVerseCharacterFiles(files)
           const applied=results.find(item=>item.id===activeId&&item.stored)
           if(!applied){setImportNotice('No matching original '+LABELS[active]+' model was found in the selected file.');return}
           try{localStorage.setItem('tryamm:streetverse:cast-source:'+activeId,'device-local')}catch{}
           setImportNotice(applied.name+' imported and verified on this device. Restarting model…')
           window.location.reload()
         }catch(error){setImportNotice('Import failed: '+String(error))}
         finally{setImporting(false);event.target.value=''}
       }} style={{minHeight:48,width:'100%',fontSize:12,color:'#fff'}}/>
     </label>}
     {active!=='bj'&&<button type="button" onClick={()=>{try{localStorage.removeItem('tryamm:streetverse:cast-source:'+activeId)}catch{};window.location.reload()}} style={{minHeight:48,borderRadius:9,border:'1px solid #a5d7b2',background:'#194a34',color:'#fff',fontWeight:900}}>RESTORE HOSTED LIBRARY ORIGINAL</button>}
     {importNotice&&<div role="status" style={{fontSize:12,color:'#e9d9a0'}}>{importNotice}</div>}
     <div style={{fontSize:11,lineHeight:1.35,color:'#cbd1dd'}}>
       Rig: {activeEvidence?.loaded?'LOADED':'WAITING'}<br/>
       Clips: {activeEvidence?.clips??'—'}<br/>
       Source: {activeEvidence?.source??'—'}<br/>       Textured model: {activeEvidence?.textureVerified?'YES — SOURCE TEXTURES':activeEvidence?.diagnosticAppearance?'NO — DIAGNOSTIC':'UNVERIFIED'}<br/>
       Movement input: {moved?'SEEN':'NOT YET'}
     </div>
     <a href="/streetverse-character-asset-check.html" target="_blank" rel="noopener noreferrer" style={{minHeight:55,display:"grid",placeItems:"center",borderRadius:10,border:"1px solid #ffe58b",background:"#5d4621",color:"#fff",fontWeight:900,textAlign:"center",textDecoration:"none"}}>CHECK ORIGINAL GLB FILES — ONE PUSH</a>
     <button type="button" onClick={exportReport} style={{minHeight:44,borderRadius:10,border:'1px solid #75e7b0',background:'#123d2a',color:'#fff',fontWeight:900}}>EXPORT ONE-PUSH REPORT</button>
   </div>}
 </aside>
}
