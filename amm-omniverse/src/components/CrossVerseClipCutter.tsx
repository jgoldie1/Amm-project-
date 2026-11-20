import {useEffect,useRef,useState} from 'react'
import CrossVerseSourceRecorder from './CrossVerseSourceRecorder'

type Shape='vertical'|'landscape'
type VideoWithCapture=HTMLVideoElement&{captureStream?:()=>MediaStream}

const LIMIT_SECONDS=300
const MAX_FILE_BYTES=300*1024*1024
const aspect={vertical:{width:480,height:854},landscape:{width:854,height:480}} as const

export default function CrossVerseClipCutter(){
  const videoRef=useRef<HTMLVideoElement|null>(null)
  const sourceRef=useRef<string|null>(null)
  const resultRef=useRef<string|null>(null)
  const activeRef=useRef(false)
  const [shape,setShape]=useState<Shape>('vertical')
  const [fileName,setFileName]=useState('')
  const [start,setStart]=useState(0)
  const [seconds,setSeconds]=useState(60)
  const [duration,setDuration]=useState(0)
  const [busy,setBusy]=useState(false)
  const [output,setOutput]=useState('')
  const [exportShape,setExportShape]=useState<Shape>('vertical')
  const [exportBytes,setExportBytes]=useState(0)
  const [message,setMessage]=useState('Choose a video you own or are authorized to edit. Files stay on this device.')
  const clearOutput=()=>{if(resultRef.current){URL.revokeObjectURL(resultRef.current);resultRef.current=null}setOutput('')}
  useEffect(()=>()=>{activeRef.current=false;if(sourceRef.current)URL.revokeObjectURL(sourceRef.current);if(resultRef.current)URL.revokeObjectURL(resultRef.current)},[])

  function chooseFile(file?:File){
    if(busy)return
    clearOutput()
    if(sourceRef.current){URL.revokeObjectURL(sourceRef.current);sourceRef.current=null}
    if(!file){setFileName('');return}
    if(!file.type.startsWith('video/')||file.size>MAX_FILE_BYTES){
      setFileName('')
      setMessage('Choose a supported video file smaller than 300 MB.')
      return
    }
    const url=URL.createObjectURL(file)
    sourceRef.current=url
    setFileName(file.name)
    setStart(0);setDuration(0)
    if(videoRef.current){videoRef.current.src=url;videoRef.current.load()}
    setMessage('Set the beginning and length, then export a local WebM clip.')
  }

  async function exportClip(){
    const video=videoRef.current as VideoWithCapture|null
    if(!video||!sourceRef.current||!Number.isFinite(duration)||duration<=0||busy)return
    if(!('MediaRecorder' in window)||!HTMLCanvasElement.prototype.captureStream){
      setMessage('This browser cannot export clips with MediaRecorder and canvas capture. Use a supported desktop Chrome browser.')
      return
    }
    setBusy(true);activeRef.current=true;clearOutput()
    let canvasStream:MediaStream|null=null
    let recordingStream:MediaStream|null=null
    let recorder:MediaRecorder|null=null
    let frame=0
    let started=false
    try{
      const width=aspect[shape].width,height=aspect[shape].height
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height
      const ctx=canvas.getContext('2d',{alpha:false})
      if(!ctx)throw new Error('Canvas unavailable on this device')
      const end=Math.min(duration,start+Math.min(LIMIT_SECONDS,seconds))
      if(end<=start)throw new Error('Clip range is empty')
      video.pause()
      video.currentTime=Math.min(start,Math.max(0,duration-.01))
      await new Promise<void>((resolve,reject)=>{
        if(video.seeking){video.addEventListener('seeked',()=>resolve(),{once:true});setTimeout(()=>reject(new Error('Video seek timed out')),8000)}
        else resolve()
      })
      const draw=()=>{
        if(!activeRef.current)return
        const vw=video.videoWidth,vh=video.videoHeight
        if(vw>0&&vh>0){
          const scale=Math.max(width/vw,height/vh),sw=width/scale,sh=height/scale
          ctx.drawImage(video,(vw-sw)/2,(vh-sh)/2,sw,sh,0,0,width,height)
        }
        frame=requestAnimationFrame(draw)
      }
      draw()
      canvasStream=canvas.captureStream(24)
      const audioTracks:MediaStreamTrack[]=[]
      if(typeof video.captureStream==='function'){
        try{audioTracks.push(...video.captureStream().getAudioTracks())}catch{/* Video-only fallback */ }
      }
      recordingStream=new MediaStream([...canvasStream.getVideoTracks(),...audioTracks])
      const mime=['video/webm;codecs=vp8,opus','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m))
      if(!mime)throw new Error('WebM encoding is not available in this browser')
      recorder=new MediaRecorder(recordingStream,{mimeType:mime,videoBitsPerSecond:1800000})
      const chunks:Blob[]=[]
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
      const finished=new Promise<Blob>((resolve,reject)=>{
        recorder!.onerror=()=>reject(new Error('Clip recording failed'))
        recorder!.onstop=()=>chunks.length?resolve(new Blob(chunks,{type:mime})):reject(new Error('No video data was recorded'))
      })
      recorder.start(250)
      started=true
      await video.play()
      await new Promise<void>((resolve,reject)=>{
        let done=false
        const finish=()=>{if(done)return;done=true;video.removeEventListener('timeupdate',watch);video.removeEventListener('ended',finish);resolve()}
        const watch=()=>{if(video.currentTime>=end-.04)finish()}
        video.addEventListener('timeupdate',watch)
        video.addEventListener('ended',finish)
        setTimeout(()=>{if(!done){video.removeEventListener('timeupdate',watch);video.removeEventListener('ended',finish);reject(new Error('Clip export timed out'))}},Math.max(12000,(end-start)*3000+8000))
      })
      video.pause()
      recorder.stop()
      const blob=await finished
      const url=URL.createObjectURL(blob)
      try{
        await new Promise<void>((resolve,reject)=>{
          const check=document.createElement('video')
          let settled=false
          const timer=window.setTimeout(()=>{if(!settled){settled=true;check.src='';reject(new Error('Exported WebM could not be verified on this device'))}},10000)
          check.onloadedmetadata=()=>{
            if(settled)return
            settled=true;clearTimeout(timer)
            const ok=check.videoWidth===width&&check.videoHeight===height
            check.src=''
            ok?resolve():reject(new Error('Exported WebM dimensions do not match '+width+'×'+height))
          }
          check.onerror=()=>{if(settled)return;settled=true;clearTimeout(timer);check.src='';reject(new Error('Exported WebM playback metadata could not be decoded'))}
          check.preload='metadata';check.src=url;check.load()
        })
      }catch(error){URL.revokeObjectURL(url);throw error}
      resultRef.current=url;setOutput(url);setExportShape(shape);setExportBytes(blob.size)
      setMessage('Local '+width+'×'+height+' WebM metadata validated. Download and play the file on your device before marking the device test complete.'+(audioTracks.length?' Audio capture requested.':' Audio unavailable from this browser source.'))
    }catch(e){
      if(started&&recorder?.state==='recording')recorder.stop()
      setMessage(e instanceof Error?e.message:'Clip export failed')
    }finally{
      activeRef.current=false
      cancelAnimationFrame(frame)
      video?.pause()
      recordingStream?.getTracks().forEach(t=>t.stop())
      canvasStream?.getTracks().forEach(t=>t.stop())
      setBusy(false)
    }
  }

  const button:React.CSSProperties={minHeight:48,borderRadius:12,padding:'10px 16px',background:'#17475a',color:'#fff',border:'1px solid #58b6d1',fontWeight:800}
  return <section aria-label="CrossVerse local clip generator" style={{background:'#07111bd9',border:'1px solid #244156',borderRadius:18,padding:16,marginTop:14}}>
    <h2 style={{margin:'0 0 8px'}}>CROSSVERSE CLIP GENERATOR</h2>
    <p style={{color:'#b2c5d0',fontSize:13}}>Trim your own recording into a vertical 9:16 or horizontal 16:9 WebM. Local WebM export up to 5 minutes; no automatic upload, captions, or publishing. Longer clips need more memory and may export in real time.</p>
    <CrossVerseSourceRecorder disabled={busy} onRecorded={chooseFile}/>
    <label style={{display:'block',marginBottom:12}}>Choose recording (maximum 300 MB)
      <input type="file" accept="video/*" onChange={e=>chooseFile(e.target.files?.[0])} disabled={busy} style={{display:'block',marginTop:8,maxWidth:'100%'}}/>
    </label>
    <video ref={videoRef} controls playsInline preload="metadata" onLoadedMetadata={e=>{const d=e.currentTarget.duration;setDuration(Number.isFinite(d)?d:0)}} style={{width:'100%',maxHeight:260,borderRadius:12,background:'#000'}}/>
    <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:12}}>
      <button type="button" disabled={busy} onClick={()=>setShape('vertical')} aria-pressed={shape==='vertical'} style={{...button,opacity:shape==='vertical'?1:.65}}>9:16 Vertical</button>
      <button type="button" disabled={busy} onClick={()=>setShape('landscape')} aria-pressed={shape==='landscape'} style={{...button,opacity:shape==='landscape'?1:.65}}>16:9 Landscape</button>
    </div>
    <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:12}}>
      <label>Start (seconds)<input type="number" min={0} max={Math.max(0,duration-1)} step={1} disabled={busy} value={start} onChange={e=>setStart(Math.min(Math.max(0,Number(e.target.value)||0),Math.max(0,duration-1)))} style={{display:'block',width:120,padding:12,borderRadius:8}}/></label>
      <label>Length (1–300 seconds / 5 minutes)<input type="number" min={1} max={LIMIT_SECONDS} step={1} disabled={busy} value={seconds} onChange={e=>setSeconds(Math.min(LIMIT_SECONDS,Math.max(1,Number(e.target.value)||1)))} style={{display:'block',width:120,padding:12,borderRadius:8}}/></label>
    </div>
    <button type="button" disabled={!fileName||!duration||busy} onClick={()=>void exportClip()} style={{...button,marginTop:14,width:'100%'}}>{busy?'EXPORTING CLIP…':'GENERATE CLIP ON THIS DEVICE'}</button>
    <p role="status" aria-live="polite" style={{color:'#d4eaf4',fontSize:13}}>{message}</p>
    {output&&<div>
      <p style={{fontSize:12,color:'#badfd8'}}>Encoded {exportShape==='vertical'?'9:16':'16:9'} · {(exportBytes/1024/1024).toFixed(1)} MB · metadata checked</p>
      <video controls playsInline preload="metadata" src={output} aria-label="Verify exported CrossVerse clip" style={{width:'100%',maxHeight:260,background:'#000',borderRadius:12}}/>
      <a href={output} download={'tryamm-crossverse-'+exportShape+'.webm'} style={{display:'block',textAlign:'center',padding:16,background:'#12563b',color:'#fff',borderRadius:12,fontWeight:900}}>DOWNLOAD YOUR CLIP</a>
    </div>}
  </section>
}
