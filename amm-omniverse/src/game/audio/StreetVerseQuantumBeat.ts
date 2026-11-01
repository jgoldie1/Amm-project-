/** Original procedural StreetVerse Quantum Beat. No copyrighted samples.
 * Quantum is a creative name: this uses deterministic Web Audio synthesis, not quantum hardware.
 */
export type BeatMode='explore'|'mission'|'driving';
export class StreetVerseQuantumBeat{
 private ctx:AudioContext|null=null;
 private master:GainNode|null=null;
 private interval:number|null=null;
 private step=0;
 private mode:BeatMode='explore';
 private nextTime=0;
 private readonly bpm:Record<BeatMode,number>={explore:84,mission:108,driving:124};
 async start(mode:BeatMode='explore'){
  if(typeof window==='undefined'||!window.AudioContext)return false;
  this.mode=mode;
  if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=.09;this.master.connect(this.ctx.destination)}
  await this.ctx.resume();
  if(this.ctx.state!=='running')return false;
  if(this.interval!==null)return true;
  this.nextTime=this.ctx.currentTime+.05;
  this.interval=window.setInterval(()=>this.schedule(),25);
  return true;
 }
 setMode(mode:BeatMode){this.mode=mode}
 private note(time:number,frequency:number,duration:number,volume:number,type:OscillatorType){
  const ctx=this.ctx,bus=this.master;if(!ctx||!bus)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,time);
  if(frequency<100)osc.frequency.exponentialRampToValueAtTime(Math.max(30,frequency*.55),time+duration);
  gain.gain.setValueAtTime(.001,time);
  gain.gain.exponentialRampToValueAtTime(volume,time+.008);
  gain.gain.exponentialRampToValueAtTime(.001,time+duration);
  osc.connect(gain);gain.connect(bus);
  osc.onended=()=>{osc.disconnect();gain.disconnect()};
  osc.start(time);osc.stop(time+duration+.01);
 }
 private schedule(){
  const ctx=this.ctx;if(!ctx)return;
  while(this.nextTime<ctx.currentTime+.12){
   const s=this.step%16;
   if(s%4===0)this.note(this.nextTime,72,.22,.6,'sine');
   if(s===4||s===12)this.note(this.nextTime,190,.09,.16,'triangle');
   if(s%2===0)this.note(this.nextTime,700,.025,.025,'square');
   const notes=[110,0,164.81,0,146.83,0,130.81,0];
   if(s%2===0&&notes[(s/2)%8])this.note(this.nextTime,notes[(s/2)%8],.17,.14,'triangle');
   this.step++;
   this.nextTime+=60/this.bpm[this.mode]/4;
  }
 }
 stop(){if(this.interval!==null){window.clearInterval(this.interval);this.interval=null}this.step=0}
 async dispose(){this.stop();await this.ctx?.close();this.ctx=null;this.master=null}
}
