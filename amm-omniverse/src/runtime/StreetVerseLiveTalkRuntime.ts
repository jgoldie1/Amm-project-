export type StreetVerseLiveTalkState='idle'|'requesting'|'listening'|'denied'|'unsupported'|'error'

export type StreetVerseLiveTalkSnapshot=Readonly<{
 state:StreetVerseLiveTalkState
 level:number
 transcript:string
 interim:string
 speechRecognitionAvailable:boolean
}>

type RecognitionLike={
 continuous:boolean
 interimResults:boolean
 lang:string
 start:()=>void
 stop:()=>void
 abort?:()=>void
 onresult?:((event:any)=>void)|null
 onerror?:((event:any)=>void)|null
 onend?:(()=>void)|null
}

const makeRecognition=():RecognitionLike|null=>{
 const Ctor=(globalThis as any).SpeechRecognition||(globalThis as any).webkitSpeechRecognition
 if(!Ctor)return null
 try{
  const recognition=new Ctor() as RecognitionLike
  recognition.continuous=true
  recognition.interimResults=true
  recognition.lang=document.documentElement.lang||navigator.language||'en-US'
  return recognition
 }catch{return null}
}

export function installStreetVerseLiveTalkRuntime(characterId='bj-stubbs'){
 let stream:MediaStream|null=null
 let audioContext:AudioContext|null=null
 let analyser:AnalyserNode|null=null
 let source:MediaStreamAudioSourceNode|null=null
 let recognition:RecognitionLike|null=null
 let raf=0
 let disposed=false
 let stopping=false
 let level=0
 let transcript=''
 let interim=''
 let state:StreetVerseLiveTalkState='idle'
 const data=new Uint8Array(128)

 const emit=()=>{
  const detail:StreetVerseLiveTalkSnapshot={state,level,transcript,interim,speechRecognitionAvailable:Boolean(recognition)}
  window.dispatchEvent(new CustomEvent('tryamm:live-talk-state',{detail}))
 }

 const emitLevel=()=>{
  window.dispatchEvent(new CustomEvent('tryamm:bj-live-talk-level',{detail:{characterId,level,state,source:'microphone'}}))
  window.dispatchEvent(new CustomEvent('tryamm:character-face-pose',{detail:{characterId,pose:{jawOpen:Math.min(1,level*1.35),mouthWide:Math.min(.45,level*.55),cheekRaise:Math.min(.10,level*.08)}}}))
 }

 const tick=()=>{
  if(disposed||!analyser)return
  analyser.getByteTimeDomainData(data)
  let sum=0
  for(let i=0;i<data.length;i++){const n=(data[i]-128)/128;sum+=n*n}
  const rms=Math.sqrt(sum/data.length)
  const target=Math.max(0,Math.min(1,(rms-.018)*8.2))
  level=level*.68+target*.32
  emitLevel()
  raf=requestAnimationFrame(tick)
 }

 const stopRecognition=()=>{
  stopping=true
  try{recognition?.stop()}catch{}
  recognition=null
 }

 const stop=()=>{
  cancelAnimationFrame(raf)
  raf=0
  stopRecognition()
  stream?.getTracks().forEach(track=>track.stop())
  stream=null
  try{source?.disconnect()}catch{}
  source=null
  try{analyser?.disconnect()}catch{}
  analyser=null
  if(audioContext&&audioContext.state!=='closed')void audioContext.close()
  audioContext=null
  level=0
  state='idle'
  emitLevel()
  emit()
  window.dispatchEvent(new CustomEvent('tryamm:live-talk-stopped',{detail:{characterId,source:'microphone'}}))
 }

 const beginRecognition=()=>{
  recognition=makeRecognition()
  if(!recognition){emit();return}
  stopping=false
  recognition.onresult=(event:any)=>{
   let finalText='',interimText=''
   for(let i=event.resultIndex||0;i<event.results.length;i++){
    const result=event.results[i]
    const text=String(result?.[0]?.transcript||'').trim()
    if(!text)continue
    if(result.isFinal)finalText+=(finalText?' ':'')+text
    else interimText+=(interimText?' ':'')+text
   }
   interim=interimText
   if(finalText){
    transcript=(transcript+' '+finalText).trim().slice(-1800)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-spoken-dialogue',{detail:{characterId,text:finalText,fullTranscript:transcript,source:'microphone-speech-recognition'}}))
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-dialogue',{detail:{characterId,text:finalText,spoken:true,source:'microphone-speech-recognition'}}))
   }
   emit()
  }
  recognition.onerror=(event:any)=>{
   if(String(event?.error||'')==='not-allowed')state='denied'
   emit()
  }
  recognition.onend=()=>{
   if(disposed||stopping||state!=='listening')return
   try{recognition?.start()}catch{}
  }
  try{recognition.start()}catch{}
  emit()
 }

 const start=async()=>{
  if(disposed||state==='listening'||state==='requesting')return
  if(!navigator.mediaDevices?.getUserMedia){state='unsupported';emit();return}
  state='requesting';emit()
  try{
   stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false})
   if(disposed){stream.getTracks().forEach(track=>track.stop());return}
   const AC=(globalThis.AudioContext||(globalThis as any).webkitAudioContext) as typeof AudioContext|undefined
   if(!AC){state='unsupported';stream.getTracks().forEach(track=>track.stop());stream=null;emit();return}
   audioContext=new AC()
   if(audioContext.state==='suspended')await audioContext.resume()
   analyser=audioContext.createAnalyser()
   analyser.fftSize=256
   analyser.smoothingTimeConstant=.72
   source=audioContext.createMediaStreamSource(stream)
   source.connect(analyser)
   state='listening'
   transcript=''
   interim=''
   beginRecognition()
   emit()
   window.dispatchEvent(new CustomEvent('tryamm:live-talk-started',{detail:{characterId,source:'microphone'}}))
   cancelAnimationFrame(raf)
   raf=requestAnimationFrame(tick)
  }catch(error:any){
   const name=String(error?.name||'')
   state=name==='NotAllowedError'||name==='SecurityError'?'denied':'error'
   emit()
   window.dispatchEvent(new CustomEvent('tryamm:live-talk-error',{detail:{characterId,error:String(error),state,source:'microphone'}}))
  }
 }

 const clearTranscript=()=>{transcript='';interim='';emit()}

 return{
  start,stop,clearTranscript,
  getSnapshot:():StreetVerseLiveTalkSnapshot=>({state,level,transcript,interim,speechRecognitionAvailable:Boolean(recognition)}),
  dispose:()=>{disposed=true;stop()},
 }
}
