import {useEffect,useRef,useState} from 'react'
import {CHROMATIC_NOTES,estimateVocalPitch,nearestScaleNote} from '../runtime/vocalPitchGuide.mjs'

type PitchGuide={frequency:number;confidence:number;note:string;targetHz:number;ratio:number;cents:number}
const buttonStyle:React.CSSProperties={minHeight:52,borderRadius:12,border:'1px solid #eea3d2',background:'#30132a',color:'#fff',fontSize:15,fontWeight:800,padding:'10px 12px',cursor:'pointer',touchAction:'manipulation'}
export default function VocalAutoTunePreview(){
 const [key,setKey]=useState('C')
 const [scale,setScale]=useState('major')
 const [strength,setStrength]=useState(1)
 const [pitch,setPitch]=useState<{frequency:number;confidence:number}|null>(null)
 const [result,setResult]=useState<PitchGuide|null>(null)
 const [source,setSource]=useState<string|null>(null)
 const [status,setStatus]=useState('Choose your own short solo vocal recording to inspect its pitch.')
 const audio=useRef<HTMLAudioElement|null>(null)
 const url=useRef<string|null>(null)
 useEffect(()=>()=>{audio.current?.pause();if(url.current)URL.revokeObjectURL(url.current)},[])
 useEffect(()=>{
  if(!pitch){setResult(null);return}
  const next=nearestScaleNote(pitch.frequency,key,scale,strength)
  setResult(next?{...pitch,...next}:null)
 },[pitch,key,scale,strength])
 const load=async(file?:File)=>{
  audio.current?.pause()
  if(url.current){URL.revokeObjectURL(url.current);url.current=null}
  setSource(null);setPitch(null);setResult(null)
  if(!file)return
  if(file.size>20*1024*1024||file.size===0||!file.type.startsWith('audio/')){setStatus('Choose a supported audio recording under 20 MB.');return}
  try{
   const context=new AudioContext()
   try{
    const buffer=await file.arrayBuffer()
    const decoded=await context.decodeAudioData(buffer.slice(0))
    if(!decoded.duration||decoded.duration>120){setStatus('Use a vocal clip under 2 minutes for this demo.');return}
    const channel=decoded.getChannelData(0),rate=decoded.sampleRate
    // Scan several windows: skips silent intro; choose stable voiced note with highest confidence.
    const windows=8,span=Math.min(8192,channel.length)
    let best:null|{frequency:number;confidence:number}=null
    for(let i=0;i<windows;i++){
     const start=Math.floor(Math.max(0,channel.length-span)*i/Math.max(1,windows-1))
     const attempt=estimateVocalPitch(channel.subarray(start,start+span),rate)
     if(attempt&&(!best||attempt.confidence>best.confidence))best=attempt
    }
    url.current=URL.createObjectURL(file)
    setSource(url.current)
    setPitch(best)
    setStatus(best?'Detected an approximate sustained note. Change key, scale or strength, then audition.':'No reliable solo vocal note found. Try a clearer sustained voice recording.')
   }finally{await context.close()}
  }catch{setStatus('Audio decoding failed on this device. Try a WAV or supported recorded clip.')}
 }
 const play=async(tuned:boolean)=>{
  if(!audio.current||!source)return
  audio.current.pause();audio.current.currentTime=0
  audio.current.playbackRate=tuned?(result?.ratio??1):1
  try{await audio.current.play();setStatus(tuned?'Playing pitch-shifted audition (speed and duration change too).':'Playing your original recording.')}
  catch{setStatus('Playback needs another tap or the recording cannot be played here.')}
 }
 return <section aria-label="AutoTune vocal pitch guide" style={{background:'#150c20',border:'1px solid #e16fcb',borderRadius:16,padding:14,marginBottom:18}}>
  <h3 style={{color:'#ffb1e1',margin:'0 0 8px'}}>🎤 AUTO-TUNE · VOCAL PITCH GUIDE</h3>
  <p style={{fontSize:12,color:'#dfc7df',lineHeight:1.5}}>Choose a human-recorded vocal. This first pilot detects one sustained note and lets you audition a pitch change; it is not yet real-time, note-by-note AutoTune.</p>
  <label style={{display:'block',marginBottom:10,fontSize:13}}>Load your vocal (local only)
   <input aria-label="Load vocal take for pitch analysis" type="file" accept="audio/*" onChange={e=>{void load(e.target.files?.[0])}} style={{display:'block',marginTop:6,minHeight:48,maxWidth:'100%'}}/>
  </label>
  <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:10}}>
   <label>Key <select aria-label="Tuning key" value={key} onChange={e=>setKey(e.target.value)} style={{fontSize:16,minHeight:48}}>{CHROMATIC_NOTES.map(n=><option key={n} value={n}>{n}</option>)}</select></label>
   <label>Scale <select aria-label="Tuning scale" value={scale} onChange={e=>setScale(e.target.value)} style={{fontSize:16,minHeight:48}}><option value="major">Major</option><option value="minor">Minor</option><option value="chromatic">Chromatic</option></select></label>
  </div>
  <label style={{display:'block',fontSize:13}}>Pitch effect strength: {Math.round(strength*100)}%<input aria-label="Pitch effect strength" type="range" min="0" max="1" step=".1" value={strength} onChange={e=>setStrength(Number(e.target.value))} style={{display:'block',width:'100%',minHeight:42}}/></label>
  <p aria-live="polite" style={{color:'#e5c8e4',fontSize:13}}>{result?`Detected ≈${result.frequency.toFixed(1)} Hz · Suggested ${result.note} (${result.targetHz.toFixed(1)} Hz), ${Math.round(result.cents)} cents · confidence ${Math.round(result.confidence*100)}%`:'No analyzed pitch yet.'}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(135px,1fr))',gap:8}}>
    <button style={buttonStyle} disabled={!source} onClick={()=>void play(false)}>▶ ORIGINAL</button>
    <button style={buttonStyle} disabled={!source||!result} onClick={()=>void play(true)}>🎚 AUDITION TUNED</button>
    <button style={buttonStyle} disabled={!source} onClick={()=>{audio.current?.pause();setStatus('Playback stopped.')}}>■ STOP</button>
  </div>
  <audio ref={audio} src={source||undefined} preload="none" aria-label="Vocal pitch audition audio"/>
  <p role="status" aria-live="polite" style={{fontSize:12,color:'#f5d9a0'}}>{status}</p>
  <p style={{fontSize:11,color:'#aaa'}}>Local preview only. No automatic upload, distribution, audio export, identity imitation, or payment. True AutoTune requires a dedicated pitch-preserving DSP processor.</p>
 </section>
}
