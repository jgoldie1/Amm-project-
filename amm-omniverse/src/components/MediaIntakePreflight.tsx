import {useState} from 'react'
import {inspectMediaIntake,verifyMediaSignature,createMediaIntakeReceipt,REQUIRED_MEDIA_DECLARATIONS} from '../lib/music/mediaIntakePreflight.mjs'
type IntakeKind='audio'|'video'
const button:React.CSSProperties={minHeight:54,borderRadius:12,border:'1px solid #8ed9f2',background:'#173449',color:'#fff',padding:'12px 16px',fontWeight:850,cursor:'pointer',touchAction:'manipulation'}
const field:React.CSSProperties={minHeight:48,width:'100%',boxSizing:'border-box',padding:10,borderRadius:9,border:'1px solid #628ca5',background:'#121e2b',color:'#fff',fontSize:16}
export default function MediaIntakePreflight(){
 const [kind,setKind]=useState<IntakeKind>('audio')
 const [selected,setSelected]=useState<File|null>(null)
 const [artist,setArtist]=useState('')
 const [title,setTitle]=useState('')
 const [checked,setChecked]=useState<string[]>([])
 const [status,setStatus]=useState('Select your own audio or music video for a private readiness check. No cloud upload occurs.')
 const [busy,setBusy]=useState(false)
 const [receipt,setReceipt]=useState<ReturnType<typeof createMediaIntakeReceipt>>(null)
 const choose=(file:File|undefined)=>{setSelected(file||null);setReceipt(null);setStatus(file?'Selected '+file.name+' for local inspection.':'Choose a recording to inspect.')}
 const inspect=async()=>{
  if(!selected){setStatus('Choose a recording first.');return}
  const info=inspectMediaIntake({name:selected.name,size:selected.size,type:selected.type,kind})
  if(!info.ok){setStatus(info.issues.join(' · '));return}
  if(REQUIRED_MEDIA_DECLARATIONS.some(d=>!checked.includes(d.id))){setStatus('Confirm all three creator declarations before preparing the review receipt.');return}
  if(typeof crypto==='undefined'||!crypto.subtle){setStatus('Secure browser hashing unavailable. Use HTTPS and try again.');return}
  setBusy(true);setReceipt(null)
  try{
   const first=new Uint8Array(await selected.slice(0,32).arrayBuffer())
   if(!verifyMediaSignature(first,kind,info.extension)){setStatus('File signature does not match its claimed format. No review receipt created.');return}
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await selected.arrayBuffer()))).map(x=>x.toString(16).padStart(2,'0')).join('')
   const ready=createMediaIntakeReceipt({name:selected.name,size:selected.size,kind,sha256:hash,artist,title,declarations:checked})
   if(!ready){setStatus('Enter title and artist, then confirm creator declarations.');return}
   setReceipt(ready);setStatus('Local checksum and format check completed. Still awaiting independent human rights and release review.')
  }catch{setStatus('Could not inspect this file locally. It has not been uploaded.')}
  finally{setBusy(false)}
 }
 const exportReceipt=()=>{
  if(!receipt)return
  const blob=new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='musicverse-media-intake-review.json';a.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
  setStatus('Downloaded review receipt. This does not store the media or authorize distribution.')
 }
 return <main aria-label="Private audio and video intake checks" style={{maxWidth:850,margin:'0 auto',padding:'18px 14px 90px',color:'#fff'}}>
  <div style={{fontSize:12,fontWeight:850,color:'#8fe5ff'}}>ALL AMERICAN RECORDS · MUSICVERSE INTAKE</div>
  <h2>🎛 One-Button Media Readiness Check</h2>
  <p style={{color:'#cadce9',lineHeight:1.6}}>Check an original WAV, MP3, FLAC, M4A, OGG, MP4, MOV or WebM recording before a rights reviewer receives it. The file stays on this device. This is not an upload, antivirus scan, streaming approval, or distribution license.</p>
  <div style={{display:'flex',gap:9,marginBottom:14}}>
   <button style={{...button,flex:1}} aria-pressed={kind==='audio'} onClick={()=>{setKind('audio');choose(undefined)}}>🎵 AUDIO</button>
   <button style={{...button,flex:1}} aria-pressed={kind==='video'} onClick={()=>{setKind('video');choose(undefined)}}>🎬 VIDEO</button>
  </div>
  <label style={{display:'block',marginBottom:12}}>Choose local {kind} file
   <input aria-label="Choose music media file" key={kind} type="file" accept={kind==='audio'?'.wav,.mp3,.flac,.m4a,.ogg,audio/*':'.mp4,.mov,.webm,video/*'} onChange={e=>choose(e.currentTarget.files?.[0])} style={{...field,marginTop:5,paddingTop:12}}/>
  </label>
  <label style={{display:'block',marginBottom:12}}>Artist or creator name<input style={field} aria-label="Media rights creator" maxLength={120} value={artist} onChange={e=>setArtist(e.target.value)}/></label>
  <label style={{display:'block',marginBottom:12}}>Original song or video title<input style={field} aria-label="Media rights work title" maxLength={120} value={title} onChange={e=>setTitle(e.target.value)}/></label>
  <section aria-label="Artist permissions and declarations" style={{padding:14,border:'1px solid #50718a',borderRadius:12,marginBottom:12}}>
   <strong>Creator declarations (not proof of rights)</strong>
   {REQUIRED_MEDIA_DECLARATIONS.map(item=><label key={item.id} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',lineHeight:1.45}}>
    <input style={{width:25,height:25,flexShrink:0}} type="checkbox" checked={checked.includes(item.id)} onChange={e=>{setReceipt(null);setChecked(v=>e.target.checked?[...v,item.id]:v.filter(x=>x!==item.id))}}/>
    {item.label}
   </label>)}
  </section>
  <button style={{...button,width:'100%',background:'#235247'}} disabled={busy} onClick={()=>void inspect()}>{busy?'CHECKING FILE LOCALLY…':'✓ RUN ONE-BUTTON MEDIA CHECK'}</button>
  {receipt&&<section style={{padding:12,border:'1px solid #4e8f6e',borderRadius:12,marginTop:12}}>
   <strong>Local checksum recorded · Human review pending</strong>
   <p style={{wordBreak:'break-all',fontSize:12}}>SHA-256: {receipt.sha256}</p>
   <p style={{color:'#fedfa7',fontSize:12}}>No media upload · No streaming approval · No public release</p>
   <button style={{...button,width:'100%'}} onClick={exportReceipt}>⬇ EXPORT PRIVATE INTAKE RECEIPT</button>
  </section>}
  <p role="status" aria-live="polite" style={{color:'#fbdba4',fontSize:13}}>{status}</p>
 </main>
}
