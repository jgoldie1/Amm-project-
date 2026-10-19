import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

// The spatial desk is intentionally local-first. It never transmits microphone audio,
// starts a broadcast, or charges a user. Exported audio must be explicitly published elsewhere.
type Clip={id:number;name:string;buffer:AudioBuffer;azimuth:number;distance:number;gain:number;muted:boolean}
type Playing={id:number;source:AudioBufferSourceNode;gain:GainNode;panner:PannerNode}
type XRMode='immersive-vr'|'immersive-ar'
type XRSystemLike={
 isSessionSupported:(mode:XRMode)=>Promise<boolean>
 requestSession:(mode:XRMode,options?:{optionalFeatures?:string[]})=>Promise<unknown>
}
const MAX_TRACKS=64
const MAX_FILE_BYTES=25*1024*1024
const field:React.CSSProperties={borderRadius:10,border:'1px solid #345065',background:'#0b1723',color:'#eef7ff',minHeight:44,padding:'8px 10px'}
const button:React.CSSProperties={...field,cursor:'pointer',fontWeight:800}
function position(panner:PannerNode,azimuth:number,distance:number){
 const radians=azimuth*Math.PI/180
 panner.positionX.value=Math.sin(radians)*distance
 panner.positionY.value=0
 panner.positionZ.value=-Math.cos(radians)*distance
}
function chooseMime(){
 if(typeof MediaRecorder==='undefined')return ''
 return ['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m))||''
}
export default function SpatialXRDAW(){
 const [clips,setClips]=useState<Clip[]>([])
 const clipsRef=useRef<Clip[]>([])
 const [message,setMessage]=useState('Upload short audio stems to position them around the listener.')
 const [isPlaying,setIsPlaying]=useState(false)
 const [recording,setRecording]=useState(false)
 const [download,setDownload]=useState<{url:string;mime:string}|null>(null)
 const [xrSupport,setXrSupport]=useState({vr:false,ar:false})
 const [xrMode,setXrMode]=useState<XRMode|null>(null)
 const contextRef=useRef<AudioContext|null>(null)
 const masterRef=useRef<GainNode|null>(null)
 const printRef=useRef<MediaStreamAudioDestinationNode|null>(null)
 const playingRef=useRef<Playing[]>([])
 const recordRef=useRef<MediaRecorder|null>(null)
 const recordChunksRef=useRef<Blob[]>([])
 const micRef=useRef<MediaStream|null>(null)
 const micNodeRef=useRef<MediaStreamAudioSourceNode|null>(null)
 const urlRef=useRef<string|null>(null)
 const nextId=useRef(1)
 const canvasRef=useRef<HTMLDivElement|null>(null)
 const rendererRef=useRef<THREE.WebGLRenderer|null>(null)
 const sceneRef=useRef<THREE.Scene|null>(null)
 const stageRef=useRef<THREE.Group|null>(null)
 const xrSessionRef=useRef<{end:()=>Promise<void>}|null>(null)
 const statusRef=useRef({playing:false})
 const enableAudio=async()=>{
  let ctx=contextRef.current
  if(!ctx){
   ctx=new AudioContext()
   const master=ctx.createGain()
   const print=ctx.createMediaStreamDestination()
   master.gain.value=0.7
   master.connect(ctx.destination)
   master.connect(print)
   contextRef.current=ctx
   masterRef.current=master
   printRef.current=print
  }
  await ctx.resume()
  return ctx
 }
 const stopPlayback=()=>{
  for(const item of playingRef.current){
   try{item.source.stop()}catch{}
   item.source.disconnect();item.panner.disconnect();item.gain.disconnect()
  }
  playingRef.current=[]
  statusRef.current.playing=false
  setIsPlaying(false)
 }
 const play=async()=>{
  try{
   if(statusRef.current.playing){stopPlayback();return}
   const ctx=await enableAudio()
   if(!clipsRef.current.length){setMessage('Import at least one audio stem.');return}
   const start=ctx.currentTime+0.08
   const active:Playing[]=[]
   for(const clip of clipsRef.current){
    if(clip.muted)continue
    const source=ctx.createBufferSource()
    const gain=ctx.createGain()
    const panner=ctx.createPanner()
    source.buffer=clip.buffer
    source.loop=true
    panner.panningModel='HRTF'
    panner.distanceModel='inverse'
    panner.refDistance=1
    panner.maxDistance=30
    panner.rolloffFactor=0.35
    position(panner,clip.azimuth,clip.distance)
    gain.gain.value=clip.gain
    source.connect(gain);gain.connect(panner);panner.connect(masterRef.current!)
    source.start(start)
    active.push({id:clip.id,source,gain,panner})
   }
   if(!active.length){setMessage('Unmute a track before pressing Play.');return}
   playingRef.current=active
   statusRef.current.playing=true
   setIsPlaying(true)
   setMessage('Spatial stems are playing locally. Use headphones to hear positioning.')
  }catch(e){setMessage('Audio playback unavailable: '+String(e))}
 }
 const importFiles=async(files:FileList|null)=>{
  if(!files?.length)return
  try{
   const ctx=await enableAudio()
   const room=MAX_TRACKS-clipsRef.current.length
   if(room<=0){setMessage('The 64-track limit has been reached.');return}
   const added:Clip[]=[]
   for(const file of Array.from(files).slice(0,room)){
    if(file.size>MAX_FILE_BYTES){setMessage('Skipped '+file.name+': use an audio stem smaller than 25 MB.');continue}
    try{
     const buf=await ctx.decodeAudioData(await file.arrayBuffer())
     added.push({id:nextId.current++,name:file.name.slice(0,80),buffer:buf,azimuth:0,distance:2,gain:0.8,muted:false})
    }catch{setMessage('Skipped '+file.name+': unsupported audio format.')}
   }
   if(added.length){
    const updated=[...clipsRef.current,...added]
    clipsRef.current=updated;setClips(updated)
    stopPlayback()
    setMessage('Imported '+added.length+' stem(s). Play and record the mix locally.')
   }
  }catch(e){setMessage('Audio import unavailable: '+String(e))}
 }
 const modify=(id:number,change:Partial<Pick<Clip,'azimuth'|'distance'|'gain'|'muted'>>)=>{
  const updated=clipsRef.current.map(c=>c.id===id?{...c,...change}:c)
  clipsRef.current=updated;setClips(updated)
  const clip=updated.find(c=>c.id===id)
  const active=playingRef.current.find(p=>p.id===id)
  if(active&&clip){active.gain.gain.value=clip.muted?0:clip.gain;position(active.panner,clip.azimuth,clip.distance)}
 }
 const cleanupMicrophone=()=>{
  try{micNodeRef.current?.disconnect()}catch{}
  micNodeRef.current=null
  micRef.current?.getTracks().forEach(t=>t.stop())
  micRef.current=null
 }
 const startRecord=async(includeMic:boolean)=>{
  if(recordRef.current?.state==='recording')return
  try{
   const ctx=await enableAudio()
   if(typeof MediaRecorder==='undefined'||!printRef.current)throw Error('MediaRecorder is not supported in this browser.')
   if(!statusRef.current.playing&&clipsRef.current.length)await play()
   if(!statusRef.current.playing&&!includeMic){setMessage('Import and play an audio stem first.');return}
   // Microphone connects to the print bus only; speaker monitoring is intentionally off to prevent feedback.
   if(includeMic){
    const mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})
    micRef.current=mic
    const source=ctx.createMediaStreamSource(mic)
    source.connect(printRef.current)
    micNodeRef.current=source
   }
   const mime=chooseMime()
   const recorder=mime?new MediaRecorder(printRef.current.stream,{mimeType:mime}):new MediaRecorder(printRef.current.stream)
   recordChunksRef.current=[]
   recorder.ondataavailable=e=>{if(e.data.size)recordChunksRef.current.push(e.data)}
   recorder.onerror=()=>{setMessage('Recording failed. Try a shorter take.');setRecording(false);cleanupMicrophone()}
   recorder.onstop=()=>{
    const type=recorder.mimeType||mime||'audio/webm'
    const blob=new Blob(recordChunksRef.current,{type})
    if(urlRef.current)URL.revokeObjectURL(urlRef.current)
    const url=URL.createObjectURL(blob);urlRef.current=url
    setDownload({url,mime:type});setRecording(false);cleanupMicrophone()
    setMessage(blob.size?'Mix recorded locally. Save the file before closing the studio.':'No audio was captured.')
   }
   recorder.start(250)
   recordRef.current=recorder
   setRecording(true)
   setMessage(includeMic?'Recording spatial mix + microphone (mic not sent to speakers).':'Recording spatial mix. No microphone used.')
  }catch(e){cleanupMicrophone();setMessage('Recording could not start: '+String(e))}
 }
 const stopRecord=()=>{
  if(recordRef.current?.state==='recording')recordRef.current.stop()
  cleanupMicrophone()
 }
 useEffect(()=>{
  let cancelled=false
  const xr=(navigator as Navigator&{xr?:XRSystemLike}).xr
  if(xr&&window.isSecureContext){
   Promise.all([xr.isSessionSupported('immersive-vr'),xr.isSessionSupported('immersive-ar')].map(p=>p.catch(()=>false)))
    .then(([vr,ar])=>{if(!cancelled)setXrSupport({vr,ar})})
  }
  return()=>{cancelled=true}
 },[])
 useEffect(()=>{
  const mount=canvasRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}
  catch{setMessage('3D graphics are unavailable; spatial audio controls still work.');return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5))
  renderer.setSize(mount.clientWidth||350,260)
  renderer.xr.enabled=true
  renderer.xr.setReferenceSpaceType('local')
  mount.appendChild(renderer.domElement);rendererRef.current=renderer
  const scene=new THREE.Scene();scene.background=new THREE.Color('#081724');sceneRef.current=scene
  scene.add(new THREE.HemisphereLight(0xe8ffff,0x26374f,2))
  const camera=new THREE.PerspectiveCamera(65,(mount.clientWidth||350)/260,0.01,100)
  camera.position.set(0,2,6);camera.lookAt(0,0,-1)
  const stage=new THREE.Group();stageRef.current=stage;scene.add(stage)
  const listener=new THREE.Mesh(new THREE.SphereGeometry(0.28,16,12),new THREE.MeshStandardMaterial({color:'#fedc83'}))
  stage.add(listener)
  const grid=new THREE.GridHelper(12,12,0x295576,0x1b374a)
  grid.position.y=-0.55;scene.add(grid)
  const resize=()=>{
   const width=mount.clientWidth||350
   renderer.setSize(width,260);camera.aspect=width/260;camera.updateProjectionMatrix()
  }
  const observer=new ResizeObserver(resize);observer.observe(mount)
  renderer.setAnimationLoop(()=>{stage.rotation.y+=0.00055;renderer.render(scene,camera)})
  return()=>{
   renderer.setAnimationLoop(null);observer.disconnect()
   for(const child of [...stage.children]){
    if(child instanceof THREE.Mesh){child.geometry.dispose();(child.material as THREE.Material).dispose()}
   }
   grid.geometry.dispose();(grid.material as THREE.Material).dispose()
   renderer.dispose();renderer.domElement.remove()
   rendererRef.current=null;sceneRef.current=null;stageRef.current=null
  }
 },[])
 useEffect(()=>{
  const group=stageRef.current
  if(!group)return
  for(const child of [...group.children].slice(1)){
   if(child instanceof THREE.Mesh){child.geometry.dispose();(child.material as THREE.Material).dispose()}
   group.remove(child)
  }
  for(const clip of clips.slice(0,64)){
   const radians=clip.azimuth*Math.PI/180
   const obj=new THREE.Mesh(new THREE.SphereGeometry(0.18,12,8),
    new THREE.MeshStandardMaterial({color:clip.muted?'#586477':'#55ebdc',emissive:clip.muted?'#061018':'#006b74',emissiveIntensity:0.45}))
   obj.position.set(Math.sin(radians)*clip.distance*0.38,0,-Math.cos(radians)*clip.distance*0.38)
   group.add(obj)
  }
 },[clips])
 const enterXR=async(mode:XRMode)=>{
  const xr=(navigator as Navigator&{xr?:XRSystemLike}).xr
  const renderer=rendererRef.current
  if(!xr||!renderer){setMessage('WebXR or a WebGL renderer is unavailable on this device.');return}
  try{
   const session=await xr.requestSession(mode,{optionalFeatures:['local-floor']})
   xrSessionRef.current=session as {end:()=>Promise<void>}
   const onEnd=()=>{setXrMode(null);xrSessionRef.current=null;if(sceneRef.current)sceneRef.current.background=new THREE.Color('#081724')}
   ;(session as {addEventListener:(name:string,cb:()=>void)=>void}).addEventListener('end',onEnd)
   if(sceneRef.current)sceneRef.current.background=mode==='immersive-ar'?null:new THREE.Color('#081724')
   await renderer.xr.setSession(session as Parameters<typeof renderer.xr.setSession>[0])
   setXrMode(mode);setMessage(mode==='immersive-ar'?'AR passthrough studio opened where supported.':'VR spatial studio opened.')
  }catch(e){setMessage('Could not enter XR mode: '+String(e));if(sceneRef.current)sceneRef.current.background=new THREE.Color('#081724')}
 }
 useEffect(()=>()=>{try{recordRef.current?.stop()}catch{};cleanupMicrophone()
  playingRef.current.forEach(p=>{try{p.source.stop()}catch{};p.source.disconnect();p.gain.disconnect();p.panner.disconnect()})
  void xrSessionRef.current?.end().catch(()=>{})
  void contextRef.current?.close().catch(()=>{})
  if(urlRef.current)URL.revokeObjectURL(urlRef.current)
 },[])
 return <section aria-label="Aniyah AR VR mixed reality spatial DAW" style={{padding:14,maxWidth:1040,margin:'0 auto',color:'#eaf8ff'}}>
  <h2 style={{fontSize:23,margin:'8px 0'}}>Spatial Studio • AR / VR / MR DAW</h2>
  <p style={{fontSize:12,color:'#a1b7c9',lineHeight:1.6}}>Position audio stems in a 3D soundstage, preview on any supported browser, record a stereo spatial mix, and optionally add your microphone. All audio stays on this device unless you choose to export it.</p>
  <div ref={canvasRef} aria-label="3D spatial audio stage preview" style={{width:'100%',height:260,border:'1px solid #315768',borderRadius:14,overflow:'hidden',background:'#081724'}}/>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
   <button style={button} disabled={!xrSupport.vr} onClick={()=>void enterXR('immersive-vr')}>Enter VR {xrSupport.vr?'':'(unavailable)'}</button>
   <button style={button} disabled={!xrSupport.ar} onClick={()=>void enterXR('immersive-ar')}>Enter AR / MR {xrSupport.ar?'':'(unavailable)'}</button>
   {xrMode&&<button style={button} onClick={()=>void xrSessionRef.current?.end()}>Exit headset mode</button>}
   <label style={{...button,display:'inline-flex',alignItems:'center',gap:8}}>＋ Import audio stems <input aria-label="Import audio stems" type="file" accept="audio/*" multiple onChange={e=>{void importFiles(e.target.files);e.target.value=''}} style={{maxWidth:125}}/></label>
  </div>
  <p style={{color:'#9ac9ce',fontSize:11}}>WebXR depends on headset/browser support and HTTPS. On iPhone, the regular 3D preview and audio controls remain available even without WebXR. Use headphones for spatial monitoring.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
   <button style={button} onClick={()=>void play()}>{isPlaying?'■ Stop playback':'▶ Play spatial mix'}</button>
   {!recording?<><button style={button} onClick={()=>void startRecord(false)}>● Record mix</button><button style={button} onClick={()=>void startRecord(true)}>● Record mix + mic</button></>:<button style={{...button,borderColor:'#ff7c83'}} onClick={stopRecord}>■ Stop recording</button>}
   {download&&<a style={{...button,display:'inline-flex',alignItems:'center'}} href={download.url} download={'aniyah-spatial-mix.'+(download.mime.includes('mp4')?'m4a':'webm')}>↓ Save recorded mix</a>}
  </div>
  <p role="status" aria-live="polite" style={{fontSize:12,color:'#ffd98b'}}>{message}</p>
  <h3>Spatial tracks ({clips.length}/{MAX_TRACKS})</h3>
  <div style={{display:'grid',gap:10}}>
  {clips.map(clip=><div key={clip.id} style={{border:'1px solid #305064',padding:10,borderRadius:12,background:'#0b1722'}}>
    <strong style={{fontSize:12}}>{clip.id}. {clip.name}</strong>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8,marginTop:8}}>
    <label style={{fontSize:11}}>Position {clip.azimuth}°<input style={{width:'100%'}} type="range" min={-180} max={180} value={clip.azimuth} onChange={e=>modify(clip.id,{azimuth:Number(e.target.value)})}/></label>
    <label style={{fontSize:11}}>Distance {clip.distance.toFixed(1)} m<input style={{width:'100%'}} type="range" min={0.5} max={12} step={0.5} value={clip.distance} onChange={e=>modify(clip.id,{distance:Number(e.target.value)})}/></label>
    <label style={{fontSize:11}}>Level {Math.round(clip.gain*100)}%<input style={{width:'100%'}} type="range" min={0} max={1} step={0.05} value={clip.gain} onChange={e=>modify(clip.id,{gain:Number(e.target.value)})}/></label>
    <button style={button} onClick={()=>modify(clip.id,{muted:!clip.muted})}>{clip.muted?'Unmute':'Mute'}</button>
    </div>
   </div>)}
  </div>
  <p style={{fontSize:11,color:'#829aaa'}}>This initial XR workspace plays synchronized looping stems and records a stereo mix. It does not yet provide head-tracked binaural export, timeline editing, object-based Atmos mastering, cloud project persistence, or video compositing. Save your take before leaving.</p>
 </section>
}
