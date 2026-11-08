import {useEffect,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import type {EpisodeDraft} from './OmniBoxStoryStudio'

type Choice='A'|'B'|'C'|'D'
type Suggested={text:string;provider:string;offline:boolean}
type VideoReady={url:string;blob:Blob;fileName:string;seconds:number}
const choiceLabels:Record<Choice,string>={A:'ACTION',B:'PLAN',C:'SOCIAL',D:'WILDCARD'}
const buttonStyle={minHeight:44,borderRadius:10,border:'1px solid #60d8f7',background:'#124158',color:'#fff',padding:'9px 12px',fontWeight:800 as const}
function clean(s:unknown,n=1000){return String(s||'').replace(/<[^>]*>/g,' ').replace(/[\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim().slice(0,n)}
function fallback(episode:EpisodeDraft,i:number,choice:Choice){
 const s=episode.scenes[i]
 if(!s)return 'KIT AI: Select a mission scene.'
 const tails:Record<Choice,string>={A:'BJ: We move now. Marcus, stay with me.',B:'BJ: Check the route and equipment first.',C:'BJ: We should talk with the business owner.',D:'KIT AI: An optional scan can reveal another path.'}
 return 'MARCUS: Our assignment is '+clean(s.title,100)+'. '+clean(s.purpose,250)+'. '+tails[choice]
}
function wrap(ctx:CanvasRenderingContext2D,s:string,x:number,y:number,width:number,line=28){
 const words=clean(s,320).split(' ');let t='',count=0
 for(const word of words){const next=t?t+' '+word:word;if(ctx.measureText(next).width>width&&t){ctx.fillText(t,x,y+count*line);count++;if(count>2)return;t=word}else t=next}
 if(t)ctx.fillText(t,x,y+count*line)
}
function draw(ctx:CanvasRenderingContext2D,episode:EpisodeDraft,time:number,duration:number){
 const w=ctx.canvas.width,h=ctx.canvas.height,parts=Math.min(6,episode.scenes.length),i=Math.min(parts-1,Math.floor(time/duration*parts))
 const s=episode.scenes[i],g=ctx.createLinearGradient(0,0,w,h)
 g.addColorStop(0,'#091127');g.addColorStop(.6,i%2?'#322046':'#12435d');g.addColorStop(1,'#050a17')
 ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(0,0,0,.5)'
 for(let n=0;n<23;n++){const x=n*49-((time*12)%49);ctx.fillRect(x,345-(n*47+i*23)%135,42,200)}
 ctx.strokeStyle='#44b8d6';ctx.beginPath();ctx.moveTo(0,350);ctx.lineTo(w,350);ctx.stroke()
 ctx.beginPath();ctx.arc(125+650*(time/duration),322,11,0,Math.PI*2);ctx.fillStyle='#5ce8fb';ctx.fill()
 ctx.fillStyle='#a9ecff';ctx.font='bold 25px system-ui';ctx.fillText('TRYAMM LLC   STREETVERSE   HOLOBOX',65,62)
 ctx.fillStyle='#fff';ctx.font='bold 48px system-ui';wrap(ctx,s?.title||'Mission',65,160,820,54)
 ctx.fillStyle='#e1f5ff';ctx.font='24px system-ui';wrap(ctx,s?.dialogue||s?.purpose||'',65,410,800,33)
 ctx.font='18px system-ui';ctx.fillStyle='#b7cbd8';ctx.fillText('ACT '+(i+1)+' OF '+parts+'  ·  ORIGINAL DRAFT ANIMATIC · NOT A FINISHED 3D FILM',65,505)
 ctx.fillStyle='#50d7f4';ctx.fillRect(0,533,Math.min(960,960*time/duration),7)
}
async function record(episode:EpisodeDraft,progress:(n:number)=>void,voiceFile?:File|null):Promise<{blob:Blob;name:string}>{
 if(typeof MediaRecorder==='undefined')throw new Error('MediaRecorder is unavailable: use Chrome or export the storyboard.')
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540
 const ctx=canvas.getContext('2d')
 if(!ctx||typeof canvas.captureStream!=='function')throw new Error('Canvas video recording is not supported.')
 // A mixed audio/video recording prefers WebM/Opus; preserve the existing video-only path.
 const candidates=voiceFile
  ?['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4']
  :['video/mp4;codecs=avc1.42E01E','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']
 const format=candidates.find(x=>MediaRecorder.isTypeSupported(x))
 if(!format)throw new Error('No available MP4/WebM video encoder.')
 const stream=canvas.captureStream(20),chunks:BlobPart[]=[],duration=18
 let voiceContext:AudioContext|null=null,voiceSource:AudioBufferSourceNode|null=null
 if(voiceFile){
  if(voiceFile.size>12_000_000||!voiceFile.type.startsWith('audio/')){
   stream.getTracks().forEach(track=>track.stop())
   throw new Error('Use an authorized audio file under 12 MB.')
  }
  try{
   if(typeof AudioContext==='undefined')throw new Error('Audio mixing is unsupported in this browser.')
   voiceContext=new AudioContext()
   const sound=await voiceContext.decodeAudioData(await voiceFile.arrayBuffer())
   if(!Number.isFinite(sound.duration)||sound.duration<=0)throw new Error('Voice recording is empty.')
   const destination=voiceContext.createMediaStreamDestination()
   voiceSource=voiceContext.createBufferSource()
   voiceSource.buffer=sound
   voiceSource.connect(destination)
   const track=destination.stream.getAudioTracks()[0]
   if(!track)throw new Error('No encoded audio track was available.')
   stream.addTrack(track)
   await voiceContext.resume()
  }catch(error){
   stream.getTracks().forEach(track=>track.stop())
   if(voiceContext)void voiceContext.close().catch(()=>{})
   throw error
  }
 }
 const mr=new MediaRecorder(stream,{mimeType:format,videoBitsPerSecond:1500000,audioBitsPerSecond:96000})
 return await new Promise((resolve,reject)=>{
  let finished=false,raf=0,watch=0
  const clear=()=>{cancelAnimationFrame(raf);clearTimeout(watch);stream.getTracks().forEach(t=>t.stop());try{voiceSource?.stop()}catch{}if(voiceContext)void voiceContext.close().catch(()=>{})}
  const fail=(e:Error)=>{if(finished)return;finished=true;clear();try{if(mr.state==='recording')mr.stop()}catch{}reject(e)}
  mr.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
  mr.onerror=()=>fail(new Error('Video encoder reported a failure'))
  mr.onstop=()=>{if(finished)return;finished=true;clear();const blob=new Blob(chunks,{type:mr.mimeType||format});if(!blob.size){reject(new Error('Video export was empty'));return}resolve({blob,name:'streetverse-holobox-reel.'+(format.includes('mp4')?'mp4':'webm')})}
  const started=performance.now()
  const loop=(now:number)=>{if(finished)return;const elapsed=Math.min(duration,(now-started)/1000);draw(ctx,episode,elapsed,duration);progress(Math.floor(100*elapsed/duration));if(elapsed>=duration){mr.stop();return}raf=requestAnimationFrame(loop)}
  watch=window.setTimeout(()=>fail(new Error('Render timeout')),28000)
  try{draw(ctx,episode,0,duration);mr.start(250);voiceSource?.start(0);raf=requestAnimationFrame(loop)}catch(e){fail(e instanceof Error?e:new Error('Recorder failed'))}
 })
}
export default function HoloCreatorBridgePanel({episode,selected,onApply,onRendered}:{episode:EpisodeDraft;selected:number;onApply:(text:string)=>void;onRendered:(seconds:number)=>void}){
 const [choice,setChoice]=useState<Choice>('B'),[speaker,setSpeaker]=useState('BJ'),[suggested,setSuggested]=useState<Suggested|null>(null)
 const [status,setStatus]=useState('Bridge ready. HoloGPT requests are optional and creator-reviewed.'),[busy,setBusy]=useState(false)
 const [video,setVideo]=useState<VideoReady|null>(null),[progress,setProgress]=useState(0)
 const [voiceFile,setVoiceFile]=useState<File|null>(null),[voiceRightsApproved,setVoiceRightsApproved]=useState(false)
 const [routerStatus,setRouterStatus]=useState('Not checked: owned Llama connection is unverified.')
 useEffect(()=>setSuggested(null),[selected])
 useEffect(()=>()=>{if(video?.url)URL.revokeObjectURL(video.url)},[video?.url])
 function offline(){setSuggested({text:fallback(episode,selected,choice),provider:'original offline',offline:true});setStatus('Original fictional dialogue ready to review.')}
 async function generate(){
  if(busy)return;setBusy(true)
  try{
   const token=await getAccessToken().catch(()=>null),scene=episode.scenes[selected]
   const controller=new AbortController(),timer=window.setTimeout(()=>controller.abort(),9000)
   let response:Response
   try{response=await fetch('/api/ai/answer',{method:'POST',credentials:'same-origin',signal:controller.signal,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify({question:'Write 3–5 short original StreetVerse character lines for '+clean(episode.title)+'; scene '+clean(scene.title)+'; purpose '+clean(scene.purpose,340)+'; player '+clean(speaker,40)+' chooses '+choiceLabels[choice]+'. Use BJ, Marcus and KIT AI as relevant. This is a fictional creative draft, not a real-world action. No celebrity impersonation. Return dialogue only.',history:[],sourceMode:'auto'})})}finally{clearTimeout(timer)}
   const result=await response.json().catch(()=>({}))
   if(!response.ok||result.degraded||!clean(result.answer))throw new Error('Generative provider unavailable')
   setSuggested({text:clean(result.answer,1600),provider:clean(result.provider,80)||'HoloGPT',offline:false})
   setStatus('HoloGPT dialogue returned. Review it before applying; it has no authority to change game credits or publish content.')
  }catch(e){setSuggested({text:fallback(episode,selected,choice),provider:'original offline fallback',offline:true});setStatus('Model unavailable: original dialogue used instead.')}
  finally{setBusy(false)}
 }
 async function checkRouter(){
  const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),6000)
  try{
   const response=await fetch('/api/ai/health',{signal:controller.signal,cache:'no-store'})
   const data=await response.json()
   if(!response.ok)throw new Error('Health request failed')
   const configured=data.selfHosted?.configured===true
   setRouterStatus(configured?'Self-hosted model endpoint configured; actual response generation still requires a live request.':'No owned Llama endpoint configured in this deployment; offline dialogue remains available.')
  }catch{setRouterStatus('HoloGPT service unreachable; original offline dialogue remains available.')}
  finally{clearTimeout(timeout)}
 }
 async function render(){
  if(busy)return
  if(voiceFile&&!voiceRightsApproved){setStatus('Confirm ownership or recording permission before including this audio.');return}
  setBusy(true);setProgress(0);setStatus('Rendering an 18-second original video animatic. Keep this tab open.')
  try{const output=await record(episode,setProgress,voiceFile);const url=URL.createObjectURL(output.blob);setVideo({url,blob:output.blob,fileName:output.name,seconds:18});onRendered(18);setStatus(voiceFile?'18-second animatic rendered with authorized voice audio. Verify playback before sharing.':'18-second video rendered without voice audio. Add an original audio recording to include voice.')}
  catch(e){setStatus(e instanceof Error?e.message:'Unable to render. Export the screenplay instead.')}finally{setBusy(false)}
 }
 function handoff(){if(!video)return;window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'omnibox-holobox',title:episode.title,caption:episode.title+' • Original StreetVerse animatic • #TRYAMM #StreetVerse',blob:video.blob,fileName:video.fileName,missionId:'chicago-delivery',published:false,rightsCleared:false}}));setStatus('Video sent to TRYAMM Media Studio composer. Publishing remains gated by signed-in creator and rights checks.')}
 return <section aria-label="StreetVerse HoloGPT HoloBox bridge" style={{background:'#091a2a',border:'1px solid #50cbe9',borderRadius:16,padding:16,color:'#fff',margin:'18px 0',display:'grid',gap:12}}>
  <div style={{fontSize:12,color:'#8deaff',letterSpacing:2,fontWeight:900}}>TRYAMM QUANTUM CREATOR BRIDGE</div><h2 style={{margin:0}}>StreetVerse → HoloGPT/Llama → HoloBox → OmniBox → Holo Reel</h2><p>Make a reviewed NPC dialogue draft, preview six original shot plans, and record a real short video to download or edit in TRYAMM Media Studio.</p>
  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><label>Character <select value={speaker} aria-label="Character voice" onChange={e=>setSpeaker(e.target.value)}>{['BJ','Marcus','KIT AI','Radio host','Shopkeeper'].map(x=><option key={x}>{x}</option>)}</select></label><label>Mission choice <select value={choice} aria-label="Mission choice" onChange={e=>setChoice(e.target.value as Choice)}>{(['A','B','C','D'] as Choice[]).map(x=><option key={x} value={x}>{x} — {choiceLabels[x]}</option>)}</select></label></div>
  <div style={{display:'flex',flexWrap:'wrap',gap:9}}><button style={buttonStyle} disabled={busy} onClick={offline}>MAKE ORIGINAL OFFLINE DIALOGUE</button><button style={buttonStyle} disabled={busy} onClick={generate}>ASK HOLOGPT / OWN LLAMA MODEL</button><button style={buttonStyle} disabled={busy} onClick={checkRouter}>CHECK OWN LLAMA ROUTER</button></div><p role="status">{routerStatus}</p>
  {suggested&&<div style={{border:'1px solid #4fa4c2',borderRadius:9,padding:12}}><strong>{suggested.offline?'OFFLINE':'AI'} · {suggested.provider}</strong><p>{suggested.text}</p><div style={{display:'flex',flexWrap:'wrap',gap:8}}><button style={buttonStyle} onClick={()=>{onApply(suggested.text);setStatus('Dialogue applied to this act; save the OmniBox outline to retain it.')}}>APPLY TO ACT</button><button style={buttonStyle} onClick={()=>{if('speechSynthesis'in window){speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(suggested.text);voice.rate=.94;speechSynthesis.speak(voice)}}}>HEAR BROWSER VOICE</button></div></div>}
  <div><h3>HoloBox shot director</h3><ol style={{lineHeight:1.6}}>{episode.scenes.slice(0,6).map((s,i)=><li key={s.id}><strong>{i+1}. {s.title}</strong> — {s.shots}</li>)}</ol></div>
  <div style={{display:'grid',gap:8,border:'1px solid #446174',padding:12,borderRadius:10}}>
    <label>Optional original or properly licensed voice recording (MP3/WAV/OGG, maximum 12 MB)
      <input aria-label="Authorized voice audio file" type="file" accept="audio/*" onChange={e=>{setVoiceFile(e.target.files?.[0]||null);setVoiceRightsApproved(false)}} />
    </label>
    {voiceFile&&<><span>Selected: {voiceFile.name}</span><label><input type="checkbox" checked={voiceRightsApproved} onChange={e=>setVoiceRightsApproved(e.target.checked)} /> I own this recording or have documented permission to synchronize it into a StreetVerse video.</label></>}
    <small>Voice is mixed into the exported file only when selected and approved. The browser's text-to-speech preview is not recorded.</small>
  </div>
  <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}><button style={buttonStyle} disabled={busy||episode.scenes.length===0||Boolean(voiceFile&&!voiceRightsApproved)} onClick={render}>RENDER ORIGINAL 18-SECOND MOVIE CLIP</button>{busy&&progress>0&&<span>Encoding {progress}%</span>}</div>
  {video&&<div style={{display:'grid',gap:10}}><video controls playsInline src={video.url} style={{maxWidth:680,width:'100%',borderRadius:10}}/><div style={{display:'flex',flexWrap:'wrap',gap:10}}><a href={video.url} download={video.fileName} style={{...buttonStyle,textDecoration:'none'}}>DOWNLOAD RENDERED VIDEO</a><button style={buttonStyle} onClick={handoff}>SEND VIDEO INTO HOLO REEL STUDIO</button></div></div>}
  <p role="status" aria-live="polite">{status}</p><small>Draft output only: no celebrity clones, live payouts, unauthorized posting, or full 30-minute 3D film. Human creator approval required.</small>
 </section>
}
