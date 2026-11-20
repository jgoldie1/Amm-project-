import {useEffect,useRef,useState} from 'react'

type Props={onRecorded:(recording:File)=>void;disabled?:boolean}
type Capture='camera'|'screen'
const MAX_MS=300_000

export default function CrossVerseSourceRecorder({onRecorded,disabled=false}:Props){
  const [recording,setRecording]=useState(false)
  const [error,setError]=useState('')
  const [capture,setCapture]=useState<Capture>('camera')
  const [elapsed,setElapsed]=useState(0)
  const state=useRef<{recorder:MediaRecorder;stream:MediaStream;timer:number;tick:number}|null>(null)
  const started=useRef(0)
  useEffect(()=>()=>{const s=state.current;if(s){clearTimeout(s.timer);clearInterval(s.tick);if(s.recorder.state==='recording')s.recorder.stop();s.stream.getTracks().forEach(t=>t.stop())}},[])
  async function start(){
    if(state.current||disabled)return
    setError('')
    if(!navigator.mediaDevices||!window.MediaRecorder){setError('Recording is not supported in this browser. Import a video instead.');return}
    let stream:MediaStream|null=null
    try{
      stream=capture==='screen'
        ?await navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
        :await navigator.mediaDevices.getUserMedia({video:true,audio:true})
      const mime=['video/webm;codecs=vp8,opus','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x))
      if(!mime)throw new Error('This browser does not support WebM recording')
      const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:1_500_000})
      const chunks:Blob[]=[]
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
      recorder.onerror=()=>setError('Recording failed. No video was uploaded.')
      recorder.onstop=()=>{
        const current=state.current
        if(current){clearTimeout(current.timer);clearInterval(current.tick)}
        stream?.getTracks().forEach(t=>t.stop())
        state.current=null;setRecording(false)
        if(chunks.length){
          const file=new File([new Blob(chunks,{type:mime})],'crossverse-recording-'+Date.now()+'.webm',{type:mime})
          onRecorded(file)
        }else setError('No usable recorded video was captured')
      }
      // Screen-share "stop sharing" also stops local recording.
      stream.getVideoTracks()[0]?.addEventListener('ended',()=>{if(recorder.state==='recording')recorder.stop()},{once:true})
      recorder.start(250)
      started.current=Date.now();setElapsed(0)
      state.current={
        recorder,stream,
        timer:window.setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},MAX_MS),
        tick:window.setInterval(()=>setElapsed(Math.floor((Date.now()-started.current)/1000)),1000),
      }
      setRecording(true)
    }catch(e){
      stream?.getTracks().forEach(t=>t.stop())
      setError(e instanceof Error?e.message:'Camera or screen permission was denied')
    }
  }
  function stop(){const s=state.current;if(s?.recorder.state==='recording')s.recorder.stop()}
  const btn:React.CSSProperties={minHeight:48,borderRadius:12,border:'1px solid #58b6d1',background:'#17475a',color:'#fff',padding:'10px 16px',fontWeight:800}
  return <div style={{padding:12,border:'1px solid #2a556a',borderRadius:12,marginBottom:12}}>
    <strong>RECORD VIDEO — LOCAL ONLY (MAX 5 MIN)</strong>
    <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
      <button type="button" style={btn} disabled={disabled||recording} aria-pressed={capture==='camera'} onClick={()=>setCapture('camera')}>CAMERA</button>
      <button type="button" style={btn} disabled={disabled||recording} aria-pressed={capture==='screen'} onClick={()=>setCapture('screen')}>SCREEN</button>
    </div>
    <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
      {!recording?<button type="button" disabled={disabled} style={btn} onClick={()=>void start()}>START LOCAL RECORDING</button>
        :<button type="button" style={{...btn,background:'#782931'}} onClick={stop}>STOP AND SEND TO CLIP EDITOR</button>}
    </div>
    {recording&&<p role="status">Recording {elapsed}s / 300s. Stop to edit. This does not livestream or upload.</p>}
    {error&&<p role="alert" style={{color:'#ffd1b6'}}>{error}</p>}
    <p style={{fontSize:12,color:'#b4c9d2'}}>Camera/screen permissions require your approval. Browser capture may be unavailable on some phones. Recordings remain local until you explicitly choose another action.</p>
  </div>
}
