import {useEffect,useRef,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import type {EpisodeBeat} from './OmniBoxStoryStudio'

// Real video bytes of ORIGINAL VECTOR STORYBOARDS: not AI-generated scenes,
// footage, actor performances, voiceovers, licensed music or 30-minute film.
const WIDTH=480,HEIGHT=270,FRAMERATE=12,SECONDS_PER_SCENE=2.5
function wrap(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,maxWidth:number,lineHeight:number,maxLines:number){
 const words=text.split(/\s+/).filter(Boolean);let line='',lines=0
 for(const word of words){
  const next=line?line+' '+word:word
  if(ctx.measureText(next).width>maxWidth&&line){
   ctx.fillText(line,x,y+lines*lineHeight);lines++
   if(lines>=maxLines)return
   line=word
  }else line=next
 }
 if(line&&lines<maxLines)ctx.fillText(line,x,y+lines*lineHeight)
}
function drawFrame(ctx:CanvasRenderingContext2D,scenes:EpisodeBeat[],title:string,elapsedSeconds:number){
 const count=Math.max(1,scenes.length),duration=count*SECONDS_PER_SCENE
 const sceneIndex=Math.min(count-1,Math.floor(elapsedSeconds/SECONDS_PER_SCENE))
 const scene=scenes[sceneIndex];const local=(elapsedSeconds%SECONDS_PER_SCENE)/SECONDS_PER_SCENE
 const hue=[208,232,24,263,315,38][sceneIndex%6]
 ctx.clearRect(0,0,WIDTH,HEIGHT)
 const gradient=ctx.createLinearGradient(0,0,WIDTH,HEIGHT)
 gradient.addColorStop(0,'hsl('+hue+' 39% 19%)');gradient.addColorStop(1,'#040914')
 ctx.fillStyle=gradient;ctx.fillRect(0,0,WIDTH,HEIGHT)
 ctx.fillStyle='#e4b75d';ctx.font='bold 13px system-ui';ctx.fillText('TRYAMM · OMNI BOX',22,25)
 ctx.fillStyle='#a5defa';ctx.font='11px system-ui';wrap(ctx,title,22,47,434,14,2)
 const skyline=[66,104,86,137,96,77,121,88,64,110,76,124,68]
 skyline.forEach((height,i)=>{
  const x=i*39-20-Math.sin(local*Math.PI)*12
  ctx.fillStyle=i%3===0?'#1a344d':'#122940'
  ctx.fillRect(x,165-height*.6,36,130+height*.6)
  ctx.fillStyle='#ffd69b'
  for(let y=170-height*.6;y<198;y+=17)for(let z=x+6;z<x+30;z+=11){if((i+Math.floor(y)+Math.floor(z))%3!==0)ctx.fillRect(z,y,3,5)}
 })
 ctx.fillStyle='#081623';ctx.fillRect(0,191,WIDTH,79)
 ctx.fillStyle='#d0faff';ctx.font='bold 18px system-ui';wrap(ctx,(sceneIndex+1)+'. '+(scene?.title||'Scene'),22,211,435,22,2)
 ctx.fillStyle='#d0deec';ctx.font='11px system-ui';wrap(ctx,String(scene?.purpose||''),22,247,435,14,1)
 ctx.fillStyle='#72d6e0';ctx.fillRect(0,HEIGHT-5,WIDTH*Math.min(1,elapsedSeconds/duration),5)
}
export default function OmniBoxStoryboardVideoExport({scenes,title,episode}:{scenes:EpisodeBeat[];title:string;episode:number}){
 const [busy,setBusy]=useState(false)
 const [saving,setSaving]=useState(false)
 const [status,setStatus]=useState('Render an original moving storyboard video file for local review. It does not include film footage, characters, narration or music.')
 const [progress,setProgress]=useState(0)
 const [videoUrl,setVideoUrl]=useState('')
 const [videoType,setVideoType]=useState('')
 const [privatePlaybackUrl,setPrivatePlaybackUrl]=useState('')
 const recorded=useRef<Blob|null>(null)
 useEffect(()=>()=>{if(videoUrl)URL.revokeObjectURL(videoUrl)},[videoUrl])
 const render=async()=>{
  if(busy||!scenes.length)return
  setBusy(true);setProgress(0);setPrivatePlaybackUrl('');setStatus('Rendering your storyboard frames locally…')
  try{
   const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT
   const ctx=canvas.getContext('2d')
   if(!ctx||!canvas.captureStream||typeof MediaRecorder==='undefined')throw new Error('Video rendering is unavailable in this browser. Use the storyboard preview and export your script instead.')
   const mime=['video/mp4','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m))
   if(!mime)throw new Error('Your browser cannot encode a supported MP4/WebM storyboard video.')
   const stream=canvas.captureStream(FRAMERATE),recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:250000})
   const chunks:Blob[]=[]
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
   const duration=Math.min(6,scenes.length)*SECONDS_PER_SCENE
   let timer:ReturnType<typeof setInterval>|null=null
   const output=new Promise<Blob>((resolve,reject)=>{
    recorder.onerror=()=>reject(new Error('Browser video encoder failed.'))
    recorder.onstop=()=>{
     stream.getTracks().forEach(t=>t.stop())
     const blob=new Blob(chunks,{type:recorder.mimeType||mime})
     blob.size?resolve(blob):reject(new Error('Storyboard video was empty.'))
    }
   })
   drawFrame(ctx,scenes,title,0)
   recorder.start(1000)
   const started=performance.now()
   timer=setInterval(()=>{
    const elapsed=(performance.now()-started)/1000
    drawFrame(ctx,scenes,title,Math.min(duration,elapsed))
    const percent=Math.min(100,Math.round(elapsed/duration*100))
    setProgress(percent)
    if(elapsed>=duration){if(timer)clearInterval(timer);if(recorder.state==='recording')recorder.stop()}
   },1000/FRAMERATE)
   let blob:Blob
   try{blob=await output}finally{if(timer)clearInterval(timer);stream.getTracks().forEach(t=>t.stop())}
   recorded.current=blob
   const url=URL.createObjectURL(blob)
   setVideoUrl(url);setVideoType(blob.type)
   setStatus('Real storyboard video rendered locally. Review and download it. No finished movie or public distribution was created.')
  }catch(e){setStatus(e instanceof Error?e.message:'The storyboard renderer failed.')}
  finally{setBusy(false)}
 }
 const savePrivate=async()=>{
  const blob=recorded.current
  if(!blob||saving)return
  setSaving(true);setStatus('Verifying your private storyboard-video upload…')
  try{
   if(blob.size>20*1024*1024)throw new Error('Storyboard preview is larger than the 20 MB private pilot limit.')
   const mime=videoType.split(';')[0]||'video/webm'
   const token=await getAccessToken()
   if(!token)throw new Error('Sign in to TRYAMM before uploading.')
   const headers={'content-type':'application/json',Authorization:'Bearer '+token}
   const name='omnibox-episode-'+episode+'-storyboard.'+(mime==='video/mp4'?'mp4':'webm')
   const intent=await fetch('/api/media/upload-intent',{method:'POST',headers,body:JSON.stringify({
    fileName:name,contentType:mime,sizeBytes:blob.size,title:'Omni Box episode '+episode+' storyboard preview',
    caption:'Unpublished video storyboard; rights and moderation review required',
    composition:{source:'omnibox-storyboard-video',kind:'preview-only',episode,finalFilm:false}
   })})
   const data=await intent.json().catch(()=>({}))
   if(!intent.ok||!data?.upload?.url||!data?.media?.id)throw new Error(data.error||'Could not prepare private video upload.')
   const uploaded=await fetch(data.upload.url,{method:'PUT',headers:{'content-type':mime},body:blob})
   if(!uploaded.ok)throw new Error('Storage upload failed. Keep your local file.')
   const verified=await fetch('/api/media/upload-complete',{method:'POST',headers,body:JSON.stringify({mediaId:data.media.id})})
   const body=await verified.json().catch(()=>({}))
   if(!verified.ok)throw new Error(body.error||'Private upload could not be verified.')
   // This short-lived signed URL tests the STORED file, separately from the
   // local blob preview. It is private proof, never a public publication URL.
   const signedPlayback=typeof body.playbackUrl==='string'&&body.playbackUrl.startsWith('https://')?body.playbackUrl:''
   setPrivatePlaybackUrl(signedPlayback)
   setStatus('Storyboard preview saved privately in TRYAMM media. Reference: '+data.media.id+'. No public film distribution or paid release.'+(signedPlayback?' Review the temporary stored-file playback below.':' Private stored-file playback could not be opened yet.'))
  }catch(e){setStatus(e instanceof Error?e.message:'Save failed. Keep the local download.')}
  finally{setSaving(false)}
 }
 const download=()=>{
  if(!videoUrl)return
  const link=document.createElement('a')
  link.href=videoUrl;link.download='omnibox-episode-'+episode+'-storyboard.'+(videoType.includes('mp4')?'mp4':'webm')
  document.body.append(link);link.click();link.remove()
 }
 return <section aria-label="Omni Box real storyboard video export" style={{background:'#091522',border:'1px solid #456079',borderRadius:16,padding:14,margin:'12px 0',color:'#e8f5ff',display:'grid',gap:10}}>
  <strong>🎬 REAL STORYBOARD VIDEO • LOCAL RENDER</strong>
  <p style={{fontSize:12}}>Create a short original 480p-class vector-storyboard preview (480×270, no audio), not the promised 30-minute finished film. Requires an MP4/WebM-capable browser.</p>
  <button type="button" disabled={busy} onClick={()=>void render()} style={{minHeight:48}}>{busy?'RENDERING '+progress+'%':'RENDER STORYBOARD PREVIEW VIDEO'}</button>
  {videoUrl&&<><video controls playsInline src={videoUrl} style={{width:'100%',maxWidth:480,borderRadius:8,background:'#000'}} aria-label="Rendered Omni Box storyboard video"/><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button type="button" style={{minHeight:48}} onClick={download}>DOWNLOAD REAL VIDEO FILE</button>
    <button type="button" style={{minHeight:48}} disabled={saving} onClick={()=>void savePrivate()}>{saving?'SAVING PRIVATE…':'SAVE VIDEO PRIVATELY TO TRYAMM'}</button>
  </div></>}
  {privatePlaybackUrl&&<section aria-label="Private cloud storyboard playback" style={{display:'grid',gap:6}}>
    <strong style={{fontSize:12}}>PRIVATE CLOUD PLAYBACK • VERIFIED UPLOAD</strong>
    <video controls playsInline preload="metadata" src={privatePlaybackUrl} style={{width:'100%',maxWidth:480,borderRadius:8,background:'#000'}} aria-label="Play stored private Omni Box storyboard file"/>
    <small>Temporary signed link (up to one hour). Keep your downloaded source; this is not a publicly published movie.</small>
  </section>}
  <p role="status" style={{fontSize:12,color:'#b7f6d5',overflowWrap:'anywhere'}}>{status}</p>
 </section>
}
