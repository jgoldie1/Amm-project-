import {useState,type CSSProperties} from 'react'
import type {AncientStoryId} from '../data/FaithVerseAncientStories'

type Objective={action:string;label:string;feedback:string}
const TASKS:Readonly<Record<AncientStoryId,readonly Objective[]>>={
 'creation-flood':[
  {action:'gather',label:'GATHER ARK SUPPLIES',feedback:'Supplies prepared in the fictional ark-building mission.'},
  {action:'animals',label:'GUIDE ANIMALS TO SHELTER',feedback:'Animal groups safely guided toward shelter in the study scene.'},
  {action:'water',label:'OBSERVE FLOOD LEVEL',feedback:'Rising-water visual chapter recorded. No real weather or flood danger is present.'},
  {action:'covenant',label:'STUDY RAINBOW COVENANT',feedback:'Genesis 9 reference added to this local study objective.'}
 ],
 'nephilim-genesis':[
  {action:'read',label:'READ GENESIS 6',feedback:'Genesis 6:1–4 is the primary short text to compare.'},
  {action:'observe',label:'OBSERVE FICTIONAL GIANTS',feedback:'Intimidating fictional creatures observed; their appearance is not established by scripture.'},
  {action:'compare',label:'COMPARE NUMBERS 13',feedback:'Numbers 13 reports the scouts’ language; interpretations and historical claims are separate.'},
  {action:'reflect',label:'RECORD UNCERTAINTIES',feedback:'No claim of verified Nephilim height, origin or anatomy has been made.'}
 ],
 'watchers-enoch':[
  {action:'genesis',label:'READ GENESIS ACCOUNT',feedback:'The brief Genesis passage is distinguished from later traditions.'},
  {action:'enoch',label:'COMPARE 1 ENOCH',feedback:'The Watchers tradition is attributed to 1 Enoch 6–15, distinct from Genesis.'},
  {action:'creatures',label:'VIEW FALLEN-ANGEL CONCEPTS',feedback:'Original fantasy creature art reviewed, not literal portraiture.'},
  {action:'canon',label:'COMPARE CANONS',feedback:'1 Enoch’s different canonical status across religious communities is noted.'}
 ],
 'david-goliath':[
  {action:'valley',label:'EXPLORE VALLEY',feedback:'The Valley of Elah stage entered in a fictional reconstruction.'},
  {action:'david',label:'MEET DAVID',feedback:'David’s role and 1 Samuel 17 references identified.'},
  {action:'sling',label:'PRACTICE TARGET CHALLENGE',feedback:'Non-violent stationary practice target hit in a fictional mini-game.'},
  {action:'lesson',label:'STUDY COURAGE',feedback:'Study reflection recorded; no graphic combat or real weapon instruction.'}
 ],
 'tower-babel':[
  {action:'materials',label:'ORGANIZE BUILDING MATERIALS',feedback:'Fictional building supplies organized.'},
  {action:'tower',label:'OBSERVE CITY CONSTRUCTION',feedback:'Original 2D city-building chapter explored.'},
  {action:'language',label:'COMPLETE LANGUAGE PUZZLE',feedback:'Communication and translation themes studied.'},
  {action:'study',label:'READ GENESIS 11',feedback:'Text comparison and reflection completed.'}
 ],
 'red-sea':[
  {action:'families',label:'HELP FAMILIES ASSEMBLE',feedback:'Families reached the safe gathering point in the story simulation.'},
  {action:'shore',label:'ENTER SEA VIEWPOINT',feedback:'Reached the reconstructed crossing viewpoint.'},
  {action:'waters',label:'OBSERVE PARTING WATERS',feedback:'Symbolic animated waters are not a physical historical reconstruction.'},
  {action:'reading',label:'READ EXODUS 14',feedback:'Exodus 14 study completed.'}
 ]
}
const btn:CSSProperties={minHeight:58,borderRadius:13,border:'1px solid #a9d1d1',background:'#194559',color:'#fff',padding:'10px 14px',fontSize:15,fontWeight:800,cursor:'pointer',touchAction:'manipulation'}
const PREFIX='tryamm:faithverse:ancient-quest:'
function getSaved(id:AncientStoryId){try{const saved=JSON.parse(localStorage.getItem(PREFIX+id)||'[]');return Array.isArray(saved)?saved.filter((x:unknown):x is string=>typeof x==='string'&&TASKS[id].some(t=>t.action===x)):[]}catch{return[]}}
export default function FaithVerseAncientQuestControls({storyId}:{storyId:AncientStoryId}){
 const [completed,setCompleted]=useState<string[]>(()=>getSaved(storyId))
 const [current,setCurrent]=useState(storyId)
 const [notice,setNotice]=useState('Complete four story objectives using large one-handed buttons. No real combat or cloud rewards.')
 const actions=TASKS[storyId]
 const active=current===storyId?completed:getSaved(storyId)
 const perform=(item:Objective)=>{
  const next=Array.from(new Set([...active,item.action]))
  setCompleted(next);setCurrent(storyId)
  try{localStorage.setItem(PREFIX+storyId,JSON.stringify(next))}catch{setNotice('Local storage unavailable; this session is not backed up.');return}
  setNotice(item.feedback)
  window.dispatchEvent(new CustomEvent('tryamm:faithverse-ancient-local-objective',{detail:{storyId,objective:item.action,complete:next.length===actions.length,isSimulation:true,hasFinancialValue:false,cloudPersisted:false}}))
 }
 return <section aria-label="Playable ancient Bible story objectives" style={{padding:13,border:'1px solid #7896a9',borderRadius:14,background:'#102e3b',display:'grid',gap:10}}>
  <h3 style={{margin:0,fontSize:19}}>Story RPG Mission · {active.length}/{actions.length}</h3>
  <p style={{fontSize:13,lineHeight:1.5,margin:0}}>Choose each story action to advance your local roleplay. A real 3D adventure, multiplayer quest awards and real-world rewards are not asserted.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}>
   {actions.map(item=><button key={item.action} onClick={()=>perform(item)} aria-pressed={active.includes(item.action)} style={{...btn,background:active.includes(item.action)?'#275844':'#194559'}}>{active.includes(item.action)?'✓ ':''}{item.label}</button>)}
  </div>
  <p role="status" aria-live="polite" style={{margin:0,fontSize:13,lineHeight:1.6}}>{notice}</p>
  <p style={{margin:0,fontSize:13,color:'#f1d5a2'}}>{active.length===actions.length?'Local fictional mission complete. Review the corresponding passage before returning to StreetVerse.':'Mission objectives remaining: '+(actions.length-active.length)}</p>
 </section>
}
