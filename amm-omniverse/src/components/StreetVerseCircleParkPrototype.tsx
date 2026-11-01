import {useState} from 'react';
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
export default function StreetVerseCircleParkPrototype(){
 const [state,setState]=useState(()=>createDirectorState('bj-demo'));
 const [captions,setCaptions]=useState(true);
 const next=steps[state.events.length];
 return <main aria-label="Circle Park playable mission prototype" style={{maxWidth:700,margin:'auto',padding:20}}>
  <h1>StreetVerse: Circle Park Resident Repair</h1>
  <p>Interactive mission logic preview. 3D assets, real audio and server saves are not connected.</p>
  <section aria-label="Mission progress"><p>Location: {state.mission.step} · Floor {state.mission.building.floor}</p>
   <p>XP: {state.mission.player.xp} · Level: {state.mission.player.level} · Virtual credits: {state.mission.player.credits}</p>
   <p>Plumbing condition: {state.mission.building.utilityHealth.plumbing}% · Ms. Pearl relationship: {state.resident.relationship}</p></section>
  {captions&&state.lastDialogue&&<p role="status"><strong>Ms. Pearl:</strong> {state.lastDialogue}</p>}
  {state.lastReaction&&<p role="status">BJ reaction: {state.lastReaction.caption}</p>}
  {next?<button style={{padding:16,minHeight:48,width:'100%'}} onClick={()=>setState(s=>directScene(s,next.action))}>{next.label}</button>
   :<p role="status">Mission completed! Story Time is a draft. Recording and publication remain disabled.</p>}
  <button style={{marginTop:12,padding:12}} onClick={()=>setCaptions(v=>!v)} aria-pressed={captions}>Captions {captions?'on':'off'}</button>
  <button style={{marginLeft:12,padding:12}} onClick={()=>setState(createDirectorState('bj-demo'))}>Restart mission</button>
  <ol>{state.events.map((event,i)=><li key={i}>{event}</li>)}</ol>
 </main>;
}
