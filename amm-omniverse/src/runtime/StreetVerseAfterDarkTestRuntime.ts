/** Opt-in, non-explicit nightlife test interactions; no age verification is simulated. */
export type AfterDarkTestAction='enter'|'dance'|'sit'|'ambient'|'exit'
export type AfterDarkTestState={active:boolean;lastAction:AfterDarkTestAction|null}
export const initialAfterDarkTestState=():AfterDarkTestState=>({active:false,lastAction:null})
export function advanceAfterDarkTest(state:AfterDarkTestState,action:AfterDarkTestAction):{state:AfterDarkTestState;ok:boolean;reason?:string;animation?:string;sound?:'door'|'music'|'chair'|'night'}{
 if(action==='enter')return {ok:true,state:{active:true,lastAction:action},sound:'door'}
 if(action==='exit')return {ok:true,state:{active:false,lastAction:action},sound:'door'}
 if(!state.active)return {ok:false,state,reason:'Enter After Dark first'}
 const effect:Record<'dance'|'sit'|'ambient',{animation?:string;sound:'music'|'chair'|'night'}>={
 dance:{animation:'Dance',sound:'music'},sit:{animation:'Sit',sound:'chair'},ambient:{sound:'night'}}
 return {ok:true,state:{active:true,lastAction:action},...effect[action]}
}
/** Synthesized original cues; activated only by player interaction. No downloaded audio assets. */
export function createAfterDarkSound(){
 let ctx:AudioContext|null=null
 let muted=false
 const play=(kind:'door'|'music'|'chair'|'night')=>{
  if(muted||typeof window==='undefined')return false
  try{
   ctx??=new AudioContext()
   if(ctx.state==='suspended')void ctx.resume()
   const notes=kind==='music'?[220,277.18,329.63]:kind==='night'?[110,164.81]:kind==='door'?[160,100]:[240,180]
   notes.forEach((freq,i)=>{
    const osc=ctx!.createOscillator(),gain=ctx!.createGain(),start=ctx!.currentTime+i*.12
    osc.type=kind==='music'?'sine':'triangle';osc.frequency.setValueAtTime(freq,start)
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.035,start+.015)
    gain.gain.exponentialRampToValueAtTime(.0001,start+.11)
    osc.connect(gain);gain.connect(ctx!.destination);osc.start(start);osc.stop(start+.12)
   })
   return true
  }catch{return false}
 }
 return {play,mute:(value:boolean)=>{muted=value},dispose:()=>{void ctx?.close();ctx=null}}
}
