/** StreetVerse zero-cost Web Audio sound-effects bus.
 * Procedural fallback sounds only; original recorded audio can be substituted later.
 * Audio starts after user interaction to respect mobile autoplay restrictions.
 */
export type StreetVerseSfx='footstep'|'door'|'elevator'|'repair'|'mission';
export class StreetVerseSpatialSfx{
 private context:AudioContext|null=null;
 private gain:GainNode|null=null;
 private muted=false;
 async unlock(){
  if(typeof window==='undefined'||!('AudioContext' in window))return false;
  this.context??=new AudioContext();
  this.gain??=this.context.createGain();
  this.gain.gain.value=this.muted?0:.18;
  if(!this.gain.numberOfOutputs)return false;
  if(!this.gainIsConnected){this.gain.connect(this.context.destination);this.gainIsConnected=true}
  await this.context.resume();
  return this.context.state==='running';
 }
 private gainIsConnected=false;
 setMuted(muted:boolean){this.muted=muted;if(this.gain)this.gain.gain.value=muted?0:.18}
 play(name:StreetVerseSfx,pan=0){
  const ctx=this.context,bus=this.gain;
  if(!ctx||!bus||ctx.state!=='running'||this.muted)return;
  const settings:Record<StreetVerseSfx,[number,number,OscillatorType,number]>={
   footstep:[125,.075,'triangle',.15],door:[210,.22,'sawtooth',.25],
   elevator:[330,.45,'sine',.18],repair:[570,.18,'triangle',.3],mission:[780,.38,'sine',.22]
  };
  const [frequency,duration,type,volume]=settings[name];
  const osc=ctx.createOscillator(),envelope=ctx.createGain(),stereo=ctx.createStereoPanner();
  osc.type=type;osc.frequency.setValueAtTime(frequency,ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(35,frequency*.72),ctx.currentTime+duration);
  envelope.gain.setValueAtTime(.001,ctx.currentTime);
  envelope.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.012);
  envelope.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
  stereo.pan.value=Math.max(-1,Math.min(1,pan));
  osc.connect(envelope);envelope.connect(stereo);stereo.connect(bus);
  osc.onended=()=>{osc.disconnect();envelope.disconnect();stereo.disconnect()};
  osc.start();osc.stop(ctx.currentTime+duration+.02);
 }
 async dispose(){await this.context?.close();this.context=null;this.gain=null;this.gainIsConnected=false}
}
