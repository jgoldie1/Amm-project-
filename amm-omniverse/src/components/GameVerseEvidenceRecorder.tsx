import {useEffect,useRef,useState} from 'react'
const control:React.CSSProperties={minHeight:50,padding:'10px 14px',border:'1px solid #6deaff',borderRadius:12,background:'#092b3f',color:'#fff',fontWeight:900}
export default function GameVerseEvidenceRecorder({onClose}:{onClose:()=>void}){
 const streamRef=useRef<MediaStream|null>(null),recorderRef=useRef<MediaRecorder|null>(null),chunksRef=useRef<Blob[]>([]),timerRef=useRef<ReturnType<typeof setTimeout>|null>(null)
 const [recording,setRecording]=useState(false),[url,setUrl]=useState(''),[message,setMessage]=useState('Choose START, approve sharing this browser tab, then play your GameVerse test.')
 useEffect(()=>()=>{if(timerRef.current)clearTimeout(timerRef.current);streamRef.current?.getTracks().forEach(t=>t.stop());recorderRef.current?.state==='recording'&&recorderRef.current.stop()},[])
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url)},[url])
 const stop=()=>{if(timerRef.current){clearTimeout(timerRef.current);timerRef.current=null}const rec=recorderRef.current;if(rec?.state==='recording')rec.stop()}
 const start=async()=>{
  try{
   if(!navigator.mediaDevices?.getDisplayMedia||typeof MediaRecorder==='undefined')throw new Error('Screen capture is unavailable on this device/browser.')
   if(url){URL.revokeObjectURL(url);setUrl('')}
   const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false})
   streamRef.current=stream;chunksRef.current=[]
   const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x))
   const rec=new MediaRecorder(stream,mime?{mimeType:mime}:undefined)
   recorderRef.current=rec
   rec.ondataavailable=e=>{if(e.data.size>0)chunksRef.current.push(e.data)}
   rec.onstop=()=>{
    if(timerRef.current){clearTimeout(timerRef.current);timerRef.current=null}
    stream.getTracks().forEach(t=>t.stop())
    const blob=new Blob(chunksRef.current,{type:rec.mimeType||'video/webm'})
    if(blob.size){const videoUrl=URL.createObjectURL(blob);setUrl(videoUrl);setMessage('Video captured locally. Save it to your device.')}else setMessage('No video data captured; retry.')
    setRecording(false)
   }
   stream.getVideoTracks()[0]?.addEventListener('ended',stop,{once:true})
   rec.start(500);setRecording(true);setMessage('Recording this browser tab with your permission. Auto-stops after 45 seconds.')
   timerRef.current=setTimeout(stop,45000)
  }catch(e){setMessage(e instanceof Error?e.message:'Could not start recording.');setRecording(false);streamRef.current?.getTracks().forEach(t=>t.stop())}
 }
 return <div role="dialog" aria-modal="true" aria-label="GameVerse one-push video evidence recorder" style={{position:'fixed',inset:0,zIndex:20000,padding:16,background:'#06121cf4',color:'#fff',fontFamily:'system-ui',overflowY:'auto'}}>
  <div style={{maxWidth:600,margin:'auto',display:'grid',gap:14}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><strong>🎥 GAMEVERSE TEST RECORDER</strong><button style={control} disabled={recording} onClick={onClose}>CLOSE</button></header>
   <p>Use browser screen sharing to choose only the GameVerse tab. This records a local clip for acceptance evidence, not a server stream or public Reel. Avoid recording sensitive account screens.</p>
   <div style={{display:'flex',gap:9,flexWrap:'wrap'}}><button style={control} onClick={start} disabled={recording}>START 45s RECORDING</button><button style={control} onClick={stop} disabled={!recording}>STOP RECORDING</button></div>
   <div role="status" aria-live="polite">{message}</div>
   {url&&<><video src={url} controls playsInline style={{width:'100%',maxHeight:320,background:'#000'}}/><a href={url} download="tryamm-gameverse-one-push-evidence.webm" style={{...control,textAlign:'center',textDecoration:'none',display:'block'}}>DOWNLOAD VIDEO (.webm)</a></>}
  </div>
 </div>
}
