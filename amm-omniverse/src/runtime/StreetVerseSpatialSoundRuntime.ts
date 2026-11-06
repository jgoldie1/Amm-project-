/** Low-cost original procedural sounds. Audio context starts only after player interaction. */
export type StreetVerseSoundKind='engine'|'traffic'|'footstep-pavement'|'footstep-grass'|'footstep-wood'|'nightclub'
export function createStreetVerseSpatialSound(){
 let ctx:AudioContext|null=null
 let muted=false
 const play=(kind:StreetVerseSoundKind,distanceMeters=0)=>{
  if(muted||typeof window==='undefined')return false
  try{
   ctx??=new AudioContext()
   if(ctx.state==='suspended')void ctx.resume()
   const now=ctx.currentTime
   const freq:Record<StreetVerseSoundKind,number>={engine:80,traffic:110,'footstep-pavement':260,'footstep-grass':140,'footstep-wood':195,nightclub:220}
   const oscillator=ctx.createOscillator(),gain=ctx.createGain()
   const duration=kind==='nightclub' ? 0.22 : kind==='engine' ? 0.18 : 0.09
   oscillator.type=kind==='nightclub'?'sine':kind.startsWith('footstep')?'triangle':'sawtooth'
   oscillator.frequency.setValueAtTime(freq[kind],now)
   const attenuation=1/(1+Math.max(0,distanceMeters)/12)**2
   gain.gain.setValueAtTime(.0001,now)
   gain.gain.exponentialRampToValueAtTime(Math.max(.0002,.035*attenuation),now+.015)
   gain.gain.exponentialRampToValueAtTime(.0001,now+duration)
   oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(now);oscillator.stop(now+duration+.01)
   return true
  }catch{return false}
 }
 return {play,setMuted:(value:boolean)=>{muted=value},dispose:()=>{void ctx?.close();ctx=null}}
}
