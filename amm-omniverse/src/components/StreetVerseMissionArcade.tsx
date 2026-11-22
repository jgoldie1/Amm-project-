import {useEffect,useState,type CSSProperties} from 'react'
import {makeLocalMissionReceipt,TRYAMM_MISSION_EVENT} from '../foundation/streetverseIntegrationRegistry.js'
import StreetVerseContextActions from './StreetVerseContextActions'
type Mode='after-dark'|'mystery'|'districts'|'shadow'|'fire'|'undercover'|'er'|'dispatch'|'homicide'|'sports'|'grocery'|'trucking'|'housing'|'health'|'parkour'|'rescue'|'action'
type Progress={xp:number,credits:number,completed:string[],turn:number,properties:string[],clues:string[],heat:number}
const KEY='tryamm:streetverse-mission-arcade:v1'
const modes:{id:Mode,title:string,subtitle:string}[]=[
 {id:'after-dark',title:'AFTER DARK: AGENT NIGHTFALL',subtitle:'Original Chicago nightlife and nonviolent secret-investigation stories'},
 {id:'mystery',title:'CHICAGO CASEFILES',subtitle:'Deduction, clues, suspects and a city mystery'},
 {id:'districts',title:'STREETVERSE DISTRICT TYCOON',subtitle:'Build neighborhood businesses with fictional credits'},
 {id:'shadow',title:'SHADOW DIVISION',subtitle:'Original MIB-style science-fiction investigations'},
 {id:'fire',title:'CHICAGO FIRE & RESCUE',subtitle:'Dispatch, fire safety and rescue teamwork'},
 {id:'undercover',title:'CHICAGO UNDERCOVER',subtitle:'Ethical surveillance, witness safety and undercover casework'},
 {id:'er',title:'CHICAGO UNIVERSITY ER',subtitle:'Fictional university emergency medicine and patient care'},
 {id:'dispatch',title:'CHICAGO 911 DISPATCH',subtitle:'Emergency call-taking, escalation and team coordination'},
 {id:'homicide',title:'CHICAGO HOMICIDE CASEFILES',subtitle:'Evidence review, victim-centered interviews and cold cases'},
 {id:'sports',title:'STREETVERSE SPORTS CAREER',subtitle:'Training, teamwork and sports championships'},
 {id:'grocery',title:'CHICAGO GROCERY & SUPPLY',subtitle:'Shopping, retail shifts, deliveries and community inventory'},
 {id:'trucking',title:'HOLO FREIGHT & LOGISTICS',subtitle:'Cargo pickup, inspections and safe supply-chain deliveries'},
 {id:'housing',title:'FAMILY HOME & NEIGHBORHOOD',subtitle:'Housing, furnishing, accessibility and community care'},
 {id:'health',title:'ACCESSIBLE HEALTHCARE RP',subtitle:'Fictional care teamwork, consent and accessibility'},
 {id:'parkour',title:'CHICAGO PARKOUR ACADEMY',subtitle:'Jumps, vaults, obstacle routes and safe landing decisions'},
 {id:'rescue',title:'CITY EMERGENCY CAREERS',subtitle:'Incident coordination, rescue roles and dispatch teamwork'},
 {id:'action',title:'STREETVERSE ACTION STUDIO',subtitle:'Non-graphic action scenes, stunts and simulated range safety'}
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
 ],

 fire:[
 {id:'fr1',title:'Apartment Alarm at 2 A.M.',brief:'A fictional apartment building fire alarm sounds; residents may still be inside.',choices:[{label:'Call emergency dispatch and support evacuation',feedback:'Dispatch mobilizes responders and residents evacuate. +75 XP',success:true},{label:'Enter a smoke-filled hallway alone',feedback:'Avoid smoke and leave entry to trained crews.',success:false}]},
 {id:'fr2',title:'Accessible Evacuation Plan',brief:'A resident using a wheelchair needs an established evacuation plan during a drill.',choices:[{label:'Coordinate trained staff and accessible refuge procedures',feedback:'Everyone is included in a documented safety plan. +75 XP',success:true},{label:'Tell the resident to manage alone',feedback:'An accessible plan must include all residents.',success:false}]},
 {id:'fr3',title:'Post-Fire Community Support',brief:'Families are displaced after a fictional building fire.',choices:[{label:'Connect families with authorized relief and housing support',feedback:'Families receive referrals and documented support. +75 XP',success:true},{label:'Publish residents private information',feedback:'Protect residents privacy.',success:false}]}
 ],
 undercover:[
 {id:'uc1',title:'The Missing Gallery Donation',brief:'A Chicago gallery reports potentially forged donation receipts. You are on a lawful investigation team.',choices:[{label:'Obtain consent and examine authorized records',feedback:'A lawful audit trail is opened. +75 XP',success:true},{label:'Hack private accounts',feedback:'Unauthorized access is not allowed.',success:false}]},
 {id:'uc2',title:'Witness at the Train Station',brief:'A witness is nervous about sharing details of a fictional incident.',choices:[{label:'Explain privacy boundaries and offer voluntary interview',feedback:'Witness safety and informed choice preserved. +75 XP',success:true},{label:'Threaten the witness for answers',feedback:'Coercion is unacceptable.',success:false}]},
 {id:'uc3',title:'The Final Case Review',brief:'The evidence points to administrative error rather than a criminal conspiracy.',choices:[{label:'Document findings and close unsupported allegations',feedback:'An accurate case report is completed. +75 XP',success:true},{label:'Invent a suspect to close the case',feedback:'Evidence must determine the conclusion.',success:false}]}
 ],
 er:[
 {id:'er1',title:'University ER Intake',brief:'At a fictional Chicago university medical center, several patients arrive at once.',choices:[{label:'Alert qualified triage staff and record urgent symptoms',feedback:'Patients are assessed by trained clinicians. +75 XP',success:true},{label:'Ignore urgent symptoms',feedback:'A qualified clinical assessment is needed.',success:false}]},
 {id:'er2',title:'Accessible Patient Communication',brief:'A patient has difficulty speaking after a medical event.',choices:[{label:'Offer accessible communication and contact clinical staff',feedback:'The patient is supported and can communicate needs. +75 XP',success:true},{label:'Assume the patient cannot consent',feedback:'Communication needs do not erase autonomy.',success:false}]},
 {id:'er3',title:'Privacy at Shift Change',brief:'A fictional ER team is preparing a handoff of patient care.',choices:[{label:'Share only necessary information through secure clinical channels',feedback:'The clinical handoff preserves privacy. +75 XP',success:true},{label:'Discuss patient records on public LIVE',feedback:'Medical information must remain confidential.',success:false}]}
 ],
 dispatch:[
 {id:'dp1',title:'911 Call — Location First',brief:'A fictional caller reports a building alarm but is unsure of their exact location.',choices:[{label:'Confirm location and incident details; follow dispatch protocol',feedback:'Responders receive the verified location. +75 XP',success:true},{label:'Guess the address and send units',feedback:'Location verification helps prevent delays.',success:false}]},
 {id:'dp2',title:'Multiple Responders',brief:'A simulated collision requires both medical and fire services.',choices:[{label:'Coordinate dispatch with trained responders and updates',feedback:'Units receive coordinated information. +75 XP',success:true},{label:'Send conflicting unverified messages',feedback:'Use approved dispatch coordination.',success:false}]},
 {id:'dp3',title:'Emergency Callback',brief:'A fictional caller disconnects while reporting an ongoing emergency.',choices:[{label:'Follow authorized callback and escalation procedures',feedback:'The event remains documented and escalated. +75 XP',success:true},{label:'Mark the case resolved without verification',feedback:'Unverified calls require policy-based follow-up.',success:false}]}
 ],
 homicide:[
 {id:'hm1',title:'Casefile 041 — Scene Preservation',brief:'Detectives respond to a fictional suspicious death. Family members are present.',choices:[{label:'Secure the scene respectfully and request qualified investigators',feedback:'Evidence and family dignity are preserved. +75 XP',success:true},{label:'Broadcast graphic scene details',feedback:'Respect privacy, dignity and the investigation.',success:false}]},
 {id:'hm2',title:'The Timeline Discrepancy',brief:'A witness estimate conflicts with an authenticated transit timestamp.',choices:[{label:'Document both and seek corroborating evidence',feedback:'The timeline is reconstructed without assumptions. +75 XP',success:true},{label:'Coerce a matching statement',feedback:'Do not pressure witnesses to change accounts.',success:false}]},
 {id:'hm3',title:'Cold Case Resolution',brief:'A newly recovered record does not support the prime suspect theory.',choices:[{label:'Update the case file and pursue exculpatory evidence',feedback:'The investigation follows evidence fairly. +75 XP',success:true},{label:'Hide the record to preserve the theory',feedback:'Exculpatory evidence must not be concealed.',success:false}]}
 ],
 sports:[
 {id:'sp1',title:'Tryout Day',brief:'A new player arrives at the community basketball court.',choices:[{label:'Offer accessible tryouts and practice drills',feedback:'The team gains a new teammate. +75 XP',success:true},{label:'Exclude new players without assessment',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'sp2',title:'Championship Assist',brief:'A teammate is open for a safe passing opportunity.',choices:[{label:'Pass and support team play',feedback:'The team finishes the play. +75 XP',success:true},{label:'Ignore everyone and force a dangerous move',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'sp3',title:'Sportsmanship Final',brief:'Your team loses a close final.',choices:[{label:'Thank officials and organize the next practice',feedback:'Sportsmanship reward unlocked. +75 XP',success:true},{label:'Harass the referees',feedback:'Try a safe, inclusive and responsible approach.',success:false}]}
 ],
 grocery:[
 {id:'gr1',title:'Fresh Market Shopping',brief:'A shopper needs affordable ingredients for a family meal.',choices:[{label:'Compare prices and select needed groceries',feedback:'Smart shopping completed. +75 XP',success:true},{label:'Waste the food budget',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'gr2',title:'Inventory Shift',brief:'The store finds near-expiration produce.',choices:[{label:'Follow safety guidance and rotate inventory responsibly',feedback:'Food inventory secured. +75 XP',success:true},{label:'Hide expiration labels',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'gr3',title:'Delivery Route',brief:'A customer asks for an accessible doorstep delivery.',choices:[{label:'Verify address and delivery accessibility',feedback:'Delivery completed. +75 XP',success:true},{label:'Leave goods in an unsafe location',feedback:'Try a safe, inclusive and responsible approach.',success:false}]}
 ],
 trucking:[
 {id:'tr1',title:'Warehouse Pickup',brief:'Your fictional freight load is ready for collection.',choices:[{label:'Confirm manifest and secure the load',feedback:'Freight verified. +75 XP',success:true},{label:'Leave without checking',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'tr2',title:'Pretrip Inspection',brief:'The cargo truck has a warning indicator.',choices:[{label:'Pause and request qualified inspection',feedback:'Vehicle released only after inspection. +75 XP',success:true},{label:'Ignore the warning',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'tr3',title:'Last-Mile Delivery',brief:'A receiver reports a changed dock entrance.',choices:[{label:'Verify the dock change with dispatch',feedback:'Freight delivered safely. +75 XP',success:true},{label:'Follow an unverified instruction',feedback:'Try a safe, inclusive and responsible approach.',success:false}]}
 ],
 housing:[
 {id:'ho1',title:'Family Home Search',brief:'A family needs accessible, affordable housing.',choices:[{label:'Compare realistic access and affordability needs',feedback:'Suitable housing options identified. +75 XP',success:true},{label:'Ignore access needs',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'ho2',title:'Move-in Day',brief:'New residents need a clear entryway.',choices:[{label:'Organize a safe accessible move',feedback:'Family moves in. +75 XP',success:true},{label:'Block ramps with boxes',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'ho3',title:'Neighborhood Support',brief:'An older neighbor needs help arranging a repair.',choices:[{label:'Request permission and find an appropriate repair professional',feedback:'Community support completed. +75 XP',success:true},{label:'Enter their home without permission',feedback:'Try a safe, inclusive and responsible approach.',success:false}]}
 ],
 health:[
 {id:'hc1',title:'Patient Check-in',brief:'A patient arrives with urgent symptoms.',choices:[{label:'Alert qualified clinical triage staff',feedback:'Patient receives prompt assessment. +75 XP',success:true},{label:'Attempt diagnosis without training',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'hc2',title:'Consent and Communication',brief:'A patient prefers an accessible communication method.',choices:[{label:'Ask preference and provide suitable communication support',feedback:'Patient-directed care supported. +75 XP',success:true},{label:'Assume consent',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'hc3',title:'Care Team Handoff',brief:'A fictional appointment concludes.',choices:[{label:'Share minimum needed information via approved channels',feedback:'Care handoff recorded. +75 XP',success:true},{label:'Read patient data aloud on stream',feedback:'Try a safe, inclusive and responsible approach.',success:false}]}
 ],
 parkour:[
 {id:'pk1',title:'Obstacle Course',brief:'A parkour coach opens an indoor beginner course.',choices:[{label:'Choose an appropriate beginner obstacle',feedback:'Safe route selected. +75 XP',success:true},{label:'Jump from an unsafe height',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'pk2',title:'Low Vault',brief:'A low practice obstacle is in the path.',choices:[{label:'Use coached low-impact practice',feedback:'Vault stage completed. +75 XP',success:true},{label:'Attempt an uncontrolled stunt',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'pk3',title:'Finish the Course',brief:'The course finale includes an optional alternative path.',choices:[{label:'Choose an accessible safe finish path',feedback:'Course completed. +75 XP',success:true},{label:'Ignore the marked route',feedback:'Try a safe, inclusive and responsible approach.',success:false}]}
 ],
 rescue:[
 {id:'rs1',title:'Emergency Radio Call',brief:'The fictional rescue team receives an alarm.',choices:[{label:'Confirm incident location with dispatch',feedback:'Location verified. +75 XP',success:true},{label:'Guess the address',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'rs2',title:'Responder Coordination',brief:'A rescue scene needs multiple specialties.',choices:[{label:'Request trained fire and clinical responders',feedback:'The response team is coordinated. +75 XP',success:true},{label:'Send unqualified volunteers into danger',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'rs3',title:'Family Reunification',brief:'The event is stabilized and families need updates.',choices:[{label:'Use authorized channels and respect privacy',feedback:'Families receive verified information. +75 XP',success:true},{label:'Share private details publicly',feedback:'Try a safe, inclusive and responsible approach.',success:false}]}
 ],
 action:[
 {id:'ac1',title:'Film Stunt Rehearsal',brief:'An action-movie crew plans a safe simulated fight.',choices:[{label:'Rehearse choreography with qualified safety staff',feedback:'Stunt rehearsed. +75 XP',success:true},{label:'Improvise a dangerous fight',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'ac2',title:'Virtual Target Range',brief:'A fictional training target appears on screen.',choices:[{label:'Confirm safe simulated range mode',feedback:'Target game activated. +75 XP',success:true},{label:'Confuse it with a real-world weapon',feedback:'Try a safe, inclusive and responsible approach.',success:false}]},
 {id:'ac3',title:'Final Scene',brief:'The movie director calls for a controlled finale.',choices:[{label:'Use camera effects and non-graphic choreography',feedback:'Action scene completed. +75 XP',success:true},{label:'Risk crew safety for realism',feedback:'Try a safe, inclusive and responsible approach.',success:false}]}
 ]
}
const lots=[{id:'circle',name:'Circle Park Studio',cost:150},{id:'taylor',name:'Taylor Street Market',cost:225},{id:'south',name:'South Side Music Hall',cost:350},{id:'west',name:'West Side Art Gallery',cost:275}]
const btn:CSSProperties={border:'2px solid #6ad8fd',borderRadius:14,minHeight:62,padding:'12px 16px',background:'#124a6c',color:'white',fontSize:17,fontWeight:800,cursor:'pointer',textAlign:'left'}
export default function StreetVerseMissionArcade(){
 const [mode,setMode]=useState<Mode>('after-dark')
 const [p,setP]=useState<Progress>(safeProgress)
 const [notice,setNotice]=useState('Choose a category and make a decision to complete each story stage. Three missions per category; earn 75 XP and 50 fictional credits per first completion. Progress is saved on this device only.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(p))}catch{setNotice('Local storage is unavailable; progress will not persist after closing this tab.')}},[p])
 const active=missions[mode].find(x=>!p.completed.includes(x.id))
 const finish=(id:string,success:boolean,feedback:string)=>{
  setNotice(feedback)
  if(!success||p.completed.includes(id))return
  const receipt=makeLocalMissionReceipt(mode,id)
  setP(previous=>previous.completed.includes(id)?previous:({...previous,xp:previous.xp+75,credits:previous.credits+50,completed:[...previous.completed,id],heat:Math.max(0,previous.heat-5),clues:mode==='mystery'||mode==='shadow'?[...previous.clues,id]:previous.clues}))
  window.dispatchEvent(new CustomEvent(TRYAMM_MISSION_EVENT,{detail:receipt}))
 }
 const build=(id:string,cost:number)=>{
  if(p.properties.includes(id)){setNotice('Already owned on this device.');return}
  if(p.credits<cost){setNotice('Earn more fictional credits by completing missions. No real money is used.');return}
  setP(previous=>previous.properties.includes(id)||previous.credits<cost?previous:({...previous,credits:previous.credits-cost,properties:[...previous.properties,id]}))
  setNotice('Business built! This is a local prototype, not a real-world ownership claim or blockchain transaction.')
 }
 const roll=()=>{const dice=Math.floor(Math.random()*6)+1;setP(previous=>({...previous,turn:previous.turn+dice}));setNotice('You moved '+dice+' spaces. Complete missions to earn fictional credits; dice rolls do not mint credits.')}
 return <main style={{minHeight:'100vh',background:'linear-gradient(#0c1531,#030816)',color:'#f2f8ff',fontFamily:'system-ui',padding:'16px 12px 70px'}}>
  <div style={{maxWidth:930,margin:'auto'}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
    <strong style={{color:'#ffe0a0'}}>TRYAMM • STREETVERSE</strong><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><a href="/streetverse-integration" style={{...btn,textDecoration:'none'}}>INTEGRATION AUDIT</a><a href="/" style={{...btn,textDecoration:'none'}}>HOME</a></div>
   </header>
   <h1 style={{fontSize:'clamp(28px,6vw,48px)',marginBottom:3}}>MISSION ARCADE</h1>
   <p>Seventeen original Chicago story modes • 51 decisions • large one-hand controls • no real-money gameplay</p><p style={{fontSize:16,lineHeight:1.6}}>Rules: Complete each three-part story in order. A correct decision earns 75 XP and 50 fictional credits once. Incorrect choices give feedback and allow retries. Credits may build fictional storefronts; dice rolls only move your board token. Your progress is local to this device. No pay-to-win, cash-out or wagering.</p>
   <section aria-label="Game progress" style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
    {['XP: '+p.xp,'Fictional credits: '+p.credits,'Missions: '+p.completed.length+'/'+Object.values(missions).reduce((sum,x)=>sum+x.length,0),'Businesses: '+p.properties.length].map(x=><span key={x} style={{border:'1px solid #547fa6',borderRadius:12,padding:10,fontWeight:750}}>{x}</span>)}
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
   <div style={{marginTop:20}}><StreetVerseContextActions /></div>
   {mode==='districts'&&<section style={{marginTop:20}}><h2>District Property Board</h2>
    <button type="button" style={btn} onClick={roll}>ROLL ONE DIE — MOVE</button>
    <p>Position: {p.turn%12} of 12. Dice rolls do not earn credits; complete missions for rewards. This is a non-monetized neighborhood simulator.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
     {lots.map(l=><div key={l.id} style={{padding:15,borderRadius:14,background:'#142944',border:'1px solid #547d99'}}>
       <h3>{l.name}</h3><p>Cost: {l.cost} fictional credits</p>
       <button type="button" style={{...btn,width:'100%'}} disabled={p.properties.includes(l.id)} onClick={()=>build(l.id,l.cost)}>{p.properties.includes(l.id)?'OWNED':'BUILD BUSINESS'}</button>
      </div>)}
    </div>
   </section>}
   <footer style={{marginTop:28,fontSize:14,color:'#a5bed0',lineHeight:1.6}}>Prototype rules: locally saved progress, deterministic mission answers, no real gambling, no real estate ownership, no artist or third-party brand affiliation. This is not a 3D world integration test. All emergency, investigative and science-fiction scenarios are simplified fiction; they are not real emergency instructions or professional training. UIC, Chicago Fire, the Chicago Police Department, and third-party TV franchises are not affiliated or endorsing participants.</footer>
   <button style={{...btn,marginTop:14,background:'#402f51'}} onClick={()=>{if(window.confirm('Clear your locally saved arcade progress?')){setP(defaultProgress());setNotice('Progress reset on this device.')}}}>RESET LOCAL ARCADE</button>
  </div>
 </main>
}
