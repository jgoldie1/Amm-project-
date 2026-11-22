import {useEffect,useState} from 'react'
import {CREATOR_CHANNELS,CREATOR_HANDOFF_EVENT,createCreatorPacket,saveCreatorPacket,readCreatorPacket,creatorReleaseGates,readReelCaptureMetadata,readLastMissionStory,type ReelCaptureMetadata,type CreatorPacket} from '../foundation/tryammCreatorWorldBridge.js'
const button:React.CSSProperties={minHeight:60,border:'2px solid #77e5ff',borderRadius:13,padding:'12px 16px',fontSize:16,fontWeight:850,color:'white',background:'#174660',cursor:'pointer',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center'}
export default function TryammCreatorWorldBridge(){
 const [kind,setKind]=useState('business-spotlight')
 const [title,setTitle]=useState('StreetVerse Chicago — Business Spotlight')
 const [description,setDescription]=useState('An original Chicago neighborhood story becomes a gameplay mission, a short HoloReel, an OmniBox episode segment, and a proposed Isaiah AI TV feature.')
 const [businessName,setBusinessName]=useState('')
 const [templateId,setTemplateId]=useState('')
 const [missionId,setMissionId]=useState('ad1')
 const [packet,setPacket]=useState<CreatorPacket|null>(null)
 const [lastReel,setLastReel]=useState<ReelCaptureMetadata|null>(null)
 const [message,setMessage]=useState('Choose a company type from your preserved website catalog, or begin with a StreetVerse mission. This creates an editable metadata packet, not a video or published website.')
 useEffect(()=>{try{setPacket(readCreatorPacket(localStorage));setLastReel(readReelCaptureMetadata(localStorage))}catch{}},[])
 const save=()=>{
  const next=createCreatorPacket({kind,title,description,businessName,templateId,missionId,fileName:lastReel?.fileName,mimeType:lastReel?.mimeType,durationMs:lastReel?.durationMs})
  try{saveCreatorPacket(localStorage,next);setPacket(next);window.dispatchEvent(new CustomEvent(CREATOR_HANDOFF_EVENT,{detail:next}));setMessage('Creator packet saved on this device. OmniBox can read this handoff. No content has been uploaded or published.')}catch{setMessage('Local storage unavailable. Download the JSON packet instead.')}
 }
 const exportPacket=()=>{
  const data=packet||createCreatorPacket({kind,title,description,businessName,templateId,missionId,fileName:lastReel?.fileName,mimeType:lastReel?.mimeType,durationMs:lastReel?.durationMs})
  const url=URL.createObjectURL(new Blob([JSON.stringify({...data,releaseGates:creatorReleaseGates(data)},null,2)],{type:'application/json'}))
  const a=document.createElement('a');a.href=url;a.download='TRYAMM_Living_World_Creator_Packet.json';document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1500)
 }
 const input:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:54,borderRadius:10,border:'1px solid #519db4',background:'#0a2434',color:'white',padding:12,fontSize:16}
 return <main style={{minHeight:'100vh',background:'linear-gradient(#0a1b31,#040910)',color:'white',fontFamily:'system-ui',padding:'18px 14px 70px'}}>
  <section style={{maxWidth:1040,margin:'auto',display:'grid',gap:16}}>
   <header><a href="/" style={{color:'#9df0ff',fontSize:16}}>← TRYAMM ONE WORLD</a><h1 style={{fontSize:'clamp(27px,6vw,45px)',marginBottom:8}}>Living World Creator Bridge</h1><p style={{fontSize:17,lineHeight:1.5}}>Connect a business website, StreetVerse mission, playable world, HoloReel, OmniBox and Isaiah AI TV through one original TRYAMM story.</p></header>
   <section style={{padding:14,border:'1px solid #7ba4bf',borderRadius:16,background:'#12273b',display:'grid',gap:12}}>
    <h2 style={{margin:0}}>Start a creator project</h2>
    <label>Project type<select value={kind} onChange={e=>setKind(e.target.value)} style={input}>{['business-spotlight','mission','show','training','sports','music','event'].map(x=><option key={x} value={x}>{x.replace(/-/g,' ').toUpperCase()}</option>)}</select></label>
    <label>Story / video title<input style={input} value={title} maxLength={100} onChange={e=>setTitle(e.target.value)}/></label>
    <label>Business name (optional)<input style={input} value={businessName} maxLength={120} onChange={e=>setBusinessName(e.target.value)}/></label>
    <label>Selected company-type template ID (optional)<input style={input} value={templateId} maxLength={100} onChange={e=>setTemplateId(e.target.value)} placeholder="Use your original 111-template catalog ID"/></label>
    <label>StreetVerse mission ID<input style={input} value={missionId} maxLength={80} onChange={e=>setMissionId(e.target.value)}/></label>
    <label>Project description<textarea style={{...input,minHeight:115}} value={description} maxLength={700} onChange={e=>setDescription(e.target.value)}/></label>
    <div style={{padding:12,border:'1px solid #4b8b8b',borderRadius:12}}>
      <strong>Recent HoloReel recording</strong><p>{lastReel?lastReel.fileName+' • '+Math.round(lastReel.durationMs/1000)+'s • '+lastReel.mimeType:'No capture metadata on this device yet.'}</p>
      <p style={{fontSize:13,color:'#beddd9'}}>Only clip metadata is copied into the story packet. The actual media file must be downloaded, uploaded and approved separately.</p>
      <button type="button" style={{...button,marginBottom:10}} onClick={()=>{const last=readLastMissionStory(localStorage);if(last){setMissionId(last.missionId);setMessage('Loaded the last completed local StreetVerse mission: '+last.missionId+'. Save the creator packet to carry this into OmniBox.')}else setMessage('No completed StreetVerse mission saved on this device yet.')}}>IMPORT LAST COMPLETED MISSION</button>
      <button type="button" style={button} onClick={()=>{setLastReel(readReelCaptureMetadata(localStorage));setMessage('HoloReel capture metadata checked. Record a reel in StreetVerse if none is found.')}}>REFRESH LAST HOLOREEL</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
     <button type="button" style={{...button,background:'#155c48'}} onClick={save}>SAVE CREATOR HANDOFF</button>
     <button type="button" style={button} onClick={exportPacket}>DOWNLOAD JSON PACKET</button>
    </div>
    <p role="status" aria-live="polite" style={{color:'#ffdd9c',lineHeight:1.6}}>{message}</p>
    {packet&&<p style={{color:'#b1f0c9',fontSize:14}}>Saved locally: {packet.title} • {packet.kind} • {packet.status} • No media attached</p>}
   </section>
   <section aria-label="TRYAMM creator workflow routes">
    <h2>Use your existing TRYAMM systems</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))',gap:12}}>
     {CREATOR_CHANNELS.map(x=><article key={x.id} style={{border:'1px solid #315b78',borderRadius:15,background:'#102235',padding:14}}>
      <h3 style={{margin:'0 0 7px',fontSize:19}}>{x.title}</h3>
      <p style={{fontSize:14,color:'#c2d8e7',lineHeight:1.5}}>{x.purpose}</p>
      <a href={x.path} style={button}>OPEN {x.title.toUpperCase()}</a>
     </article>)}
    </div>
   </section>
   <section style={{padding:14,border:'1px solid #7c647a',borderRadius:15}}>
    <h2 style={{marginTop:0}}>Immersive publishing readiness</h2>
    <p style={{lineHeight:1.5}}>A StreetVerse HoloReel can be captured on supported devices and exported. OmniBox currently plans scenes. Isaiah AI TV is a programming surface. A saved metadata packet is not a video upload, 3D scene or public broadcast.</p>
    <p style={{lineHeight:1.5}}>Before an immersive AR/VR episode goes public: verify participant consent and rights, upload and transcode the media, prepare depth/360/spatial assets, pass headset performance and accessibility tests, complete moderation, and require a human approval to publish.</p>
    <p style={{fontSize:14,color:'#c2d8e7'}}>The original 111 company-type catalog is preserved as an inventory goal—not represented as 111 published sites or licensed franchises. Check the actual template selector before promising a customer delivery.</p>
   </section>
  </section>
 </main>
}
