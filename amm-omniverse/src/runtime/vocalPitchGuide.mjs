// Browser pitch-guide calculations. No provider, voice cloning, or backend rights changes.
export const CHROMATIC_NOTES=Object.freeze(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']);
export const VOCAL_SCALES=Object.freeze({chromatic:[0,1,2,3,4,5,6,7,8,9,10,11],major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10]});
export function frequencyToMidi(frequency){
 if(!Number.isFinite(frequency)||frequency<=0)return null;
 return 69+12*Math.log2(frequency/440);
}
export function midiToFrequency(midi){return 440*Math.pow(2,(midi-69)/12)}
export function nearestScaleNote(frequency,key='C',scale='major',strength=1){
 const midi=frequencyToMidi(frequency),keyIndex=CHROMATIC_NOTES.indexOf(key),intervals=VOCAL_SCALES[scale];
 if(midi===null||keyIndex<0||!intervals||!Number.isFinite(strength)||strength<0||strength>1)return null;
 let target=null,distance=Infinity;
 const low=Math.floor(midi)-12,high=Math.ceil(midi)+12;
 for(let note=low;note<=high;note++){
  if(!intervals.includes(((note-keyIndex)%12+12)%12))continue;
  const diff=Math.abs(note-midi);
  if(diff<distance){target=note;distance=diff;}
 }
 const corrected=midi+(target-midi)*strength;
 return {inputHz:frequency,inputMidi:midi,noteMidi:target,note:CHROMATIC_NOTES[((target%12)+12)%12],targetHz:midiToFrequency(target),ratio:Math.pow(2,(corrected-midi)/12),cents:(target-midi)*100};
}
// Unassisted monophonic pitch estimate: autocorrelation of a short, mostly voiced segment.
// Returns null for silence, high-noise clips, percussion, or unreliable periodicity.
export function estimateVocalPitch(samples,sampleRate){
 if(!samples||samples.length<1024||!Number.isFinite(sampleRate)||sampleRate<8000)return null;
 const size=Math.min(samples.length,8192);
 const start=Math.max(0,Math.floor((samples.length-size)/2));
 const frame=samples.subarray? samples.subarray(start,start+size):samples.slice(start,start+size);
 let mean=0;for(let i=0;i<size;i++)mean+=frame[i];mean/=size;
 let energy=0;for(let i=0;i<size;i++){const x=frame[i]-mean;energy+=x*x;}
 if(energy/size<0.00005)return null;
 const minLag=Math.max(2,Math.floor(sampleRate/900)),maxLag=Math.min(size>>1,Math.ceil(sampleRate/75));
 let bestLag=0,bestScore=0;
 for(let lag=minLag;lag<=maxLag;lag++){
  let diff=0,a=0,b=0;
  for(let i=0;i<size-lag;i+=2){const x=frame[i]-mean,y=frame[i+lag]-mean;diff+=x*y;a+=x*x;b+=y*y;}
  const score=diff/Math.sqrt(Math.max(1e-12,a*b));
  if(score>bestScore){bestScore=score;bestLag=lag;}
 }
 if(bestScore<0.65||!bestLag)return null;
 const hz=sampleRate/bestLag;
 return hz>=75&&hz<=900?{frequency:hz,confidence:bestScore}:null;
}
