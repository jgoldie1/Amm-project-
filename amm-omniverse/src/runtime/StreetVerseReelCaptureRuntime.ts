export type StreetVerseReelCaptureState='idle'|'recording'|'ready'|'unsupported'

export type StreetVerseReelCaptureReady=Readonly<{
 blob:Blob
 url:string
 fileName:string
 mimeType:string
 durationMs:number
}>

function chooseMimeType(){
 const candidates=[
  'video/mp4;codecs=avc1.42E01E',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
 ]
 return candidates.find(type=>typeof MediaRecorder!=='undefined'&&MediaRecorder.isTypeSupported?.(type))||''
}

export function installStreetVerseReelCapture(canvas:HTMLCanvasElement){
 let recorder:MediaRecorder|null=null
 let chunks:BlobPart[]=[]
 let startedAt=0
 let stopTimer:number|undefined
 let lastUrl=''
 let disposed=false

 const emitState=(state:StreetVerseReelCaptureState,detail:Record<string,unknown>={})=>
  window.dispatchEvent(new CustomEvent('tryamm:reel-capture-state',{detail:{state,...detail}}))

 const cleanupUrl=()=>{if(lastUrl){URL.revokeObjectURL(lastUrl);lastUrl=''}}

 const stop=()=>{
  if(recorder&&recorder.state!=='inactive')recorder.stop()
 }

 const start=()=>{
  if(disposed||recorder?.state==='recording')return
  if(typeof MediaRecorder==='undefined'||typeof canvas.captureStream!=='function'){emitState('unsupported');return}
  const stream=canvas.captureStream(24)
  const mimeType=chooseMimeType()
  try{recorder=new MediaRecorder(stream,mimeType?{mimeType,videoBitsPerSecond:2_500_000}:{videoBitsPerSecond:2_500_000})}
  catch{emitState('unsupported');stream.getTracks().forEach(t=>t.stop());return}
  chunks=[];startedAt=performance.now()
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)}
  recorder.onerror=()=>emitState('idle',{error:true})
  recorder.onstop=()=>{
   const durationMs=Math.max(0,Math.round(performance.now()-startedAt))
   const actualType=recorder?.mimeType||mimeType||'video/webm'
   const blob=new Blob(chunks,{type:actualType})
   cleanupUrl();lastUrl=URL.createObjectURL(blob)
   const ext=actualType.includes('mp4')?'mp4':'webm'
   const stamp=new Date().toISOString().replace(/[:.]/g,'-')
   const detail:StreetVerseReelCaptureReady={blob,url:lastUrl,fileName:'streetverse-reel-'+stamp+'.'+ext,mimeType:actualType,durationMs}
   window.dispatchEvent(new CustomEvent('tryamm:reel-capture-ready',{detail}))
   emitState('ready',{durationMs,mimeType:actualType})
   stream.getTracks().forEach(t=>t.stop())
   recorder=null
  }
  recorder.start(500)
  emitState('recording',{startedAt:Date.now(),maxDurationMs:30_000})
  stopTimer=window.setTimeout(stop,30_000)
 }

 const toggle=()=>recorder?.state==='recording'?stop():start()
 const onToggle=()=>toggle()
 const onStop=()=>stop()
 const onMoment=(e:Event)=>{if(recorder?.state==='recording')window.dispatchEvent(new CustomEvent('tryamm:reel-marker-recorded',{detail:{...(e as CustomEvent).detail,atMs:Math.round(performance.now()-startedAt)}}))}
 window.addEventListener('tryamm:reel-capture-toggle',onToggle)
 window.addEventListener('tryamm:reel-capture-stop',onStop)
 window.addEventListener('tryamm:reel-moment',onMoment)
 emitState(typeof MediaRecorder!=='undefined'&&typeof canvas.captureStream==='function'?'idle':'unsupported')

 return{
  start,stop,toggle,
  dispose:()=>{disposed=true;if(stopTimer)window.clearTimeout(stopTimer);if(recorder?.state==='recording')recorder.stop();window.removeEventListener('tryamm:reel-capture-toggle',onToggle);window.removeEventListener('tryamm:reel-capture-stop',onStop);window.removeEventListener('tryamm:reel-moment',onMoment);cleanupUrl()}
 }
}
