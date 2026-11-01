import {useState} from 'react';
import {addWorldMemory,recallWorldMemory,worldMemoryEvent,type WorldMemoryEvent} from '../game/memory/StreetVerseGoogolplexMemory';
import {resolveImpact,type ImpactKind} from '../game/feedback/StreetVerseHoloImpact';
import type {DirectorState} from '../game/rpg/StreetVerseAIDirector';
import {createDirectorState,directScene,type DirectorAction} from '../game/rpg/StreetVerseAIDirector';
const steps:{action:DirectorAction;label:string}[]=[
 {action:'enter',label:'Enter apartment lobby'},
 {action:'elevator',label:'Ride elevator to floor 2'},
 {action:'meet',label:'Talk to Ms. Pearl'},
 {action:'react',label:'Laugh 😂'},
 {action:'accept-repair',label:'Accept plumbing repair'},
 {action:'finish-repair',label:'Repair water valve'},
 {action:'story',label:'Create Story Time draft'}
];
const saveKey='streetverse:circle-park:demo-v1';
const memoryKey='streetverse:circle-park:memory-v1';
function loadMemory():WorldMemoryEvent[]{try{const raw=window.localStorage.getItem(memoryKey);const data=raw?JSON.parse(raw):[];return Array.isArray(data)?data.filter((e:WorldMemoryEvent)=>e.ownerId==='bj-demo'&&e.worldId==='circle-park').slice(-100):[]}catch{return []}}
function loadDemo():DirectorState{try{const raw=window.localStorage.getItem(saveKey);if(raw){const data=JSON.parse(raw) as DirectorState;if(data?.mission?.player?.id==='bj-demo'&&Array.isArray(data.events)&&data.events.length<=steps.length&&data.resident?.residentId==='ms-pearl')return data;}}catch{/* private browsing or invalid demo save */}return createDirectorState('bj-demo')}
export default function StreetVerseCircleParkPrototype(){
 const [state,setState]=useState(loadDemo);
 const [captions,setCaptions]=useState(true);
 const [voice,setVoice]=useState(false);
 const [memory,setMemory]=useState(loadMemory);
 const [feedback,setFeedback]=useState('');
 const next=steps[state.events.length];
 function advance(action:DirectorAction){const updated=directScene(state,action);setState(updated);
 if(updated!==state){const kind=action==='finish-repair'?'repair':action==='story'?'mission-complete':'interaction';const impact=resolveImpact(kind as ImpactKind,{reducedMotion:true,reducedFlashing:true,muted:true,haptics:false});setFeedback(impact.caption);
 if(action==='meet'||action==='finish-repair'){const event=worldMemoryEvent({id:'circle-park-'+action,ownerId:'bj-demo',worldId:'circle-park',subjectId:'ms-pearl',kind:action==='finish-repair'?'repair':'npc-interaction',summary:action==='finish-repair'?'BJ completed Ms. Pearl plumbing repair':'BJ met Ms. Pearl in Circle Park',occurredAt:new Date().toISOString()});const next=addWorldMemory(memory,event);setMemory(next);try{window.localStorage.setItem(memoryKey,JSON.stringify(next))}catch{/* demo only */}}}
try{window.localStorage.setItem(saveKey,JSON.stringify(updated))}catch{/* demo remains playable without storage */}
 if(voice&&updated.lastDialogue&&updated.lastDialogue!==state.lastDialogue&&'speechSynthesis' in window){window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(updated.lastDialogue);utterance.rate=0.95;window.speechSynthesis.speak(utterance)}}
 return <main aria-label="Circle Park playable mission prototype" style={{maxWidth:700,margin:'auto',padding:20}}>
  <h1>StreetVerse: Circle Park Resident Repair</h1>
  <p>Interactive mission logic preview. 3D assets and server saves are not connected. Optional browser speech and local demo saving are available.</p>
  <section aria-label="Mission progress"><p>Location: {state.mission.step} · Floor {state.mission.building.floor}</p>
   <p>XP: {state.mission.player.xp} · Level: {state.mission.player.level} · Virtual credits: {state.mission.player.credits}</p>
   <p>Plumbing condition: {state.mission.building.utilityHealth.plumbing}% · Ms. Pearl relationship: {state.resident.relationship}</p></section>
  <p role="status">{feedback}</p>
  <section aria-label="Googolplex resident memory"><h2>Ms. Pearl remembers</h2><ul>{recallWorldMemory(memory,'bj-demo','circle-park','ms-pearl').map(e=><li key={e.id}>{e.summary}</li>)}</ul></section>
  {captions&&state.lastDialogue&&<p role="status"><strong>Ms. Pearl:</strong> {state.lastDialogue}</p>}
  {state.lastReaction&&<p role="status">BJ reaction: {state.lastReaction.caption}</p>}
  {next?<button style={{padding:16,minHeight:48,width:'100%'}} onClick={()=>advance(next.action)}>{next.label}</button>
   :<p role="status">Mission completed! Story Time is a draft. Recording and publication remain disabled.</p>}
  <button style={{marginTop:12,padding:12}} onClick={()=>{setVoice(v=>!v);if(voice&&'speechSynthesis' in window)window.speechSynthesis.cancel()}} aria-pressed={voice}>Resident voice {voice?'on':'off'}</button>
  <button style={{marginTop:12,padding:12}} onClick={()=>setCaptions(v=>!v)} aria-pressed={captions}>Captions {captions?'on':'off'}</button>
  <button style={{marginLeft:12,padding:12}} onClick={()=>{setState(createDirectorState('bj-demo'));try{window.localStorage.removeItem(saveKey)}catch{/* optional demo save */}if('speechSynthesis' in window)window.speechSynthesis.cancel()}}>Restart mission</button>
  <ol>{state.events.map((event,i)=><li key={i}>{event}</li>)}</ol>
 </main>;
}
