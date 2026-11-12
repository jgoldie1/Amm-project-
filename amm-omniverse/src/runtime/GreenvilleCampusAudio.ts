/** Optional, user-initiated Chromebook-friendly audio. No microphones, external
 * services, voice cloning, paid TTS or autoplay. Captions always remain visible.
 */
export type GreenvilleSoundPreference='off'|'on'
export type GreenvilleCampusAudio={
 speak:(line:string)=>boolean
 footstep:()=>void
 setVoicesEnabled:(enabled:boolean)=>void
 setAmbienceEnabled:(enabled:boolean)=>Promise<boolean>
 stop:()=>void
 dispose:()=>void
}

export function createGreenvilleCampusAudio():GreenvilleCampusAudio{
 let voicesEnabled=false
 let disposed=false
 let ambientEnabled=false
 let ctx:AudioContext|null=null
 let wind:AudioBufferSourceNode|null=null
 let windFilter:BiquadFilterNode|null=null
 let windGain:GainNode|null=null
 let interval:number|undefined
 let lastStep=0

 const stopSpeech=()=>{
  if(typeof window!=='undefined'&&'speechSynthesis' in window){
   try{window.speechSynthesis.cancel()}catch{}
  }
 }
 const speak=(line:string)=>{
  if(disposed||!voicesEnabled||typeof window==='undefined'||!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window))return false
  const text=String(line).trim().slice(0,350)
  if(!text)return false
  try{
   stopSpeech()
   const utterance=new SpeechSynthesisUtterance(text)
   utterance.lang='en-US';utterance.rate=.95;utterance.pitch=1;utterance.volume=.85
   const voices=window.speechSynthesis.getVoices()
   const chosen=voices.find(v=>v.lang.toLowerCase()==='en-us')||voices.find(v=>v.lang.toLowerCase().startsWith('en'))
   if(chosen)utterance.voice=chosen
   window.speechSynthesis.speak(utterance)
   return true
  }catch{return false}
 }

 const bird=()=>{
  if(!ctx||ctx.state!=='running'||disposed)return
  const oscillator=ctx.createOscillator(),gain=ctx.createGain()
  const now=ctx.currentTime
  oscillator.type='sine';oscillator.frequency.setValueAtTime(1300,now);oscillator.frequency.exponentialRampToValueAtTime(2200,now+.08);oscillator.frequency.exponentialRampToValueAtTime(1600,now+.24)
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.016,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+.28)
  oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(now);oscillator.stop(now+.3)
 }
 const stopAmbience=()=>{
  ambientEnabled=false
  if(interval!==undefined){window.clearInterval(interval);interval=undefined}
  if(wind){try{wind.stop()}catch{}wind.disconnect();wind=null}
  if(windGain){windGain.disconnect();windGain=null}
  if(windFilter){windFilter.disconnect();windFilter=null}
 }
 const setAmbienceEnabled=async(enabled:boolean)=>{
  if(disposed||typeof window==='undefined')return false
  if(!enabled){stopAmbience();return true}
  if(ambientEnabled)return true
  try{
   ctx??=new AudioContext()
   await ctx.resume()
   if(ctx.state!=='running')return false
   // Procedural campus breeze at conversation-safe volume, never a prerecorded recording.
   const buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*2),ctx.sampleRate)
   const data=buffer.getChannelData(0)
   let brown=0
   for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.03)*.985;data[i]=Math.max(-.25,Math.min(.25,brown))}
   const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain()
   source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=450;gain.gain.value=.10
   source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.start()
   wind=source;windFilter=filter;windGain=gain;ambientEnabled=true
   bird()
   interval=window.setInterval(bird,7000)
   return true
  }catch{stopAmbience();return false}
 }
 const footstep=()=>{
  if(!ambientEnabled||!ctx||ctx.state!=='running'||disposed)return
  const nowMs=Date.now()
  if(nowMs-lastStep<340)return
  lastStep=nowMs
  const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime
  osc.type='triangle';osc.frequency.setValueAtTime(100,now);osc.frequency.exponentialRampToValueAtTime(63,now+.07)
  gain.gain.setValueAtTime(.016,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.075)
  osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+.08)
 }
 return{
  speak,footstep,
  setVoicesEnabled(enabled:boolean){voicesEnabled=enabled;if(!enabled)stopSpeech()},
  setAmbienceEnabled,
  stop(){stopSpeech();stopAmbience()},
  dispose(){if(disposed)return;disposed=true;stopSpeech();stopAmbience();if(ctx){void ctx.close().catch(()=>{});ctx=null}},
 }
}
