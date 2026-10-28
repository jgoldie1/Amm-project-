/** Original synthesized trade sound effects for StreetVerse.
 * No third-party samples or licenses required. User interaction unlocks audio.
 * Not a replacement for recorded plumbing/vehicle ambience.
 */
type Cue='water-drip'|'switch-click'|'valve-turn'|'job-complete'|'toolbox'
const supported=new Set<Cue>(['water-drip','switch-click','valve-turn','job-complete','toolbox'])
const captions:Record<Cue,string>={'water-drip':'Water drips','switch-click':'Switch clicks','valve-turn':'Valve turns','job-complete':'Job complete','toolbox':'Toolbox clicks'}
export function installStreetVerseOriginalTradeSounds(){
 let context:AudioContext|null=null
 let enabled=true
 let lastAt=0
 const unlock=()=>{try{context??=new AudioContext();void context.resume()}catch{}}
 const play=(cue:Cue)=>{
  if(!enabled)return
  unlock()
  const ctx=context
  if(!ctx||ctx.state!=='running')return
  const t=ctx.currentTime
  const voices=cue==='job-complete'?[540,720]:cue==='water-drip'?[520,310]:cue==='switch-click'?[450]:cue==='toolbox'?[180,130]:[220,160]
  voices.forEach((pitch,index)=>{
   const oscillator=ctx.createOscillator(),gain=ctx.createGain()
   oscillator.type=cue==='job-complete'?'sine':cue==='water-drip'?'sine':'triangle'
   const at=t+index*.085,duration=cue==='job-complete'?.16:.065
   oscillator.frequency.setValueAtTime(pitch,at)
   if(cue==='water-drip')oscillator.frequency.exponentialRampToValueAtTime(180,at+duration)
   gain.gain.setValueAtTime(.0001,at)
   gain.gain.exponentialRampToValueAtTime(.055,at+.006)
   gain.gain.exponentialRampToValueAtTime(.0001,at+duration)
   oscillator.connect(gain);gain.connect(ctx.destination)
   oscillator.start(at);oscillator.stop(at+duration+.01)
  })
  window.dispatchEvent(new CustomEvent('tryamm:audio-caption',{detail:{speaker:'SFX',text:captions[cue],key:cue,source:'original-trade-synthesis'}}))
 }
 const onRequest=(event:Event)=>{
  const cue=(event as CustomEvent<{cue?:string}>).detail?.cue as Cue|undefined
  if(!cue||!supported.has(cue))return
  if(performance.now()-lastAt<120)return // prevent runaway loops
  lastAt=performance.now();play(cue)
 }
 const onSettings=(event:Event)=>{
  const detail=(event as CustomEvent<{enabled?:boolean;muted?:boolean}>).detail
  if(typeof detail?.enabled==='boolean')enabled=detail.enabled
  if(typeof detail?.muted==='boolean')enabled=!detail.muted
 }
 window.addEventListener('tryamm:streetverse-trade-sound-request',onRequest)
 window.addEventListener('tryamm:streetverse-trade-audio-settings',onSettings)
 return ()=>{window.removeEventListener('tryamm:streetverse-trade-sound-request',onRequest);window.removeEventListener('tryamm:streetverse-trade-audio-settings',onSettings);void context?.close()}
}
