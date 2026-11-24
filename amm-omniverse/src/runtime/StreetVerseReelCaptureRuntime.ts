export type StreetVerseReelCaptureState='idle'|'recording'|'ready'|'unsupported'

export type StreetVerseReelCaptureReady=Readonly<{
 blob:Blob
 url:string
 fileName:string
 mimeType:string
 durationMs:number
 width:number
 height:number
 aspectRatio:'9:16'
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
 let privacyBlocked=false
 let portraitCanvas:HTMLCanvasElement|null=null
 let portraitFrame=0

 const emitState=(state:StreetVerseReelCaptureState,detail:Record<string,unknown>={})=>
  window.dispatchEvent(new CustomEvent('tryamm:reel-capture-state',{detail:{state,...detail}}))

 const cleanupUrl=()=>{if(lastUrl){URL.revokeObjectURL(lastUrl);lastUrl=''}}

 const stopPortraitLoop=()=>{if(portraitFrame){cancelAnimationFrame(portraitFrame);portraitFrame=0}}
 const startPortraitLoop=(target:HTMLCanvasElement)=>{
  const ctx=target.getContext('2d',{alpha:false})
  if(!ctx)return false
  const draw=()=>{
   const sw=canvas.width||canvas.clientWidth,sh=canvas.height||canvas.clientHeight
   const targetAspect=9/16,sourceAspect=sw/Math.max(1,sh)
   let sx=0,sy=0,sWidth=sw,sHeight=sh
   if(sourceAspect>targetAspect){sWidth=sh*targetAspect;sx=(sw-sWidth)/2}
   else{sHeight=sw/targetAspect;sy=(sh-sHeight)/2}
   ctx.drawImage(canvas,sx,sy,sWidth,sHeight,0,0,target.width,target.height)
   portraitFrame=requestAnimationFrame(draw)
  }
  draw();return true
 }
 const stop=()=>{
  if(recorder&&recorder.state!=='inactive')recorder.stop()
 }

 const start=(onRawReady?: (blob:Blob)=>void)=>{
  if(disposed||recorder)return
  if(privacyBlocked){emitState('idle',{blocked:true,reason:'school-privacy-zone'});window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'REEL CAPTURE OFF • privacy zone'}}));return}
  if(typeof MediaRecorder==='undefined'||typeof canvas.captureStream!=='function'){emitState('unsupported');return}
  let source=canvas
  if(!onRawReady){
   portraitCanvas=document.createElement('canvas')
   portraitCanvas.width=540;portraitCanvas.height=960
   if(!startPortraitLoop(portraitCanvas)){emitState('unsupported');return}
   source=portraitCanvas
  }
  let stream:MediaStream
  try{stream=source.captureStream(24)}catch{stopPortraitLoop();emitState('unsupported');return}
  const mimeType=chooseMimeType()
  try{recorder=new MediaRecorder(stream,mimeType?{mimeType,videoBitsPerSecond:2_500_000}:{videoBitsPerSecond:2_500_000})}
  catch{stopPortraitLoop();emitState('unsupported');stream.getTracks().forEach(t=>t.stop());return}
  chunks=[];startedAt=performance.now()
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)}
  recorder.onerror=()=>emitState('idle',{error:true})
  recorder.onstop=()=>{
   const durationMs=Math.max(0,Math.round(performance.now()-startedAt))
   const actualType=recorder?.mimeType||mimeType||'video/webm'
   const blob=new Blob(chunks,{type:actualType})
   if(stopTimer)window.clearTimeout(stopTimer)
   if(onRawReady){
    stream.getTracks().forEach(track=>track.stop())
    recorder=null
    if(!disposed){onRawReady(blob);emitState('idle')}
    return
   }
   cleanupUrl();lastUrl=URL.createObjectURL(blob)
   const ext=actualType.includes('mp4')?'mp4':'webm'
   const stamp=new Date().toISOString().replace(/[:.]/g,'-')
   const detail:StreetVerseReelCaptureReady={blob,url:lastUrl,fileName:'streetverse-reel-'+stamp+'.'+ext,mimeType:actualType,durationMs,width:540,height:960,aspectRatio:'9:16'}
   window.dispatchEvent(new CustomEvent('tryamm:reel-capture-ready',{detail}))
   emitState('ready',{durationMs,mimeType:actualType})
   stream.getTracks().forEach(t=>t.stop())
   stopPortraitLoop();portraitCanvas=null
   recorder=null
  }
  try{recorder.start(500)}catch{recorder=null;stream.getTracks().forEach(track=>track.stop());stopPortraitLoop();emitState('unsupported');return}
  emitState('recording',{startedAt:Date.now(),maxDurationMs:30_000})
  stopTimer=window.setTimeout(stop,30_000)
  return true
 }

 const toggle=()=>recorder?.state==='recording'?stop():start()
 const onToggle=()=>toggle()
 const onStop=()=>stop()
 const onMoment=(e:Event)=>{if(recorder?.state==='recording')window.dispatchEvent(new CustomEvent('tryamm:reel-marker-recorded',{detail:{...(e as CustomEvent).detail,atMs:Math.round(performance.now()-startedAt)}}))}
 const onPrivacyZone=(e:Event)=>{const d=(e as CustomEvent<{active?:boolean;reelCapture?:boolean;cameraCapture?:boolean}>).detail||{};privacyBlocked=d.active===true||d.reelCapture===false||d.cameraCapture===false;if(privacyBlocked&&recorder?.state==='recording'){stop();window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'REEL STOPPED • entered privacy zone'}}))}}
 window.addEventListener('tryamm:reel-capture-toggle',onToggle)
 window.addEventListener('tryamm:reel-capture-stop',onStop)
 window.addEventListener('tryamm:reel-moment',onMoment)
 window.addEventListener('tryamm:school-privacy-zone',onPrivacyZone)
 emitState(typeof MediaRecorder!=='undefined'&&typeof canvas.captureStream==='function'?'idle':'unsupported')

 return{
  start:()=>start(),startRaw:(ready:(blob:Blob)=>void)=>start(ready)===true,stop,toggle,
  dispose:()=>{disposed=true;if(stopTimer)window.clearTimeout(stopTimer);stopPortraitLoop();if(recorder?.state==='recording')recorder.stop();window.removeEventListener('tryamm:reel-capture-toggle',onToggle);window.removeEventListener('tryamm:reel-capture-stop',onStop);window.removeEventListener('tryamm:reel-moment',onMoment);window.removeEventListener('tryamm:school-privacy-zone',onPrivacyZone);cleanupUrl()}
 }
}
