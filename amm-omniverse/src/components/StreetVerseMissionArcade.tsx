import {useEffect,useState,type CSSProperties} from 'react'
type Mode='after-dark'|'mystery'|'districts'|'shadow'
type Progress={xp:number,credits:number,completed:string[],turn:number,properties:string[],clues:string[],heat:number}
const KEY='tryamm:streetverse-mission-arcade:v1'
const modes:{id:Mode,title:string,subtitle:string}[]=[
 {id:'after-dark',title:'AFTER DARK 007',subtitle:'Undercover Chicago nightlife and nonviolent spy investigations'},
 {id:'mystery',title:'CHICAGO CASEFILES',subtitle:'Deduction, clues, suspects and a city mystery'},
 {id:'districts',title:'STREETVERSE DISTRICT TYCOON',subtitle:'Build neighborhood businesses with fictional credits'},
 {id:'shadow',title:'SHADOW DIVISION',subtitle:'Original MIB-style science-fiction investigations'}
]
const defaultProgress=():Progress=>({xp:0,credits:500,completed:[],turn:0,properties:[],clues:[],heat:0})
function safeProgress():Progress{try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(!p||!Array.isArray(p.completed)||!Array.isArray(p.properties)||!Array.isArray(p.clues))return defaultProgress();return {xp:Math.max(0,Number(p.xp)||0),credits:Math.max(0,Number(p.credits)||0),completed:p.completed.filter((x:unknown)=>typeof x==='string').slice(-100),turn:Math.max(0,Number(p.turn)||0),properties:p.properties.filter((x:unknown)=>typeof x==='string'),clues:p.clues.filter((x:unknown)=>typeof x==='string'),heat:Math.max(0,Math.min(100,Number(p.heat)||0))}}catch{return defaultProgress()}}
const missions:Record<Mode,{id:string,title:string,brief:string,choices:{label:string,feedback:string,success:boolean}[]}[]>={
 'after-dark':[
 {id:'ad1',title:'Club Neon — Quiet Entry',brief:'A Chicago nightclub has a suspicious counterfeit VIP pass. What is the safest investigative approach?',choices:[{label:'Ask security to verify the pass',feedback:'Security documents the issue without escalating. +75 XP',success:true},{label:'Force entry past security',feedback:'Unsafe and unauthorized. Ask for a lawful verification.',success:false}]},
 {id:'ad2',title:'After-Hours Dispatch',brief:'A staff member reports a possible medical emergency on the dance floor.',choices:[{label:'Call qualified emergency help and clear access',feedback:'Your team supports a safe response. +75 XP',success:true},{label:'Ignore the report to protect the mission',feedback:'Safety comes first. Try again.',success:false}]},
 {id:'ad3',title:'Evidence Handoff',brief:'You found a missing event ledger. How should you record the discovery?',choices:[{label:'Document the chain of custody',feedback:'Evidence secured for review. +75 XP',success:true},{label:'Post a photograph publicly',feedback:'Preserve privacy and integrity instead.',success:false}]}
 ],
 mystery:[
 {id:'ms1',title:'The Vanished Jazz Score',brief:'An original jazz manuscript is missing from a locked rehearsal studio. You find a damp delivery receipt and a clean window latch.',choices:[{label:'Inspect the delivery receipt',feedback:'CLUE: The delivery route was changed. +75 XP',success:true},{label:'Accuse the pianist without evidence',feedback:'Investigate clues before making accusations.',success:false}]},
 {id:'ms2',title:'Interview the Stage Manager',brief:'The stage manager says the back door was open briefly for a courier.',choices:[{label:'Compare the courier log and stage schedule',feedback:'CLUE: The courier arrived after rehearsal ended. +75 XP',success:true},{label:'Treat the interview as a confession',feedback:'Statements are evidence to verify, not proof.',success:false}]},
 {id:'ms3',title:'Solve the Missing Score',brief:'The delivery receipt and stage schedule both point to a mislabeled storage crate. What do you do?',choices:[{label:'Search the crate with venue staff permission',feedback:'Case solved: the manuscript was misfiled, not stolen. +75 XP',success:true},{label:'Publish allegations about the staff',feedback:'The evidence does not support that claim.',success:false}]}
 ],
 districts:[
 {id:'dt1',title:'Taylor Street Business License',brief:'A neighborhood storefront needs a business plan before it can open.',choices:[{label:'Review zoning, costs and accessibility',feedback:'Planning complete. +75 XP',success:true},{label:'Open without permits',feedback:'Choose a responsible business launch.',success:false}]},
 {id:'dt2',title:'Community Hiring Mission',brief:'Your fictional storefront is ready to add two staff members.',choices:[{label:'Offer transparent pay and accessible interviews',feedback:'The storefront is ready to hire. +75 XP',success:true},{label:'Make applicants pay to apply',feedback:'Fair hiring builds stronger districts.',success:false}]},
 {id:'dt3',title:'District Launch Celebration',brief:'The neighborhood wants an inclusive grand opening.',choices:[{label:'Create an accessible free community event',feedback:'Grand opening complete. +75 XP',success:true},{label:'Block public walkways',feedback:'Keep public areas accessible.',success:false}]}
 ],
 shadow:[
 {id:'sd1',title:'Unidentified Signal at Circle Park',brief:'A mysterious glowing object broadcasts a repeating sequence. Your fictional research team arrives.',choices:[{label:'Scan from a safe distance',feedback:'SIGNAL: Three repeating tones detected. +75 XP',success:true},{label:'Grab the unknown object',feedback:'Observe unknown objects safely first.',success:false}]},
 {id:'sd2',title:'Visitor at the Transit Station',brief:'A friendly traveler reports a nonhuman language pattern and asks for help.',choices:[{label:'Use a consent-based translation tool',feedback:'CONTACT: The traveler requests a safe passage route. +75 XP',success:true},{label:'Detain the traveler without cause',feedback:'Respect rights and avoid needless force.',success:false}]},
 {id:'sd3',title:'The Skyway Portal',brief:'A glowing portal is destabilizing above the empty skyway. How does the team respond?',choices:[{label:'Evacuate safely and stabilize the field remotely',feedback:'Portal stabilized without injury. +75 XP',success:true},{label:'Enter with no safety assessment',feedback:'Assess and stabilize the situation first.',success:false}]}
 ]
}
const lots=[{id:'circle',name:'Circle Park Studio',cost:150},{id:'taylor',name:'Taylor Street Market',cost:225},{id:'south',name:'South Side Music Hall',cost:350},{id:'west',name:'West Side Art Gallery',cost:275}]
const btn:CSSProperties={border:'2px solid #6ad8fd',borderRadius:14,minHeight:62,padding:'12px 16px',background:'#124a6c',color:'white',fontSize:17,fontWeight:800,cursor:'pointer',textAlign:'left'}
export default function StreetVerseMissionArcade(){
 const [mode,setMode]=useState<Mode>('after-dark')
 const [p,setP]=useState<Progress>(safeProgress)
 const [notice,setNotice]=useState('Choose a mission. Progress is saved on this device only.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(p))}catch{setNotice('Local storage is unavailable; progress will not persist after closing this tab.')}},[p])
 const active=missions[mode].find(x=>!p.completed.includes(x.id))
 const finish=(id:string,success:boolean,feedback:string)=>{
  setNotice(feedback)
  if(!success||p.completed.includes(id))return
  setP(previous=>({...previous,xp:previous.xp+75,credits:previous.credits+50,completed:[...previous.completed,id],heat:Math.max(0,previous.heat-5),clues:mode==='mystery'||mode==='shadow'?[...previous.clues,id]:previous.clues}))
 }
 const build=(id:string,cost:number)=>{
  if(p.properties.includes(id)){setNotice('Already owned on this device.');return}
  if(p.credits<cost){setNotice('Earn more fictional credits by completing missions. No real money is used.');return}
  setP(previous=>({...previous,credits:previous.credits-cost,properties:[...previous.properties,id]}))
  setNotice('Business built! This is a local prototype, not a real-world ownership claim or blockchain transaction.')
 }
 const roll=()=>{const dice=Math.floor(Math.random()*6)+1;setP(previous=>({...previous,turn:previous.turn+dice,credits:previous.credits+10}));setNotice('You moved '+dice+' spaces and earned 10 fictional credits. No purchases, gambling or real payouts.')}
 return <main style={{minHeight:'100vh',background:'linear-gradient(#0c1531,#030816)',color:'#f2f8ff',fontFamily:'system-ui',padding:'16px 12px 70px'}}>
  <div style={{maxWidth:930,margin:'auto'}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
    <strong style={{color:'#ffe0a0'}}>TRYAMM • STREETVERSE</strong><a href="/" style={{...btn,textDecoration:'none'}}>HOME</a>
   </header>
   <h1 style={{fontSize:'clamp(28px,6vw,48px)',marginBottom:3}}>MISSION ARCADE</h1>
   <p>Four original Chicago story modes • large one-hand controls • no real-money gameplay</p>
   <section aria-label="Game progress" style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
    {['XP: '+p.xp,'Fictional credits: '+p.credits,'Missions: '+p.completed.length+'/12','Businesses: '+p.properties.length].map(x=><span key={x} style={{border:'1px solid #547fa6',borderRadius:12,padding:10,fontWeight:750}}>{x}</span>)}
   </section>
   <nav aria-label="Game modes" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
    {modes.map(x=><button type="button" aria-pressed={mode===x.id} onClick={()=>{setMode(x.id);setNotice(x.title+' selected.')}} key={x.id} style={{...btn,background:mode===x.id?'#705092':'#143452',borderColor:mode===x.id?'#ffe0a0':'#5796bf'}}>{x.title}<span style={{display:'block',fontSize:13,fontWeight:500,marginTop:5}}>{x.subtitle}</span></button>)}
   </nav>
   <section style={{background:'#101e35',border:'1px solid #457699',padding:18,borderRadius:18,marginTop:18}}>
    <h2 style={{fontSize:25,marginTop:0}}>{modes.find(x=>x.id===mode)?.title}</h2>
    {active?<><h3 style={{fontSize:21}}>{active.title}</h3><p style={{fontSize:18,lineHeight:1.6}}>{active.brief}</p>
      <div style={{display:'grid',gap:12}}>{active.choices.map((choice,i)=><button key={i} type="button" style={btn} onClick={()=>finish(active.id,choice.success,choice.feedback)}>{choice.label}</button>)}</div>
     </>:<p style={{fontSize:20}}>All three missions in this mode are complete. Choose another mode to continue!</p>}
    <p role="status" aria-live="polite" style={{color:'#ffe6a2',fontSize:17,minHeight:48,lineHeight:1.5}}>{notice}</p>
   </section>
   {mode==='districts'&&<section style={{marginTop:20}}><h2>District Property Board</h2>
    <button type="button" style={btn} onClick={roll}>ROLL ONE DIE — MOVE</button>
    <p>Position: {p.turn%12} of 12. Every roll earns 10 fictional credits. This is a non-monetized neighborhood simulator.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
     {lots.map(l=><div key={l.id} style={{padding:15,borderRadius:14,background:'#142944',border:'1px solid #547d99'}}>
       <h3>{l.name}</h3><p>Cost: {l.cost} fictional credits</p>
       <button type="button" style={{...btn,width:'100%'}} disabled={p.properties.includes(l.id)} onClick={()=>build(l.id,l.cost)}>{p.properties.includes(l.id)?'OWNED':'BUILD BUSINESS'}</button>
      </div>)}
    </div>
   </section>}
   <footer style={{marginTop:28,fontSize:14,color:'#a5bed0',lineHeight:1.6}}>Prototype rules: locally saved progress, deterministic mission answers, no real gambling, no real estate ownership, no artist or third-party brand affiliation. This is not a 3D world integration test. The After Dark and Shadow Division narratives promote safe, consent-based, nonviolent problem-solving.</footer>
   <button style={{...btn,marginTop:14,background:'#402f51'}} onClick={()=>{if(window.confirm('Clear your locally saved arcade progress?')){setP(defaultProgress());setNotice('Progress reset on this device.')}}}>RESET LOCAL ARCADE</button>
  </div>
 </main>
}
