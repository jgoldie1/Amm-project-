import {useEffect,useRef,useState} from 'react'
type Props={onClose:()=>void;onPhotoCaptured?:(photo:{name:string;capturedAt:string})=>void}
export default function StreetVersePhotoCamera({onClose,onPhotoCaptured}:Props){
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null)
 const [status,setStatus]=useState('Requesting camera permission…')
 const [preview,setPreview]=useState<string|null>(null)
 const [facing,setFacing]=useState<'user'|'environment'>('environment')
 useEffect(()=>{
  let active=true
  const start=async()=>{
   if(!navigator.mediaDevices?.getUserMedia){setStatus('Camera requires HTTPS or localhost and a supported browser.');return}
   try{
    const media=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720}}})
    if(!active){media.getTracks().forEach(t=>t.stop());return}
    stream.current=media
    if(video.current){video.current.srcObject=media;await video.current.play().catch(()=>{})}
    setStatus('Camera ready. Capture a photo for Aniyah’s mission.')
   }catch{if(active)setStatus('Camera unavailable or permission denied. You can still upload a photo.')}
  }
  void start()
  return()=>{active=false;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null}
 },[facing])
 const capture=()=>{
  const v=video.current;if(!v||!v.videoWidth){setStatus('Wait for camera preview before capturing.');return}
  const canvas=document.createElement('canvas');canvas.width=v.videoWidth;canvas.height=v.videoHeight
  const ctx=canvas.getContext('2d');if(!ctx){setStatus('Photo capture unsupported.');return}
  ctx.drawImage(v,0,0)
  setPreview(canvas.toDataURL('image/jpeg',.88));setStatus('Photo captured locally. Save it to your device to keep it.')
 }
 const save=()=>{
  if(!preview)return
  const name='streetverse-aniyah-photo-'+Date.now()+'.jpg'
  const a=document.createElement('a');a.href=preview;a.download=name;a.click()
  onPhotoCaptured?.({name,capturedAt:new Date().toISOString()})
  setStatus('Photo download requested. Confirm it appears in your device downloads.')
 }
 const upload=(file?:File)=>{
  if(!file||!file.type.startsWith('image/')){setStatus('Choose an image file.');return}
  if(file.size>15*1024*1024){setStatus('Photo must be 15 MB or smaller.');return}
  const reader=new FileReader();reader.onload=()=>{if(typeof reader.result==='string'){setPreview(reader.result);setStatus('Photo selected. Save a copy if needed.')}};reader.onerror=()=>setStatus('Unable to read photo.');reader.readAsDataURL(file)
 }
 return <section role="dialog" aria-modal="true" aria-label="Aniyah mission photo camera" style={{position:'fixed',inset:0,zIndex:20000,background:'#07101b',color:'white',padding:16,overflow:'auto'}}>
  <div style={{maxWidth:620,margin:'auto'}}>
   <h2>Aniyah’s Photo Mission</h2>
   <p role="status">{status}</p>
   <video ref={video} muted playsInline autoPlay style={{display:preview?'none':'block',width:'100%',maxHeight:'55vh',objectFit:'contain',background:'#111'}}/>
   {preview&&<img src={preview} alt="Captured mission photo preview" style={{width:'100%',maxHeight:'55vh',objectFit:'contain'}}/>}
   <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:12}}>
    <button type="button" onClick={capture} style={btn}>📷 Take Photo</button>
    <button type="button" onClick={()=>{setPreview(null);stream.current?.getTracks().forEach(t=>t.stop());setFacing(v=>v==='user'?'environment':'user')}} style={btn}>Switch Camera</button>
    <label style={btn}>Upload Photo <input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0])} style={{maxWidth:160}}/></label>
    <button type="button" onClick={save} disabled={!preview} style={btn}>Save Photo</button>
    <button type="button" onClick={onClose} style={btn}>Close</button>
   </div>
   <p style={{fontSize:12}}>Photos remain on your device until you choose to save or share them. No automatic upload, face recognition or public posting. Mission rewards require separate server verification.</p>
  </div>
 </section>
}
const btn:React.CSSProperties={minHeight:44,padding:'10px 14px',borderRadius:10,border:'1px solid #7aa2c4',background:'#172b42',color:'#fff',cursor:'pointer'}
