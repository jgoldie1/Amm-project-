// All American Records: original browser-synth chord cards and 16-step beat banks.
// Korg-style harmony and MPC-style pads are workflows, NOT hardware emulation,
// licensed Korg/Akai samples, Ableton project files, or exported recordings.
export const MUSIC_NOTE_NAMES=Object.freeze(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']);
export const CHORD_CARD_TYPES=Object.freeze([
 {id:'major',label:'Major',intervals:[0,4,7]},
 {id:'minor',label:'Minor',intervals:[0,3,7]},
 {id:'maj7',label:'Major 7',intervals:[0,4,7,11]},
 {id:'m7',label:'Minor 7',intervals:[0,3,7,10]},
 {id:'m9',label:'Minor 9',intervals:[0,3,7,10,14]},
 {id:'dom7',label:'Dominant 7',intervals:[0,4,7,10]},
 {id:'sus4',label:'Sus 4',intervals:[0,5,7]},
 {id:'add9',label:'Add 9',intervals:[0,4,7,14]}
]);
export const DRUM_BANKS=Object.freeze([
 {id:'rnb-pocket',title:'Midnight R&B',bpm:94,description:'Sparse syncopated pocket, soft snare and offbeat hats',steps:{1:[0,7,10],2:[4,12],3:[2,6,10,14],5:[12]}},
 {id:'gospel-soul',title:'Gospel Soul',bpm:86,description:'Warm backbeat with claps and bells',steps:{1:[0,8,10],2:[4,12],3:[0,2,4,6,8,10,12,14],5:[4,12],7:[0]}},
 {id:'drill',title:'Chicago Drill',bpm:142,description:'Broken kick, half-time snare and fast hats',steps:{1:[0,3,7,11,14],2:[8],3:[0,1,2,4,6,7,8,10,12,13,14,15],4:[6,14],8:[0,10]}},
 {id:'house',title:'House Four-On-Floor',bpm:124,description:'Four kick, clap and offbeat open hats',steps:{1:[0,4,8,12],2:[4,12],3:[2,6,10,14],4:[2,6,10,14],5:[4,12]}},
 {id:'afro-soul',title:'Afro-Soul',bpm:105,description:'Syncopated cross-rhythm and floating percussion',steps:{1:[0,6,10],2:[4,12],3:[2,6,10,14],5:[3,11],8:[0,7,13]}}
]);
export function makeChordNotes(root,type,octave=4){
 const rootIndex=MUSIC_NOTE_NAMES.indexOf(root);
 const card=CHORD_CARD_TYPES.find(x=>x.id===type);
 if(rootIndex===-1||!card||!Number.isInteger(octave)||octave<2||octave>6)return null;
 const midi=12*(octave+1)+rootIndex;
 return card.intervals.map(interval=>{
  const note=midi+interval;
  return {midi:note,freq:440*2**((note-69)/12),name:MUSIC_NOTE_NAMES[note%12]+String(Math.floor(note/12)-1)};
 });
}
export function getBeatPattern(id){return DRUM_BANKS.find(x=>x.id===id)||null}
export function beatEventsForStep(pattern,step){
 if(!pattern||!Number.isInteger(step)||step<0||step>=16)return [];
 return Object.entries(pattern.steps).filter(([,hits])=>hits.includes(step)).map(([padId])=>Number(padId));
}
export function clampBeatBpm(value){
 const n=Number(value);
 return Number.isFinite(n)?Math.min(220,Math.max(50,Math.round(n))):94;
}
