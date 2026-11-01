import {useState} from 'react';
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
function loadDemo():DirectorState{try{const raw=window.localStorage.getItem(saveKey);if(raw){const data=JSON.parse(raw) as DirectorState;if(data?.mission?.player?.id==='bj-demo'&&Array.isArray(data.events)&&data.events.length<=steps.length&&data.resident?.residentId==='ms-pearl')return data;}}catch{/* private browsing or invalid demo save */}return createDirectorState('bj-demo')}
export default function StreetVerseCircleParkPrototype(){
 const [state,setState]=useState(loadDemo);
 const [captions,setCaptions]=useState(true);
 const [voice,setVoice]=useState(false);
 const next=steps[state.events.length];
 function advance(action:DirectorAction){const updated=directScene(state,action);setState(updated);try{window.localStorage.setItem(saveKey,JSON.stringify(updated))}catch{/* demo remains playable without storage */}
 if(voice&&updated.lastDialogue&&updated.lastDialogue!==state.lastDialogue&&'speechSynthesis' in window){window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(updated.lastDialogue);utterance.rate=0.95;window.speechSynthesis.speak(utterance)}}
 return <main aria-label="Circle Park playable mission prototype" style={{maxWidth:700,margin:'auto',padding:20}}>
  <h1>StreetVerse: Circle Park Resident Repair</h1>
  <p>Interactive mission logic preview. 3D assets and server saves are not connected. Optional browser speech and local demo saving are available.</p>
  <section aria-label="Mission progress"><p>Location: {state.mission.step} · Floor {state.mission.building.floor}</p>
   <p>XP: {state.mission.player.xp} · Level: {state.mission.player.level} · Virtual credits: {state.mission.player.credits}</p>
   <p>Plumbing condition: {state.mission.building.utilityHealth.plumbing}% · Ms. Pearl relationship: {state.resident.relationship}</p></section>
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
