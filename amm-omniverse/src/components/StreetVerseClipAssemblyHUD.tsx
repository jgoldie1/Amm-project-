import {useEffect,useRef,useState} from 'react'
import type {StreetVerseReelCaptureReady} from '../runtime/StreetVerseReelCaptureRuntime'

type Clip={id:string;name:string;url:string;blob:Blob;durationMs:number;mimeType:string;source:'game'|'import'}
const button:React.CSSProperties={minHeight:52,padding:'10px 12px',borderRadius:12,border:'1px solid #8fd2df',background:'#17435b',fontWeight:800,color:'white',touchAction:'manipulation'}
const MAX_SEGMENTS=240
export default function StreetVerseClipAssemblyHUD(){
 const [open,setOpen]=useState(false)
 const [clips,setClips]=useState<Clip[]>([])
 const [selected,setSelected]=useState(0)
 const [playing,setPlaying]=useState(false)
 const [message,setMessage]=useState('30-second game recordings can be assembled into a scene playlist.')
 const [rendering,setRendering]=useState(false)
 const [effect,setEffect]=useState<'none'|'cinematic'|'neon'|'stunt-flash'>('none')
 const player=useRef<HTMLVideoElement|null>(null)
 const clipsRef=useRef<Clip[]>([])
 const renderingRef=useRef(false)
 useEffect(()=>{clipsRef.current=clips},[clips])
 useEffect(()=>{
  const onReady=(e:Event)=>{
   const d=(e as CustomEvent<StreetVerseReelCaptureReady>).detail
   if(!d?.blob?.size)return
   if(clipsRef.current.length>=MAX_SEGMENTS){setMessage('240-clip limit reached. Export existing clips before continuing.');return}
   const url=URL.createObjectURL(d.blob)
   setClips(prev=>[...prev,{id:crypto.randomUUID?.()||String(Date.now())+Math.random(),name:d.fileName,blob:d.blob,url,durationMs:d.durationMs,mimeType:d.mimeType,source:'game'}])
   setMessage('Game reel added to the studio timeline.')
  }
  window.addEventListener('tryamm:reel-capture-ready',onReady)
  return()=>window.removeEventListener('tryamm:reel-capture-ready',onReady)
 },[])
 useEffect(()=>()=>{clipsRef.current.forEach(c=>URL.revokeObjectURL(c.url))},[])
 const addFiles=async(files:FileList|null)=>{
  if(!files?.length)return
  const loaded:Clip[]=[]
  for(const file of Array.from(files).slice(0,Math.max(0,MAX_SEGMENTS-clipsRef.current.length))){
   if(!file.type.startsWith('video/'))continue
   const url=URL.createObjectURL(file)
   const durationMs=await new Promise<number>(resolve=>{
    const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{resolve(Number.isFinite(v.duration)?Math.round(v.duration*1000):0);v.removeAttribute('src');v.load()};v.onerror=()=>resolve(0);v.src=url
   })
   loaded.push({id:crypto.randomUUID?.()||String(Math.random()),name:file.name,blob:file,url,durationMs,mimeType:file.type,source:'import'})
  }
  if(loaded.length)setClips(old=>[...old,...loaded])
 }
 const move=(index:number,direction:number)=>{
  const to=index+direction;if(to<0||to>=clips.length)return
  setClips(old=>{const next=[...old];[next[index],next[to]]=[next[to],next[index]];return next})
  setSelected(to)
 }
 const remove=(index:number)=>{
  if(renderingRef.current)return
  const c=clips[index];if(!c)return
  setClips(old=>old.filter((_,i)=>i!==index));setSelected(0);setPlaying(false)
  window.setTimeout(()=>URL.revokeObjectURL(c.url),1000)
 }
 const nextClip=()=>{
  if(!playing)return
  if(selected+1<clips.length)setSelected(x=>x+1);else{setPlaying(false);setMessage('Playlist complete. This preview changes clips between files; stitched export is one continuous video.')}
 }
 useEffect(()=>{if(playing){const v=player.current;if(v){v.load();void v.play().catch(()=>{setPlaying(false);setMessage('Tap Play again: this browser requires user activation for video playback.')})}}},[selected,playing])
 const download=(blob:Blob,name:string)=>{
  const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000)
 }
 const manifest=()=>download(new Blob([JSON.stringify({schema:'streetverse.clip-assembly.v1',clips:clips.map((c,i)=>({order:i+1,name:c.name,durationMs:c.durationMs,mimeType:c.mimeType,bytes:c.blob.size})),plannedDurationMs:clips.reduce((s,c)=>s+c.durationMs,0),needsSeparateClipFiles:true,mergedExportVerified:false,visualEffect:effect,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),'StreetVerse_Clip_Timeline_Report.json')
 const merge=async()=>{
  if(renderingRef.current||!clips.length)return
  if(typeof MediaRecorder==='undefined'||!HTMLCanvasElement.prototype.captureStream){setMessage('Merged export not supported by this browser. Export individual clips and timeline report.');return}
  const type=['video/mp4','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t))||''
  if(!type){setMessage('No supported video encoder.');return}
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360
  const ctx=canvas.getContext('2d');if(!ctx)return
  const stream=canvas.captureStream(24)
  const chunks:BlobPart[]=[]
  let rec:MediaRecorder
  try{rec=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:1_200_000})}catch{stream.getTracks().forEach(t=>t.stop());setMessage('Video encoder could not initialize.');return}
  renderingRef.current=true;setRendering(true);setMessage('Rendering clips with '+effect+' SFX. Keep this tab open. Video-only export; no audio mixing.')
  const done=new Promise<Blob>((resolve,reject)=>{rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onerror=()=>reject(new Error('Recorder error'));rec.onstop=()=>resolve(new Blob(chunks,{type}))})
  let frame=0
  const draw=(v:HTMLVideoElement,ended:{current:boolean})=>{
   if(ended.current)return
   ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height)
   if(v.readyState>=2&&v.videoWidth&&v.videoHeight){
    const scale=Math.min(canvas.width/v.videoWidth,canvas.height/v.videoHeight)
    const w=v.videoWidth*scale,h=v.videoHeight*scale
    ctx.save()
    ctx.filter=effect==='cinematic'?'contrast(1.25) saturate(.82)':effect==='neon'?'contrast(1.2) saturate(1.7) hue-rotate(15deg)':effect==='stunt-flash'?'contrast(1.3) saturate(1.15)':'none'
    ctx.drawImage(v,(canvas.width-w)/2,(canvas.height-h)/2,w,h)
    ctx.restore()
    if(effect==='cinematic'){
      ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,22);ctx.fillRect(0,canvas.height-22,canvas.width,22)
    }else if(effect==='neon'){
      ctx.strokeStyle='#36e9ff';ctx.lineWidth=4;ctx.strokeRect(5,5,canvas.width-10,canvas.height-10)
    }else if(effect==='stunt-flash'&&v.currentTime%3<.12){
      ctx.fillStyle='rgba(255,243,190,.42)';ctx.fillRect(0,0,canvas.width,canvas.height)
    }
   }
   frame=requestAnimationFrame(()=>draw(v,ended))
  }
  try{
   rec.start(1000)
   for(const clip of clips){
    if(clip.durationMs<=0)throw new Error('Clip metadata is missing: '+clip.name)
    const v=document.createElement('video');v.src=clip.url;v.muted=true;v.playsInline=true;v.preload='auto'
    await new Promise<void>((resolve,reject)=>{v.onloadeddata=()=>resolve();v.onerror=()=>reject(new Error('Cannot decode '+clip.name));v.load()})
    const flag={current:false};draw(v,flag)
    await v.play()
    await new Promise<void>((resolve,reject)=>{v.onended=()=>resolve();v.onerror=()=>reject(new Error('Playback failed'));})
    flag.current=true;cancelAnimationFrame(frame);v.pause();v.removeAttribute('src');v.load()
   }
   if(rec.state!=='inactive')rec.stop()
   const result=await done
   download(result,'StreetVerse_Combined_Silent_Movie.'+(type.includes('mp4')?'mp4':'webm'))
   setMessage('Combined continuous video exported. Audio not included; verify output and add mixed soundtrack in a video editor.')
  }catch(e){if(rec.state!=='inactive')rec.stop();setMessage('Merged export failed: '+(e instanceof Error?e.message:String(e)))}
  finally{cancelAnimationFrame(frame);stream.getTracks().forEach(t=>t.stop());renderingRef.current=false;setRendering(false)}
 }
 const total=clips.reduce((s,c)=>s+c.durationMs,0)
 return <aside data-streetverse-clip-assembler="true" style={{position:'fixed',right:8,bottom:'max(70px,env(safe-area-inset-bottom) + 60px)',zIndex:42019,fontFamily:'system-ui',color:'white'}}>
  <button style={button} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🎞 CLIP MOVIE STUDIO ({clips.length})</button>
  {open&&<section role="region" aria-label="StreetVerse clip assembly studio" style={{width:'min(430px,calc(100vw - 16px))',maxHeight:'70dvh',overflowY:'auto',padding:12,border:'1px solid #75aebb',borderRadius:14,background:'#081724f5',display:'grid',gap:10}}>
   <strong style={{fontSize:20}}>StreetVerse Movie Studio</strong>
   <p style={{margin:0,fontSize:13}}>Record up to 30 seconds at a time using the game camera. Add each reel here. Rearrange clips and make a continuous silent video file on supported browsers. Streaming and mixed-audio film export require the finalized video workflow.</p>
   <label>Import video segments<input type="file" accept="video/*" multiple onChange={e=>{void addFiles(e.target.files);e.target.value=''}} style={{display:'block',maxWidth:'100%',minHeight:48}}/></label>
   <div>Timeline: {clips.length} clips · {(total/60000).toFixed(1)} min / 120 min target</div>
   <label>Canvas SFX preset<select value={effect} onChange={e=>setEffect(e.target.value as typeof effect)} style={{display:'block',width:'100%',minHeight:50}}><option value="none">Original footage</option><option value="cinematic">Cinematic contrast + letterbox</option><option value="neon">CGI-style neon grade</option><option value="stunt-flash">Virtual stunt flash</option></select></label>
   {clips.length>0&&<video key={clips[selected]?.id} ref={player} src={clips[selected]?.url} controls playsInline preload="metadata" onEnded={nextClip} style={{width:'100%',maxHeight:240,background:'#000',borderRadius:8}}/>}
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
    <button style={button} onClick={()=>{setSelected(0);setPlaying(true)}} disabled={!clips.length}>▶ PLAY PLAYLIST</button>
    <button style={button} onClick={()=>{setPlaying(false);player.current?.pause()}}>■ STOP</button>
    <button style={button} onClick={manifest} disabled={!clips.length}>EXPORT TIMELINE</button>
    <button style={button} onClick={()=>{void merge()}} disabled={!clips.length||rendering}>MERGE SILENT VIDEO</button>
   </div>
   <div style={{display:'grid',gap:6}}>{clips.map((c,i)=><div key={c.id} style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',border:'1px solid #396377',padding:5,borderRadius:8}}><button style={{...button,minHeight:40,flex:'1 1 110px'}} onClick={()=>{setPlaying(false);setSelected(i)}}>{i+1}. {c.name.slice(0,20)} ({Math.ceil(c.durationMs/1000)}s)</button><button style={{...button,minHeight:40}} onClick={()=>move(i,-1)} disabled={rendering}>↑</button><button style={{...button,minHeight:40}} onClick={()=>move(i,1)} disabled={rendering}>↓</button><button style={{...button,minHeight:40}} onClick={()=>remove(i)} disabled={rendering}>×</button></div>)}</div>
   <p role="status" aria-live="polite" style={{margin:0,fontSize:13}}>{message}</p>
   <small>Up to 240 clips of 30 sec = 120 min. Large merges may exhaust phone memory; use desktop or server export for long films. Audio from imported clips is not mixed into browser-rendered export. Effects are 2D filters/overlays, not full CGI or physical stunt animation.</small>
  </section>}
 </aside>
}
