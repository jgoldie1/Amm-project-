import { useEffect, useState, type CSSProperties } from 'react'

type Role='artist'|'host'|'dancer'|'producer'
type Cue='welcome'|'interview'|'performance'|'dance'|'commercial'|'finale'
type Receipt={cue:Cue;role:Role;at:string;message:string}
const KEY='tryamm:soul-ascension-mobile-rehearsal:v1'
const CUES:readonly {id:Cue;name:string;direction:string;rights:string}[]=[
 {id:'welcome',name:'Opening',direction:'Host introduces the original Soul Ascension showcase.',rights:'Host and performer approval required before publication'},
 {id:'interview',name:'Artist interview',direction:'Host invites the artist to introduce their original work.',rights:'Appearance releases and privacy review required'},
 {id:'performance',name:'Artist performance',direction:'Artist performs on the virtual stage; connect approved audio and rig only after validation.',rights:'Composition, master, sync and performance rights required'},
 {id:'dance',name:'Dance spotlight',direction:'Dancers perform in an original spotlight sequence with accessible motion controls.',rights:'Choreography, appearance and age permissions required'},
 {id:'commercial',name:'Commercial break',direction:'Producer queues a sponsor segment for later moderation and business approval.',rights:'Sponsor agreement, ad disclosures, rights and youth restrictions required'},
 {id:'finale',name:'Show finale',direction:'Host thanks the audience. Save a rehearsal receipt before any release.',rights:'Broadcast, participants and moderation must be approved'}
]
const ROLES:readonly Role[]=['artist','host','dancer','producer']
function initialReceipts():Receipt[]{try{const arr=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(arr)?arr.filter(x=>x&&typeof x.cue==='string').slice(-40):[]}catch{return[]}}
export default function SoulAscensionMobileStage({onClose,onOpenStudio,onOpenLive}:{onClose:()=>void;onOpenStudio:()=>void;onOpenLive:()=>void}){
 const [role,setRole]=useState<Role>('artist')
 const [cueIndex,setCueIndex]=useState(0)
 const [receipts,setReceipts]=useState<Receipt[]>(initialReceipts)
 const [notice,setNotice]=useState('Rehearsal only. Real character animation, music and broadcasting are not verified.')
 const [captions,setCaptions]=useState(true)
 const [motion,setMotion]=useState(false)
 const cue=CUES[cueIndex]
 const button:CSSProperties={minHeight:60,borderRadius:14,border:'1px solid #b59bdd',background:'#231d48',color:'#fff',fontSize:17,fontWeight:800,padding:'12px 15px',cursor:'pointer',touchAction:'manipulation'}
 const record=()=>{
  const next=[...receipts,{cue:cue.id,role,at:new Date().toISOString(),message:cue.direction}].slice(-40)
  setReceipts(next)
  try{localStorage.setItem(KEY,JSON.stringify(next));setNotice('Rehearsal cue saved locally. No video or broadcast was recorded.')}
  catch{setNotice('Browser storage blocked. Export the receipt before leaving.')}
 }
 const exportReport=()=>{
  const body={schema:'tryamm.soul-ascension-mobile-rehearsal.v1',createdAt:new Date().toISOString(),role,receipts,checks:{real3dRigVerified:false,licensedAudioVerified:false,livekitVerified:false,advertiserApproved:false,publicBroadcastApproved:false,ageAndReleaseChecksVerified:false},releaseReady:false}
  const blob=new Blob([JSON.stringify(body,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob),a=document.createElement('a')
  a.href=url;a.download='TRYAMM_Soul_Ascension_Mobile_Rehearsal.json';document.body.appendChild(a);a.click();a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose])
 return <section role="dialog" aria-modal="true" aria-label="Soul Ascension mobile roleplay rehearsal" style={{position:'fixed',inset:0,zIndex:2147483600,overflowY:'auto',background:'#0c0718',color:'#fff',padding:'max(16px,env(safe-area-inset-top)) 14px max(34px,env(safe-area-inset-bottom))'}}>
  <main style={{maxWidth:740,margin:'0 auto',display:'grid',gap:15}}>
   <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:14}}><div><div style={{fontSize:12,color:'#efc987',letterSpacing:2,fontWeight:900}}>ALL AMERICAN SHOWCASE</div><h1 style={{fontSize:29,margin:'6px 0'}}>Soul Ascension RP Stage</h1></div><button style={button} onClick={onClose}>Close</button></header>
   <p role="status" aria-live="polite" style={{border:'1px solid #906f50',background:'#302014',borderRadius:13,padding:14,lineHeight:1.55}}>{notice}</p>
   <div aria-label="Choose role" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>{ROLES.map(x=><button key={x} type="button" aria-pressed={role===x} style={{...button,background:role===x?'#5b397d':'#231d48'}} onClick={()=>{setRole(x);setNotice('Selected '+x+' rehearsal role.')}}>{x.toUpperCase()}</button>)}</div>
   <div aria-label="Rehearsal stage" style={{minHeight:220,position:'relative',overflow:'hidden',border:'2px solid #8668c7',borderRadius:20,background:'radial-gradient(ellipse at 50% 85%,#563c8e,#1d123a 55%,#070716)',display:'grid',placeItems:'center',textAlign:'center',padding:20}}>
    <div aria-hidden="true" style={{position:'absolute',left:0,right:0,top:18,height:8,background:'linear-gradient(90deg,#b56389,#e5c789,#69d1eb,#b56389)'}}/>
    <div style={{position:'relative'}}><div style={{fontSize:60}} aria-hidden="true">{role==='host'?'🎤':role==='artist'?'🎙️':role==='dancer'?'🕺':'🎬'}</div><strong style={{display:'block',fontSize:24,marginTop:8}}>{cue.name}</strong><p style={{maxWidth:480,margin:'9px auto',fontSize:16,lineHeight:1.6}}>{cue.direction}</p><span style={{fontSize:12,color:'#f6d6a4'}}>Stage cue {cueIndex+1} / {CUES.length} · Visual roleplay rehearsal, not a GLB animation</span></div>
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
    <button style={button} onClick={()=>setCueIndex(x=>Math.max(0,x-1))} disabled={cueIndex===0}>Previous cue</button>
    <button style={button} onClick={()=>{setCueIndex(x=>Math.min(CUES.length-1,x+1));setMotion(false)}} disabled={cueIndex===CUES.length-1}>Next cue</button>
    <button style={button} onClick={()=>{setMotion(v=>!v);setNotice('Movement cue '+(!motion?'on':'off')+'. Actual avatar skeletal animation still needs validation.')}} aria-pressed={motion}>{motion?'Stop motion cue':'Perform motion cue'}</button>
    <button style={button} onClick={()=>setCaptions(x=>!x)} aria-pressed={captions}>{captions?'Captions: ON':'Captions: OFF'}</button>
   </div>
   {captions&&<p style={{borderLeft:'4px solid #b38dd6',padding:'8px 12px',lineHeight:1.55,margin:0}} aria-live="polite">Caption / instruction: {cue.direction}</p>}
   <p style={{fontSize:13,color:'#efd8ac',lineHeight:1.5}}>Release gate: {cue.rights}. Audio, camera recording, character controls and sponsor playback must be integrated separately; this rehearsal does not simulate a licensed live show.</p>
   <button style={{...button,background:'#24485d'}} onClick={record}>SAVE REHEARSAL CUE</button>
   <button style={button} onClick={exportReport}>EXPORT ROLEPLAY TEST REPORT ({receipts.length})</button>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}><button style={button} onClick={onOpenStudio}>Existing Star Studio</button><button style={button} onClick={onOpenLive}>Existing LIVE Studio</button></div>
   <p style={{fontSize:12,color:'#ccc1dd',lineHeight:1.6}}>Original TRYAMM Soul Ascension experience. Not affiliated with or licensed as Soul Train. For minors, public publishing and live performance stay blocked pending age-appropriate safeguards, guardianship and releases.</p>
  </main>
 </section>
}
