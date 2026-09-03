import {useEffect,useRef,useState} from 'react'

export default function StreetVerseReelRecorder({open,onClose}:{open:boolean;onClose:()=>void}){
 const videoRef=useRef<HTMLVideoElement|null>(null)
 const streamRef=useRef<MediaStream|null>(null)
 const recorderRef=useRef<MediaRecorder|null>(null)
 const chunksRef=useRef<Blob[]>([])
 const [recording,setRecording]=useState(false)
 const [url,setUrl]=useState('')
 const [error,setError]=useState('')

 const stopStream=()=>{streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null}
 useEffect(()=>()=>{stopStream();if(url)URL.revokeObjectURL(url)},[url])
 if(!open)return null

 const startCamera=async()=>{
  setError('');setUrl('')
  try{
   const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:true})
   streamRef.current=stream
   if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play()}
   if(typeof MediaRecorder==='undefined'){setError('Recorder not available here. Use the iPhone capture button below.');return}
   const mime=['video/mp4','video/webm;codecs=vp9,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported?.(x))
   const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined)
   recorderRef.current=recorder;chunksRef.current=[]
   recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)}
   recorder.onstop=()=>{const blob=new Blob(chunksRef.current,{type:recorder.mimeType||'video/webm'});const next=URL.createObjectURL(blob);setUrl(next);setRecording(false);stopStream()}
   recorder.start(500);setRecording(true)
  }catch(e){setError(e instanceof Error?e.message:'Camera access failed')}
 }
 const stopRecording=()=>recorderRef.current?.state!=='inactive'&&recorderRef.current?.stop()
 const share=async()=>{
  if(!url)return
  try{const blob=await fetch(url).then(r=>r.blob());const file=new File([blob],`streetverse-reel-${Date.now()}.${blob.type.includes('mp4')?'mp4':'webm'}`,{type:blob.type});if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'StreetVerse Reel'});return}const a=document.createElement('a');a.href=url;a.download=file.name;a.click()}catch{setError('Share/save failed. Try the native capture option.')}
 }
 return <div style={{position:'fixed',inset:0,zIndex:22000,background:'#02050af4',color:'#fff',fontFamily:'system-ui',padding:16,overflow:'auto'}}>
  <div style={{maxWidth:620,margin:'0 auto'}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><b>STREETVERSE REEL</b><div style={{fontSize:12,color:'#8effb7'}}>Camera • record • save • share</div></div><button onClick={()=>{stopStream();onClose()}} style={btn}>×</button></div>
   <video ref={videoRef} playsInline muted style={{width:'100%',aspectRatio:'9/16',maxHeight:'70vh',marginTop:12,background:'#000',borderRadius:16,objectFit:'cover'}}/>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
    {!recording?<button onClick={startCamera} style={btn}>● START RECORDING</button>:<button onClick={stopRecording} style={btn}>■ STOP</button>}
    {url&&<button onClick={share} style={btn}>SAVE / SHARE</button>}
    <label style={btn}>IPHONE CAPTURE<input type='file' accept='video/*' capture='environment' style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(f){if(url)URL.revokeObjectURL(url);setUrl(URL.createObjectURL(f))}}}/></label>
   </div>
   {error&&<p role='alert' style={{color:'#ffd27a'}}>{error}</p>}
   <p style={{fontSize:12,color:'#b9c7d3'}}>On Safari/iPhone, use IPHONE CAPTURE if browser recording is unavailable. Videos stay local until you choose save/share; cloud publishing is a separate upload step.</p>
  </div>
 </div>
}

const btn:React.CSSProperties={border:'1px solid #557187',borderRadius:12,padding:'11px 13px',background:'#0b1520',color:'#fff',fontWeight:900,cursor:'pointer',textDecoration:'none'}
