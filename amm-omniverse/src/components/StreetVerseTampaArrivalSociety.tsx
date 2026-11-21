import {useEffect,useState} from 'react'
export const TAMPA_SOCIETY_CHAPTERS=[
 {id:'A',name:'Arrival & Survival',missions:25},
 {id:'B',name:'Jobs & Transportation',missions:25},
 {id:'C',name:'Housing & Community',missions:25},
 {id:'D',name:'Business & City Leadership',missions:25}
] as const
export const TAMPA_ARRIVAL_MISSIONS=[
 {id:'A01',title:'Airport arrival',action:'CHECK IN AT AIRPORT'},
 {id:'A02',title:'Find a starter job',action:'ACCEPT SALON ASSISTANT JOB'},
 {id:'B01',title:'Get transport',action:'CLAIM STARTER TRANSIT PASS'},
 {id:'C01',title:'Rent first home',action:'RENT STARTER ROOM'},
 {id:'D01',title:'Community introduction',action:'MEET NEIGHBORHOOD REPRESENTATIVE'}
] as const
const KEY='streetverse:tampa-society-arrival:v1'
type Society={step:number;credits:number;job:boolean;transport:boolean;home:boolean;community:boolean;hygiene:number;stress:number}
const initial:Society={step:0,credits:150,job:false,transport:false,home:false,community:false,hygiene:80,stress:20}
function load():Society{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s)return initial;return {step:Math.max(0,Math.min(5,Math.floor(Number(s.step)||0))),credits:Math.max(0,Math.min(100000,Number(s.credits)||0)),job:s.job===true,transport:s.transport===true,home:s.home===true,community:s.community===true,hygiene:Math.max(0,Math.min(100,Number(s.hygiene)||0)),stress:Math.max(0,Math.min(100,Number(s.stress)||0))}}catch{return initial}}
export function StreetVerseTampaArrivalSociety(){
 const [society,setSociety]=useState<Society>(load)
 const [open,setOpen]=useState(false)
 const [message,setMessage]=useState('Complete the five-step arrival mission to establish a Tampa life.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(society))}catch{}},[society])
 const advance=()=>{
  if(society.step>=5){setMessage('Arrival chapter completed. More missions are planned, not yet implemented.');return}
  const step=society.step
  if(step===3&&society.credits<100){setMessage('Earn enough fictional credits before renting.');return}
  setSociety(s=>({...s,step:s.step+1,job:step===1?true:s.job,transport:step===2?true:s.transport,home:step===3?true:s.home,community:step===4?true:s.community,credits:step===1?s.credits+200:step===3?s.credits-100:s.credits,stress:Math.min(100,s.stress+3),hygiene:Math.max(0,s.hygiene-4)}))
  setMessage('Mission '+TAMPA_ARRIVAL_MISSIONS[step].id+' completed. Fictional RP progress saved.')
 }
 const care=(type:'shower'|'rest'|'support')=>{
  setSociety(s=>({...s,hygiene:type==='shower'?Math.min(100,s.hygiene+45):s.hygiene,stress:type==='rest'?Math.max(0,s.stress-35):type==='support'?Math.max(0,s.stress-25):s.stress}))
  setMessage(type==='shower'?'Shower completed: hygiene restored.':type==='rest'?'Rest completed: stress reduced.':'Community support conversation completed.')
 }
 const btn={minHeight:48,borderRadius:9,padding:'8px 10px',fontWeight:800,fontSize:13} as const
 return <section aria-label="Tampa airport arrival and society missions" style={{position:'absolute',left:12,bottom:105,zIndex:36,width:'min(290px,65vw)',background:'rgba(20,25,40,.95)',color:'white',border:'1px solid #b9d3ed',borderRadius:12,padding:10}}>
  <button type="button" onClick={()=>setOpen(v=>!v)} style={{...btn,width:'100%'}}>{open?'CLOSE':'OPEN'} TAMPA ARRIVAL RP</button>
  {open&&<>
   <strong>✈ Tampa Airport → A/B/C/D Society</strong>
   <p style={{fontSize:12,margin:'7px 0'}}>Starter missions: {society.step}/5 · Credits: {society.credits} · Job: {society.job?'Yes':'No'} · Transit: {society.transport?'Yes':'No'} · Home: {society.home?'Yes':'No'}</p>
   <div style={{display:'grid',gap:7}}>
    <button type="button" onClick={advance} disabled={society.step>=5} style={btn}>{society.step<5?TAMPA_ARRIVAL_MISSIONS[society.step].action:'ARRIVAL CHAPTER COMPLETE'}</button>
    <button type="button" onClick={()=>care('shower')} style={btn}>SHOWER / HYGIENE</button>
    <button type="button" onClick={()=>care('rest')} style={btn}>REST / RECOVER</button>
    <button type="button" onClick={()=>care('support')} style={btn}>TALK TO SUPPORT NPC</button>
   </div>
   <p style={{fontSize:12}}>Hygiene: {society.hygiene}% {society.hygiene<30?'· Unpleasant odor: visit a washroom':''} · Stress: {society.stress}% {society.stress>=80?'· Overwhelmed: support and rest available':''}</p>
   <div role="status" aria-live="polite" style={{fontSize:12}}>{message}</div>
   <p style={{fontSize:11}}>Simulated jobs, rent, transit and credits only. No real payments or diagnoses. 100 missions planned; five starter steps implemented.</p>
  </>}
 </section>
}
