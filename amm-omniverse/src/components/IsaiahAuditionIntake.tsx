import {useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'

const MAX_AUDITION_BYTES=60*1024*1024
const ACCEPTED_TYPES=new Set(['video/mp4','video/webm'])
const button:React.CSSProperties={minHeight:48,borderRadius:12,border:'1px solid #7de9ff',background:'#113448',color:'#fff',fontWeight:850,padding:'10px 14px',cursor:'pointer'}
export default function IsaiahAuditionIntake({onClose}:{onClose:()=>void}){
 const [title,setTitle]=useState('')
 const [talent,setTalent]=useState('music')
 const [file,setFile]=useState<File|null>(null)
 const [rights,setRights]=useState(false)
 const [adult,setAdult]=useState(false)
 const [busy,setBusy]=useState(false)
 const [result,setResult]=useState('')
 const [error,setError]=useState('')
 const submit=async()=>{
  if(busy)return
  setError('');setResult('')
  if(!file||!ACCEPTED_TYPES.has(file.type)||file.size<1||file.size>MAX_AUDITION_BYTES){setError('Choose a recorded MP4 or WebM audition under 60 MB.');return}
  if(!rights){setError('Confirm original or licensed media and permission from everyone recorded.');return}
  // Until a verified minor + guardian approval server workflow exists, the
  // first pilot only accepts adults. Do not collect minor auditions privately.
  if(!adult){setError('This pilot requires adult (18+) confirmation. Younger talent needs a verified guardian workflow first.');return}
  if(!title.trim()){setError('Enter a title for your audition.');return}
  setBusy(true)
  try{
   const token=await getAccessToken()
   if(!token)throw new Error('Sign in to your TRYAMM account before submitting.')
   const headers={'content-type':'application/json',Authorization:'Bearer '+token}
   const intent=await fetch('/api/media/upload-intent',{
    method:'POST',headers,body:JSON.stringify({
     fileName:file.name,contentType:file.type,sizeBytes:file.size,title:'Isaiah AI TV audition: '+title.trim().slice(0,100),
     caption:'Private Isaiah AI TV audition — pending creator permission and moderation review',
     composition:{source:'isaiah-ai-tv-audition',talentPath:talent,reviewOnly:true,claimedAdult:true,claimedRights:true}
    })
   })
   const data=await intent.json().catch(()=>({}))
   if(!intent.ok||!data?.upload?.url||!data?.media?.id)throw new Error(data.error||'Private audition upload could not be created.')
   const stored=await fetch(data.upload.url,{method:'PUT',headers:{'content-type':file.type},body:file})
   if(!stored.ok)throw new Error('Video upload failed. Save your original file and try again.')
   const verify=await fetch('/api/media/upload-complete',{method:'POST',headers,body:JSON.stringify({mediaId:data.media.id})})
   const checked=await verify.json().catch(()=>({}))
   if(!verify.ok)throw new Error(checked.error||'Uploaded file could not be verified.')
   // No public publish call here: audit and moderation/rights approval first.
   setResult('Private audition uploaded. Review is pending; no public TV listing, payout, or guaranteed selection was created. Save your reference: '+data.media.id)
  }catch(e){setError(e instanceof Error?e.message:'Audition upload failed. No broadcast was published.')}
  finally{setBusy(false)}
 }
 return <section aria-label="Isaiah AI TV private audition intake" style={{padding:14,border:'1px solid #91dcff',borderRadius:18,background:'#06111f',maxWidth:650,display:'grid',gap:10,color:'#fff'}}>
  <header style={{display:'flex',gap:10,justifyContent:'space-between',alignItems:'center'}}>
   <strong>🎤 WHO WANTS TO BE A STAR • AUDITION</strong>
   <button type="button" onClick={onClose} style={button}>CLOSE ×</button>
  </header>
  <p style={{fontSize:12,color:'#a9c7d8',lineHeight:1.5}}>Private 18+ upload pilot. Original/cleared footage only. Auditions involving minors require a separately verified guardian-consent process; please do not submit those videos here. Submission is free and does not guarantee placement.</p>
  <label>Audition title<input value={title} maxLength={100} onChange={e=>setTitle(e.target.value)} placeholder="My music performance" style={{width:'100%',padding:12,boxSizing:'border-box',marginTop:4}} /></label>
  <label>Talent category<select value={talent} onChange={e=>setTalent(e.target.value)} style={{display:'block',width:'100%',minHeight:46,marginTop:4}}>{['music','acting','dance','comedy','sports','gaming','fashion','film','podcast','creator','host'].map(x=><option key={x}>{x}</option>)}</select></label>
  <label>Audition file (MP4 or WebM, max 60 MB)<input type="file" accept="video/mp4,video/webm" onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'block',width:'100%',minHeight:44,marginTop:4}}/></label>
  <label style={{display:'flex',gap:8,alignItems:'start'}}><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/> I own or have permission for this performance, soundtrack and the people depicted.</label>
  <label style={{display:'flex',gap:8,alignItems:'start'}}><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/> I am 18 or older. The audition does not feature minors.</label>
  <button type="button" disabled={busy} onClick={()=>void submit()} style={{...button,opacity:busy?.6:1}}>{busy?'UPLOADING PRIVATE VIDEO…':'UPLOAD PRIVATE AUDITION'}</button>
  {result&&<p role="status" style={{color:'#8bffc2',overflowWrap:'anywhere'}}>{result}</p>}
  {error&&<p role="alert" style={{color:'#ffd1aa'}}>{error}</p>}
 </section>
}
