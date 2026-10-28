/** Original procedural walking and wildlife ambience for StreetVerse.
 * Uses no third-party recordings; no autoplay. Game-only non-authoritative FX.
 */
export type NatureCue='step-concrete'|'step-grass'|'step-stairs'|'bird-chirp'|'insect-cricket'|'dog-bark'|'cat-meow'
const captions:Record<NatureCue,string>={
 'step-concrete':'Footsteps on pavement','step-grass':'Footsteps on grass','step-stairs':'Footsteps on stairs',
 'bird-chirp':'Bird chirping','insect-cricket':'Crickets chirping','dog-bark':'Dog barking','cat-meow':'Cat meowing'
}
const supported=new Set(Object.keys(captions))
export function installStreetVerseWalkingWildlifeAudio(){
 let context:AudioContext|null=null
 let unlocked=false,enabled=true,volume=.45,lastCue='',lastAt=0
 const unlock=()=>{try{context??=new AudioContext();void context.resume();unlocked=true}catch{}}
 const tone=(freq:number,duration:number,kind:OscillatorType='sine',delay=0)=>{
  const ctx=context;if(!ctx||ctx.state!=='running')return
  const start=ctx.currentTime+delay
  const oscillator=ctx.createOscillator(),gain=ctx.createGain()
  oscillator.type=kind
  oscillator.frequency.setValueAtTime(freq,start)
  gain.gain.setValueAtTime(.0001,start)
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*.07),start+.008)
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration)
  oscillator.connect(gain);gain.connect(ctx.destination)
  oscillator.start(start);oscillator.stop(start+duration+.02)
 }
 const play=(cue:NatureCue)=>{
  if(!enabled||!unlocked||!context||context.state!=='running')return
  switch(cue){
   case 'step-concrete':tone(110,.065,'triangle');tone(68,.04,'sine',.035);break
   case 'step-grass':tone(82,.09,'triangle');tone(120,.03,'sine',.04);break
   case 'step-stairs':tone(150,.08,'triangle');tone(85,.07,'sine',.06);break
   case 'bird-chirp':tone(1600,.095,'sine');tone(2100,.08,'sine',.12);break
   case 'insect-cricket':for(let i=0;i<3;i++)tone(3400,.025,'sine',i*.075);break
   case 'dog-bark':tone(190,.13,'sawtooth');tone(165,.09,'triangle',.14);break
   case 'cat-meow':tone(500,.18,'sine');tone(680,.11,'sine',.14);break
  }
  window.dispatchEvent(new CustomEvent('tryamm:audio-caption',{detail:{speaker:'SFX',text:captions[cue],key:cue,source:'original-nature-audio'}}))
 }
 const onUserGesture=()=>unlock()
 const onRequest=(event:Event)=>{
  const cue=(event as CustomEvent<{cue?:string}>).detail?.cue
  if(!cue||!supported.has(cue))return
  const now=performance.now()
  const minMs=cue.startsWith('step-')?240:cue==='insect-cricket'?1600:cue==='bird-chirp'?1400:3000
  if(cue===lastCue&&now-lastAt<minMs)return
  lastAt=now;lastCue=cue;play(cue as NatureCue)
 }
 const onSettings=(event:Event)=>{
  const detail=(event as CustomEvent<{muted?:boolean;enabled?:boolean;volume?:number}>).detail||{}
  if(typeof detail.muted==='boolean')enabled=!detail.muted
  if(typeof detail.enabled==='boolean')enabled=detail.enabled
  if(typeof detail.volume==='number'&&Number.isFinite(detail.volume))volume=Math.min(1,Math.max(0,detail.volume))
 }
 window.addEventListener('pointerdown',onUserGesture,{once:true})
 window.addEventListener('keydown',onUserGesture,{once:true})
 window.addEventListener('tryamm:streetverse-nature-sound-request',onRequest)
 window.addEventListener('tryamm:streetverse-nature-audio-settings',onSettings)
 return ()=>{
  window.removeEventListener('pointerdown',onUserGesture)
  window.removeEventListener('keydown',onUserGesture)
  window.removeEventListener('tryamm:streetverse-nature-sound-request',onRequest)
  window.removeEventListener('tryamm:streetverse-nature-audio-settings',onSettings)
  void context?.close()
 }
}
