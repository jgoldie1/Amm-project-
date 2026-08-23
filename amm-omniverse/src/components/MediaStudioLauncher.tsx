import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { getAccessToken } from '../services/supabaseClient'

type Destination='reel'|'omnibox'|'all-american-network'|'servants-of-christ-network'|'creator-profile'
type Draft={id:string;title:string;caption:string;destinations:Destination[];createdAt:string;source:string;status:'draft'|'queued';mediaId?:string;jobId?:string}

const DRAFT_KEY='tryamm.media-studio.drafts.v2'
const DESTINATIONS:{id:Destination;label:string}[]=[
  {id:'reel',label:'TRYAMM Reels'},
  {id:'omnibox',label:'Omni Box'},
  {id:'all-american-network',label:'All American Network'},
  {id:'servants-of-christ-network',label:'Servants of Christ Network'},
  {id:'creator-profile',label:'Creator Profile'},
]
const API=(import.meta as any).env?.VITE_API_URL??''

function readDrafts():Draft[]{try{return JSON.parse(localStorage.getItem(DRAFT_KEY)||'[]')}catch{return []}}
async function apiJson(path:string,token:string,options:RequestInit={}){
  const response=await fetch(`${API}${path}`,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...(options.headers||{})}})
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(data?.error||`TRYAMM media request failed (${response.status})`)
  return data
}

export default function MediaStudioLauncher(){
  const [open,setOpen]=useState(false)
  const [tab,setTab]=useState<'capture'|'compose'|'green'|'publish'>('capture')
  const [title,setTitle]=useState('StreetVerse Highlight')
  const [caption,setCaption]=useState('First Drop • Made inside TRYAMM')
  const [destinations,setDestinations]=useState<Destination[]>(['reel','omnibox','creator-profile'])
  const [mediaUrl,setMediaUrl]=useState('')
  const [mediaKind,setMediaKind]=useState<'video'|'image'>('video')
  const [mediaBlob,setMediaBlob]=useState<Blob|null>(null)
  const [mediaFileName,setMediaFileName]=useState('streetverse-highlight.webm')
  const [recording,setRecording]=useState(false)
  const [publishing,setPublishing]=useState(false)
  const [message,setMessage]=useState('Capture gameplay, upload media, add effects, then publish to production storage.')
  const [chromaEnabled,setChromaEnabled]=useState(false)
  const [threshold,setThreshold]=useState(90)
  const [background,setBackground]=useState<'city'|'gold'|'void'>('city')
  const [sticker,setSticker]=useState('🔥')
  const [drafts,setDrafts]=useState<Draft[]>(()=>readDrafts())
  const recorderRef=useRef<MediaRecorder|null>(null)
  const chunksRef=useRef<Blob[]>([])
  const sourceVideoRef=useRef<HTMLVideoElement|null>(null)
  const canvasRef=useRef<HTMLCanvasElement|null>(null)

  useEffect(()=>{
    const openStudio=(event:Event)=>{const detail=(event as CustomEvent<{source?:string}>).detail;if(detail?.source==='streetverse'){setTitle('StreetVerse: First Drop Highlight');setCaption('Mission moment captured in StreetVerse • #TRYAMM #StreetVerse')}setOpen(true);setTab('capture')}
    ;(window as any).__showMediaStudio=()=>setOpen(true)
    window.addEventListener('tryamm:media-studio-open',openStudio)
    return()=>{window.removeEventListener('tryamm:media-studio-open',openStudio);delete (window as any).__showMediaStudio}
  },[])

  useEffect(()=>{
    if(!chromaEnabled||!mediaUrl||mediaKind!=='video')return
    let raf=0
    const draw=()=>{const video=sourceVideoRef.current,canvas=canvasRef.current;if(video&&canvas&&video.readyState>=2){const ctx=canvas.getContext('2d',{willReadFrequently:true});if(ctx){const w=canvas.width=640,h=canvas.height=360;ctx.drawImage(video,0,0,w,h);const frame=ctx.getImageData(0,0,w,h),d=frame.data;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(g-Math.max(r,b)>threshold)d[i+3]=0}ctx.putImageData(frame,0,0)}}raf=requestAnimationFrame(draw)}
    raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf)
  },[chromaEnabled,mediaUrl,mediaKind,threshold])

  const bgStyle=useMemo(()=>background==='city'?'linear-gradient(135deg,#061e2c,#17233e 55%,#321532)':background==='gold'?'radial-gradient(circle at 50% 25%,#ffe58a,#8a5b11 50%,#160d03)':'radial-gradient(circle at 50% 20%,#182a3b,#02050b 65%)',[background])

  function loadBlob(blob:Blob,name:string){
    if(mediaUrl.startsWith('blob:'))URL.revokeObjectURL(mediaUrl)
    const url=URL.createObjectURL(blob);setMediaBlob(blob);setMediaFileName(name);setMediaUrl(url);setMediaKind(blob.type.startsWith('image/')?'image':'video');setTab('compose')
  }

  async function startCapture(){
    try{
      if(!navigator.mediaDevices?.getDisplayMedia||typeof MediaRecorder==='undefined'){setMessage('Screen capture is not supported in this browser. Upload a clip instead.');return}
      const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true}),recorder=new MediaRecorder(stream)
      recorderRef.current=recorder;chunksRef.current=[]
      recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)}
      recorder.onstop=()=>{const type=recorder.mimeType||'video/webm',blob=new Blob(chunksRef.current,{type});loadBlob(blob,`streetverse-${Date.now()}.webm`);setRecording(false);stream.getTracks().forEach(t=>t.stop());setMessage('Capture ready. Compose it, then publish directly to TRYAMM production storage.')}
      stream.getVideoTracks()[0]?.addEventListener('ended',()=>{if(recorder.state!=='inactive')recorder.stop()});recorder.start(500);setRecording(true);setMessage('Recording your selected screen/window. Stop when the highlight is finished.')
    }catch(error){setMessage(error instanceof Error?error.message:'Capture was cancelled.')}
  }
  function stopCapture(){const recorder=recorderRef.current;if(recorder&&recorder.state!=='inactive')recorder.stop()}
  function uploadMedia(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];if(!file)return;loadBlob(file,file.name);setMessage(`${file.name} loaded into Reel Composer.`)}
  function toggleDestination(id:Destination){setDestinations(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id])}

  async function publishProduction(){
    if(!mediaBlob){setMessage('Add or capture media before publishing.');return}
    if(!destinations.length){setMessage('Choose at least one publishing destination.');return}
    setPublishing(true)
    try{
      const token=await getAccessToken();if(!token)throw new Error('Secure cloud sign-in is required before a Reel or Omni Box release can be published.')
      setMessage('1/4 Creating secure production upload…')
      const intent=await apiJson('/api/media/upload-intent',token,{method:'POST',body:JSON.stringify({fileName:mediaFileName,contentType:mediaBlob.type||'video/webm',sizeBytes:mediaBlob.size,title:title.trim()||'Untitled TRYAMM Media',caption,composition:{chromaEnabled,threshold,background,sticker}})})
      setMessage('2/4 Uploading media to private TRYAMM creator storage…')
      const uploadResponse=await fetch(intent.upload.url,{method:'PUT',headers:{'Content-Type':mediaBlob.type||'video/webm','cache-control':'3600','x-upsert':'false'},body:mediaBlob})
      if(!uploadResponse.ok){const text=await uploadResponse.text();throw new Error(`Media upload failed (${uploadResponse.status}) ${text.slice(0,160)}`)}
      setMessage('3/4 Verifying the stored asset and media-processing state…')
      await apiJson('/api/media/upload-complete',token,{method:'POST',body:JSON.stringify({mediaId:intent.media.id})})
      setMessage('4/4 Queuing Reel / Omni Box delivery…')
      const released=await apiJson('/api/media/publish',token,{method:'POST',body:JSON.stringify({mediaId:intent.media.id,destinations})})
      const draft:Draft={id:`media_${Date.now()}`,title:title.trim()||'Untitled TRYAMM Media',caption:caption.trim(),destinations,createdAt:new Date().toISOString(),source:'media-studio-production',status:'queued',mediaId:intent.media.id,jobId:released.job?.id}
      const next=[draft,...drafts].slice(0,30);setDrafts(next);localStorage.setItem(DRAFT_KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent('tryamm:media-publish-queued',{detail:draft}))
      setMessage(`Production upload verified. ${destinations.join(', ')} publishing job ${released.job?.id||''} is queued for moderation/delivery.`);setTab('publish')
    }catch(error){setMessage(error instanceof Error?error.message:'Production publishing failed.')}
    finally{setPublishing(false)}
  }

  if(!open)return <button type="button" onClick={()=>setOpen(true)} aria-label="Open TRYAMM Reel and Omni Box studio" style={{position:'fixed',right:12,bottom:74,zIndex:8994,border:'1px solid #e8b94499',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#21170a,#191020)',color:'#ffe08a',fontSize:10,fontWeight:950,letterSpacing:1,cursor:'pointer'}}>🎬 CREATE REEL</button>

  return <div role="dialog" aria-label="TRYAMM Media Studio" style={{position:'fixed',inset:0,zIndex:15000,background:'#02050bf5',color:'#fff',overflow:'auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1100,margin:'0 auto',padding:'18px 14px 80px'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,marginBottom:14}}><div><div style={{fontSize:10,fontWeight:950,letterSpacing:3,color:'#4FE3FF'}}>TRYAMM CREATOR MEDIA • PRODUCTION PIPELINE</div><h1 style={{margin:'5px 0 0'}}>Reel Composer + Omni Box Studio</h1></div><button onClick={()=>setOpen(false)} aria-label="Close media studio" style={roundButton}>×</button></header>
      <nav style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>{(['capture','compose','green','publish'] as const).map(x=><button key={x} onClick={()=>setTab(x)} style={{...chip,background:tab===x?'#13364a':'#0a121d',color:tab===x?'#4FE3FF':'#b7c4d1'}}>{x==='green'?'GREEN SCREEN':x.toUpperCase()}</button>)}</nav>
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 320px',gap:14}} className="media-grid">
        <section style={{border:'1px solid #29445d',borderRadius:20,background:'#07101a',padding:14,minHeight:460}}>
          {tab==='capture'&&<div style={{display:'grid',gap:14}}><h2 style={{margin:0}}>StreetVerse Clip Capture</h2><p style={muted}>Record a game window or upload an existing MP4, WebM, GIF, JPEG, PNG or WebP. Creator media is stored in a private per-user production bucket.</p><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{!recording?<button onClick={startCapture} style={primary}>● START SCREEN CAPTURE</button>:<button onClick={stopCapture} style={{...primary,background:'#8f2237'}}>■ STOP CAPTURE</button>}<label style={{...secondary,cursor:'pointer'}}>UPLOAD CLIP / GIF / IMAGE<input type="file" accept="video/mp4,video/webm,image/jpeg,image/png,image/webp,image/gif,.gif" onChange={uploadMedia} style={{display:'none'}}/></label></div><div style={notice}>Capture → compose → production upload → storage verification → moderation queue → Reel / Omni Box destinations.</div></div>}
          {tab==='compose'&&<div style={{display:'grid',gap:12}}><h2 style={{margin:0}}>Reel Composer</h2><div style={{position:'relative',minHeight:330,borderRadius:18,overflow:'hidden',display:'grid',placeItems:'center',background:bgStyle,border:'1px solid #2d455b'}}>{mediaUrl?(mediaKind==='video'?<video ref={sourceVideoRef} src={mediaUrl} controls loop playsInline style={{maxWidth:'100%',maxHeight:420,opacity:chromaEnabled?0:1}}/>:<img src={mediaUrl} alt="Uploaded creator media" style={{maxWidth:'100%',maxHeight:420}}/>):<div style={muted}>Capture or upload media to begin.</div>}{chromaEnabled&&mediaKind==='video'&&<canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}}/>}<div aria-label="animated sticker layer" style={{position:'absolute',right:'9%',top:'10%',fontSize:58,filter:'drop-shadow(0 8px 18px #000)',animation:'tryammSticker 1.2s ease-in-out infinite alternate'}}>{sticker}</div><div style={{position:'absolute',left:16,bottom:14,right:16,fontWeight:950,textShadow:'0 2px 10px #000'}}>{caption}</div></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={input}/><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption" style={input}/></div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{['🔥','👑','🎮','🎤','✨','🦁','🙏'].map(x=><button key={x} onClick={()=>setSticker(x)} style={chip}>{x}</button>)}<button onClick={()=>setTab('green')} style={secondary}>GREEN SCREEN</button><button onClick={()=>setTab('publish')} style={primary}>PUBLISH OPTIONS</button></div></div>}
          {tab==='green'&&<div style={{display:'grid',gap:14}}><h2 style={{margin:0}}>Green Screen / Background Replacement</h2><p style={muted}>Chroma-key preview removes green-dominant pixels while preserving the selected composition recipe for the TRYAMM media pipeline.</p><label style={{display:'flex',gap:10,alignItems:'center'}}><input type="checkbox" checked={chromaEnabled} onChange={e=>setChromaEnabled(e.target.checked)}/> Enable chroma key preview</label><label>Green threshold: {threshold}<input type="range" min="25" max="180" value={threshold} onChange={e=>setThreshold(Number(e.target.value))} style={{width:'100%'}}/></label><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{(['city','gold','void'] as const).map(x=><button key={x} onClick={()=>setBackground(x)} style={{...chip,outline:background===x?'2px solid #4FE3FF':'none'}}>{x.toUpperCase()} BACKGROUND</button>)}</div><button onClick={()=>setTab('compose')} style={primary}>BACK TO COMPOSER</button></div>}
          {tab==='publish'&&<div style={{display:'grid',gap:14}}><h2 style={{margin:0}}>Omni Box Publishing</h2><p style={muted}>Choose destinations. Publishing now creates a private production media object, verifies it server-side, and creates a durable delivery job.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8}}>{DESTINATIONS.map(d=><label key={d.id} style={{display:'flex',gap:9,padding:12,border:'1px solid #2d455b',borderRadius:12,background:'#09131f'}}><input type="checkbox" checked={destinations.includes(d.id)} onChange={()=>toggleDestination(d.id)}/>{d.label}</label>)}</div><button disabled={publishing} onClick={publishProduction} style={{...primary,opacity:publishing?.6:1}}>{publishing?'PUBLISHING…':'UPLOAD + QUEUE REEL / OMNI BOX RELEASE'}</button><div style={notice}>MP4, WebM, GIF and supported images are web-native and do not require server transcoding before queueing. Moderation and destination delivery remain explicit job states.</div></div>}
        </section>
        <aside style={{display:'grid',gap:10,alignContent:'start'}}><div style={panel}><b>MEDIA PIPELINE</b><div style={muted}>Capture → Compose → Green Screen → Sticker/GIF Layer → Secure Upload → Verify → Omni Box Queue → Moderation → Delivery → Analytics → Revenue</div></div><div style={panel}><b>PRODUCTION STATUS</b><div style={{fontSize:11,lineHeight:1.7,marginTop:8}}>Screen capture: browser-backed<br/>Private creator storage: connected<br/>Signed upload: connected<br/>Storage verification: connected<br/>Web-native processing: connected<br/>Omni Box job queue: connected<br/>Moderation: job-gated<br/>Revenue settlement: ledger-gated</div></div><div style={panel}><b>RECENT RELEASES</b><div style={{fontSize:11,color:'#9fb2c8',marginTop:8}}>{drafts.length?drafts.slice(0,5).map(d=><div key={d.id} style={{padding:'8px 0',borderBottom:'1px solid #1d2c3b'}}>{d.title}<br/><span style={{fontSize:9}}>{d.destinations.join(' • ')}{d.jobId?` • ${d.jobId.slice(0,12)}`:''}</span></div>):'No production releases queued yet.'}</div></div><div aria-live="polite" style={notice}>{message}</div></aside>
      </div>
    </div>
    <style>{`@media(max-width:820px){.media-grid{grid-template-columns:1fr!important}} @keyframes tryammSticker{from{transform:translateY(0) rotate(-3deg) scale(1)}to{transform:translateY(-10px) rotate(3deg) scale(1.08)}}`}</style>
  </div>
}

const roundButton:React.CSSProperties={width:44,height:44,borderRadius:'50%',border:'1px solid #3d536c',background:'#0c1520',color:'#fff',fontSize:22}
const chip:React.CSSProperties={border:'1px solid #31485e',borderRadius:999,padding:'9px 12px',background:'#0b1520',color:'#fff',fontSize:10,fontWeight:900}
const primary:React.CSSProperties={border:0,borderRadius:12,padding:'12px 14px',background:'linear-gradient(135deg,#4FE3FF,#7398ff)',color:'#04111a',fontWeight:950}
const secondary:React.CSSProperties={border:'1px solid #3b536b',borderRadius:12,padding:'11px 13px',background:'#101a25',color:'#fff',fontWeight:900,fontSize:11}
const input:React.CSSProperties={border:'1px solid #33495e',borderRadius:11,padding:11,background:'#07101a',color:'#fff'}
const muted:React.CSSProperties={fontSize:12,color:'#9fb2c8',lineHeight:1.6}
const panel:React.CSSProperties={padding:14,border:'1px solid #294058',borderRadius:16,background:'#08111c'}
const notice:React.CSSProperties={padding:12,border:'1px solid #3b3652',borderRadius:13,background:'#100d19',fontSize:11,color:'#c5c8d7',lineHeight:1.55}
