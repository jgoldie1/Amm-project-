import {useEffect,useMemo,useState} from 'react'
import {CHICAGO_BUILD_GRID} from '../data/StreetVerseChicagoBuildGrid'
import {UIC_ALL_CAMPUS_HUBS} from '../data/uicCampusVerseHubs'
import {ILLINOIS_CAMPUSVERSE_NETWORK} from '../data/campusVerseIllinoisUniversityNetwork'
import {CHICAGO_77_SLICES,streetVerseCommunitySpawn} from '../config/streetverseCommunitySlices'
import {ILLINOIS_STREETVERSE_HUBS,US_STREETVERSE_STATES} from '../data/StreetVerseExpansionHierarchy'
import {STREETVERSE_GLOBAL_CITIES} from '../data/StreetVerseGlobalRegistry'

type Tab='map'|'build'|'missions'|'campuses'
type Scale='west'|'chicago'|'illinois'|'usa'|'world'
type QuantumTaskView={id:string;stage:string;label:string;state:string;approvalRequired?:boolean;outputs?:string[]}
type QuantumPlanView={id:string;target:{id:string;label:string;scale:Scale};quantumMeaning:string;oracle:{cloudReturnMode:string;requirements:any[]};tasks:QuantumTaskView[];certificationGates:string[]}
type CleanRoomJobView={id:string;targetLabel:string;kind:string;reason:string;status:string;humanReviewRequired:boolean}
type CleanRoomStateView={jobs:CleanRoomJobView[];lastJob:CleanRoomJobView|null}
type Zone={
 id:string
 label:string
 group:'neighborhood'|'school'|'campus'|'medical'|'transit'
 x:number
 z:number
 status:'live'|'playable'|'planned'
 detail:string
 mission?:string
 campusId?:string
}

const ZONES:readonly Zone[]=[
 {id:'circle-park',label:'Circle Park',group:'neighborhood',x:32,z:18,status:'live',detail:'West Side spawn, homes, park, streets, traffic, trees and neighborhood missions.',mission:'circle-park'},
 {id:'jefferson-school',label:'Thomas Jefferson School',group:'school',x:43,z:28,status:'playable',detail:'Reconstructed school exterior with school-life and learning mission hooks.',mission:'jefferson-school'},
 {id:'roosevelt',label:'Roosevelt Road',group:'neighborhood',x:49,z:43,status:'live',detail:'Business, mobility, delivery and mission corridor.',mission:'roosevelt'},
 {id:'taylor',label:'Taylor Street / Little Italy',group:'neighborhood',x:57,z:56,status:'live',detail:'Restaurants, apartments, creator spaces and neighborhood missions.',mission:'taylor'},
 {id:'pilsen',label:'Pilsen',group:'neighborhood',x:63,z:76,status:'playable',detail:'Arts, food, music, homes and community mission district.',mission:'pilsen'},
 {id:'uic-east',label:'UIC East Campus',group:'campus',x:69,z:35,status:'playable',detail:'Student Center East, Daley Library and connected CampusVerse missions.',campusId:'uic'},
 {id:'uic-west',label:'UIC West Campus',group:'medical',x:48,z:24,status:'playable',detail:'Health-sciences district with Medicine, Pharmacy, Dentistry, Nursing, hospital, outpatient care, fitness and transit.',campusId:'uic'},
 {id:'medical-district',label:'Illinois Medical District',group:'medical',x:38,z:34,status:'planned',detail:'Hospital, medical education, ambulance, workforce and health missions.'},
 {id:'malcolm-x',label:'Malcolm X College',group:'campus',x:29,z:42,status:'playable',detail:'Health sciences, virtual hospital, nursing, career and transfer missions.',campusId:'malcolm-x'},
 {id:'malcolm-x-west',label:'Malcolm X West Campus',group:'campus',x:13,z:39,status:'playable',detail:'West Side workforce, adult education, community health and skills missions.',campusId:'malcolm-x-west'},
 {id:'north-lawndale',label:'North Lawndale',group:'neighborhood',x:24,z:70,status:'planned',detail:'Residential blocks, schools, parks, businesses, transit, restoration and community missions.'},
 {id:'east-garfield-park',label:'East Garfield Park',group:'neighborhood',x:17,z:54,status:'planned',detail:'Garfield Park gateway, housing, commerce, transit and neighborhood missions.'},
 {id:'west-garfield-park',label:'West Garfield Park',group:'neighborhood',x:10,z:57,status:'planned',detail:'Residential, business, public-service and mobility expansion district.'},
 {id:'austin',label:'Austin',group:'neighborhood',x:7,z:44,status:'planned',detail:'Large West Side residential and business expansion with schools, parks and transit.'},
 {id:'humboldt-park',label:'Humboldt Park',group:'neighborhood',x:20,z:28,status:'planned',detail:'Park, cultural, residential, business and community-event expansion.'},
 {id:'west-town',label:'West Town',group:'neighborhood',x:35,z:27,status:'planned',detail:'Neighborhood businesses, housing, creator spaces, restaurants and nightlife routes.'},
 {id:'douglass-park',label:'Douglass Park',group:'neighborhood',x:31,z:72,status:'planned',detail:'Park recreation, sports, community events and nearby neighborhood missions.'},
 {id:'union-park',label:'Union Park',group:'neighborhood',x:49,z:36,status:'planned',detail:'Park, event, transit and Near West Side connector missions.'},
 {id:'cta-west',label:'CTA + Bus Network',group:'transit',x:21,z:47,status:'planned',detail:'Pink/Green/Blue Line connections, buses, stops, stations and transit missions.'},
 {id:'west-side-corridor',label:'West Side Expansion',group:'neighborhood',x:18,z:62,status:'planned',detail:'Continuous neighborhood build linking the Near West Side through Garfield Park, North Lawndale, Austin and surrounding West Side districts.'},
]

const MISSING_SYSTEMS=[
 'Photo-accurate facade and PBR material pass',
 'Enterable interiors: apartments, stores, schools, hospitals and campuses',
 'Traffic signals, street signs, alleys, parking, bus stops and CTA stations',
 'More realistic residents, students, workers, police, fire and EMS NPCs',
 'Emergency stations, hospitals, clinics and incident routes',
 'Utilities: streetlights, power, water, sanitation, construction and repair',
 'Housing lifecycle: units, furniture, ownership, rent, repairs and neighborhood services',
 'Businesses: restaurants, stores, salons, gas, delivery, creator spaces and jobs',
 'Parks, sports courts, playgrounds, trees, landscaping and seasonal life',
 'Mission continuity across every district with checkpoints, rewards and Reel capture',
] as const

const BUILD_LANES=[
 {id:'city-shells',label:'Buildings + interiors',items:'shells • entrances • floors • stairs • elevators • rooms • collision'},
 {id:'streets',label:'Roads + sidewalks',items:'two-way traffic • curbs • lanes • crosswalks • parking • signals'},
 {id:'life',label:'Living world',items:'NPCs • students • residents • traffic • emergency services • routines'},
 {id:'missions',label:'Mission graph',items:'markers • start/end • checkpoints • XP • rewards • reels'},
 {id:'assets',label:'Production assets',items:'GLB • PBR materials • LOD • rigged characters • vehicles • props'},
 {id:'campus',label:'Campus reconstruction',items:'UIC • Malcolm X • Greenville • UIUC • UIS • SIU network'},
] as const

const MISSIONS=[
 'Circle Park orientation + neighborhood life',
 'Thomas Jefferson school day + learning',
 'Roosevelt delivery / business route',
 'Taylor Street food / creator route',
 'Pilsen arts / community route',
 'UIC East → West Campus walk and health-sciences missions',
 'Malcolm X health-sciences + career path',
 'Emergency response / hospital transport',
 'West Side construction / property restoration',
 'Creator Reel capture after mission completion',
] as const

const statusColor={live:'#72ffb0',playable:'#6de3ff',planned:'#ffd15c'} as const
const scaleLabel:Record<Scale,string>={west:'WEST SIDE',chicago:'CHICAGO 77',illinois:'ILLINOIS',usa:'USA',world:'WORLD'}

export default function StreetVerseWestSideWorldBuilder(){
 const [open,setOpen]=useState(false)
 const [tab,setTab]=useState<Tab>('map')
 const [scale,setScale]=useState<Scale>('west')
 const [selected,setSelected]=useState<Zone>(ZONES[0])
 const [notice,setNotice]=useState('World Builder ready • West Side → Chicago 77 → Illinois → USA → World.')
 const [quantumPlan,setQuantumPlan]=useState<QuantumPlanView|null>(null)
 const [cleanRoom,setCleanRoom]=useState<CleanRoomStateView>({jobs:[],lastJob:null})
 const [layers,setLayers]=useState({neighborhood:true,school:true,campus:true,medical:true,transit:true})
 const visible=useMemo(()=>ZONES.filter(z=>layers[z.group]),[layers])

 useEffect(()=>{
  const show=()=>setOpen(true)
  window.addEventListener('tryamm:west-side-builder-open',show)
  return()=>window.removeEventListener('tryamm:west-side-builder-open',show)
 },[])

 useEffect(()=>{
  const sync=(event:Event)=>{
   const d=(event as CustomEvent<{activePlan?:QuantumPlanView|null}>).detail||{}
   setQuantumPlan(d.activePlan||null)
  }
  window.addEventListener('tryamm:quantum-world-builder-state',sync)
  window.dispatchEvent(new CustomEvent('tryamm:quantum-world-builder-request-state'))
  return()=>window.removeEventListener('tryamm:quantum-world-builder-state',sync)
 },[])

 useEffect(()=>{
  const sync=(event:Event)=>{
   const d=(event as CustomEvent<Partial<CleanRoomStateView>>).detail||{}
   setCleanRoom({jobs:Array.isArray(d.jobs)?d.jobs:[],lastJob:d.lastJob||null})
  }
  window.addEventListener('tryamm:mind-over-matter-clean-room-state',sync)
  window.dispatchEvent(new CustomEvent('tryamm:mind-over-matter-clean-room-request-state'))
  return()=>window.removeEventListener('tryamm:mind-over-matter-clean-room-state',sync)
 },[])

 useEffect(()=>{
  if(!open||scale!=='west')return
  const targets=ZONES.map(z=>({id:`west-builder:${z.id}`,label:z.label,kind:z.campusId?'portal':'mission',x:z.x,z:z.z,metadata:{builder:true,status:z.status,group:z.group,campusId:z.campusId}}))
  window.dispatchEvent(new CustomEvent('tryamm:construct:targets',{detail:targets}))
 },[open,scale])

 const focus=(zone:Zone)=>{
  setSelected(zone)
  setNotice(`FOCUS • ${zone.label}`)
  window.dispatchEvent(new CustomEvent('tryamm:construct:focus',{detail:{id:`west-builder:${zone.id}`}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-builder-focus',{detail:zone}))
 }

 const startMission=(zone:Zone)=>{
  const detail={missionId:`west-builder:${zone.id}`,id:`west-builder:${zone.id}`,title:`West Side • ${zone.label}`,objective:`Reach and complete the ${zone.label} district objective.`,campus:zone.campusId,source:'streetverse-world-builder'}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-mission-open',{detail}))
  setNotice(`MISSION SENT • ${zone.label}`)
 }

 const openCampus=(campusId:string)=>{
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-travel',{detail:{to:campusId,source:'streetverse-world-builder'}}))
  setNotice(`CAMPUSVERSE • ${campusId.toUpperCase()}`)
 }

 const openCommunity=(areaNumber:string,name:string)=>{
  const spawn=streetVerseCommunitySpawn(areaNumber)
  const destination={id:`ca-${areaNumber}`,type:'community-area',communityAreaNumber:areaNumber,name,label:name,city:'Chicago'}
  try{
   localStorage.setItem('tryamm.streetverse.chicago-destination.v2',JSON.stringify(destination))
   const save=JSON.parse(localStorage.getItem('tryamm.streetverse.living.v1')||'{}')
   localStorage.setItem('tryamm.streetverse.living.v1',JSON.stringify({...save,x:spawn.x,z:spawn.z,communityAreaNumber:areaNumber,geoSpawnLabel:name,updatedAt:new Date().toISOString()}))
  }catch{}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-community-travel',{detail:{...destination,...spawn,source:'streetverse-world-builder'}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-drop-to-player',{detail:{x:spawn.x,z:spawn.z,consent:true,userId:`community-${areaNumber}`}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-community-slice-ready',{detail:{communityAreaNumber:areaNumber,name,status:'BUILDING',spawn}}))
  setNotice(`CHICAGO ${areaNumber}/77 • ${name} • destination saved and route sent.`)
 }

 const focusIllinois=(id:string,label:string,status:string)=>{
  if(id==='chicago'){setScale('chicago');setNotice('CHICAGO • opening all 77 community areas.');return}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-illinois-build-focus',{detail:{id,label,status,source:'streetverse-world-builder'}}))
  setNotice(`${label.toUpperCase()} • ${status.toUpperCase()} • compiler/build focus selected.`)
 }

 const focusState=(id:string,label:string,status:string)=>{
  if(id==='illinois'){setScale('illinois');setNotice('ILLINOIS • opening statewide build layer.');return}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-state-build-focus',{detail:{id,label,status,source:'streetverse-world-builder'}}))
  setNotice(`${label.toUpperCase()} • state world plan selected; not yet certified playable.`)
 }

 const focusWorldCity=(id:string,name:string,status:string)=>{
  if(id==='chicago'){setScale('chicago');setNotice('CHICAGO • live-alpha reference city • opening 77 community areas.');return}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-global-city-focus',{detail:{id,name,status,source:'streetverse-world-builder'}}))
  setNotice(`${name.toUpperCase()} • ${status.toUpperCase()} • global compiler focus selected.`)
 }

 const openBuildSwarm=()=>{
  const fn=(window as any).__showBuildSwarm
  if(typeof fn==='function'){fn();setNotice('Build Swarm opened.')}
  else setNotice('Build Swarm is installed but its control panel is not mounted on this surface.')
 }

 const requestQuantumPlan=()=>{
  const target=scale==='west'
   ?{id:selected.id,label:selected.label,scale,status:selected.status,metadata:{group:selected.group}}
   :scale==='chicago'
    ?{id:'chicago-77',label:'Chicago • All 77 Community Areas',scale}
    :scale==='illinois'
     ?{id:'illinois',label:'Illinois Statewide StreetVerse',scale}
     :scale==='usa'
      ?{id:'united-states',label:'United States • 50-State StreetVerse',scale}
      :{id:'global-streetverse',label:'Global StreetVerse',scale}
  window.dispatchEvent(new CustomEvent('tryamm:quantum-world-builder-request',{detail:target}))
  setNotice(`QUANTUM PLAN • ${target.label} • Oracle → Cursor Construct → World Forger → Construct → QA`)
 }

 const openCursorConstruct=()=>{
  const target=quantumPlan?.target||{id:selected.id,label:selected.label,scale}
  window.dispatchEvent(new CustomEvent('tryamm:shared-world-context-query',{detail:{surface:'construct',mode:'propose-build',query:target.label,selectedId:target.id,city:target.scale==='west'||target.scale==='chicago'?'Chicago':undefined}}))
  window.dispatchEvent(new CustomEvent('tryamm:construct:map-toggle'))
  setNotice(`CURSOR CONSTRUCT • ${target.label} • proposal + world-aware map opened.`)
 }

 const originalizeSelected=()=>{
  const target=quantumPlan?.target||(scale==='west'
   ?{id:selected.id,label:selected.label,scale}
   :{id:`streetverse-${scale}`,label:`${scaleLabel[scale]} StreetVerse`,scale})
  window.dispatchEvent(new CustomEvent('tryamm:mind-over-matter-original-bundle-request',{detail:{
   targetId:target.id,
   targetLabel:target.label,
   reason:'manual-original-request',
   functionalRequirements:[
    {id:'streetverse-function',label:'StreetVerse functional compatibility',value:true,source:'gameplay-requirement'},
    {id:'mobile-access',label:'Mobile and one-hand accessibility',value:true,source:'accessibility-requirement'},
    {id:'original-design',label:'TRYAMM original visual/audio identity',value:true,source:'tryamm-design'},
   ],
  }}))
  setNotice(`MIND OVER MATTER • original clean-room replacement bundle queued for ${target.label}.`)
 }

 return <>
  <button aria-label="Open StreetVerse World Builder" onClick={()=>setOpen(true)} style={{position:'fixed',left:12,top:'max(62px,calc(env(safe-area-inset-top) + 54px))',zIndex:42100,minHeight:42,padding:'7px 10px',borderRadius:12,border:'1px solid #6de3ff88',background:'#071923e8',color:'#e8fbff',font:'950 9px system-ui',boxShadow:'0 8px 24px #0008'}}>🛠 WORLD</button>

  {open&&<section role="dialog" aria-modal="true" aria-label="StreetVerse World Builder" style={{position:'fixed',inset:0,zIndex:62000,display:'grid',gridTemplateRows:'auto auto auto 1fr',background:'#020810f8',color:'#fff',fontFamily:'system-ui',overflow:'hidden'}}>
   <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'calc(env(safe-area-inset-top) + 8px) 12px 8px',borderBottom:'1px solid #244254',background:'linear-gradient(90deg,#071722,#15102a)'}}>
    <div><div style={{fontSize:9,fontWeight:950,letterSpacing:2,color:'#6de3ff'}}>STREETVERSE • WORLD FORGER</div><strong style={{fontSize:18}}>STREETVERSE WORLD BUILDER</strong><div style={{fontSize:9,opacity:.68}}>West Side → Chicago 77 → Illinois → USA → World</div></div>
    <button onClick={()=>setOpen(false)} aria-label="Close StreetVerse World Builder" style={closeBtn}>×</button>
   </header>

   <div style={{display:'flex',gap:5,overflowX:'auto',padding:'7px 8px 0'}}>
    {(['west','chicago','illinois','usa','world'] as const).map(s=><button key={s} onClick={()=>{setScale(s);setTab('map')}} style={{...chip,opacity:scale===s?1:.55,borderColor:scale===s?'#6de3ff':'#345363'}}>{scaleLabel[s]}</button>)}
   </div>

   <nav style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,padding:8,borderBottom:'1px solid #193343'}}>
    {(['map','build','missions','campuses'] as const).map(t=><button key={t} onClick={()=>setTab(t)} style={{...tabBtn,borderColor:tab===t?'#6de3ff':'#29404e',background:tab===t?'#103140':'#09151e'}}>{t.toUpperCase()}</button>)}
   </nav>

   <div style={{minHeight:0,overflow:'auto',padding:10}}>
    {tab==='map'&&scale==='west'&&<>
     <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:8}}>
      {(Object.keys(layers) as (keyof typeof layers)[]).map(k=><button key={k} onClick={()=>setLayers(v=>({...v,[k]:!v[k]}))} style={{...chip,opacity:layers[k]?1:.42}}>{k.toUpperCase()}</button>)}
     </div>
     <div style={{position:'relative',height:'min(58vh,480px)',minHeight:330,border:'1px solid #315264',borderRadius:18,background:'radial-gradient(circle at 48% 38%,#17313d 0,#0b1b24 44%,#061018 100%)',overflow:'hidden'}}>
      <div style={{position:'absolute',left:'7%',right:'7%',top:'46%',height:9,background:'#2c3338',border:'1px solid #69737b',transform:'rotate(-2deg)'}}/>
      <div style={{position:'absolute',left:'39%',top:'8%',bottom:'7%',width:9,background:'#2c3338',border:'1px solid #69737b',transform:'rotate(3deg)'}}/>
      <div style={{position:'absolute',left:'12%',right:'8%',top:'68%',height:7,background:'#30373b',opacity:.9}}/>
      {visible.map(z=><button key={z.id} onClick={()=>focus(z)} title={z.label} style={{position:'absolute',left:`${z.x}%`,top:`${z.z}%`,transform:'translate(-50%,-50%)',width:selected.id===z.id?22:17,height:selected.id===z.id?22:17,borderRadius:99,border:`3px solid ${selected.id===z.id?'#fff':statusColor[z.status]}`,background:statusColor[z.status],boxShadow:`0 0 18px ${statusColor[z.status]}`,padding:0}}/>)}
      <div style={{position:'absolute',left:8,bottom:8,padding:'7px 8px',borderRadius:10,background:'#061018dd',fontSize:9,lineHeight:1.5}}>
       <span style={{color:statusColor.live}}>● LIVE</span> &nbsp;<span style={{color:statusColor.playable}}>● PLAYABLE</span> &nbsp;<span style={{color:statusColor.planned}}>● PLANNED</span>
      </div>
     </div>
     <article style={card}>
      <div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>{selected.label}</b><span style={{fontSize:9,color:statusColor[selected.status],fontWeight:950}}>{selected.status.toUpperCase()}</span></div>
      <p style={{fontSize:11,lineHeight:1.5,color:'#a9bbc7'}}>{selected.detail}</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
       <button onClick={()=>focus(selected)} style={actionBtn}>VECTOR ROUTE</button>
       <button onClick={()=>startMission(selected)} style={actionBtn}>START MISSION</button>
       {selected.campusId&&<button onClick={()=>openCampus(selected.campusId!)} style={{...actionBtn,gridColumn:'1 / -1'}}>OPEN CAMPUSVERSE</button>}
      </div>
     </article>
    </>}

    {tab==='map'&&scale==='chicago'&&<>
     <article style={card}><b>CHICAGO • ALL 77 COMMUNITY AREAS</b><p style={muted}>Every official community-area slice is connected to the shared StreetVerse engine. BUILDING means the mission scaffold exists; it does not mean the neighborhood is already photo-accurate or production-certified.</p></article>
     <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:6,marginTop:8}}>
      {CHICAGO_77_SLICES.map(slice=><button key={slice.communityAreaNumber} onClick={()=>openCommunity(slice.communityAreaNumber,slice.name)} style={{...rowBtn,minHeight:58,contentVisibility:'auto'}}><span><b>{slice.communityAreaNumber}. {slice.name}</b><small style={{display:'block',opacity:.68}}>{slice.missions.length} mission anchors</small></span><span style={{fontSize:8,color:slice.status==='CERTIFIED'?'#72ffb0':'#ffd15c'}}>{slice.status}</span></button>)}
     </div>
    </>}

    {tab==='map'&&scale==='illinois'&&<>
     <article style={card}><b>ILLINOIS • STATEWIDE EXPANSION</b><p style={muted}>Chicago is the reference city. The other Illinois hubs use the same shared engine/compiler so roads, businesses, campuses, missions, media and accessibility do not fork into separate games.</p></article>
     <div style={{display:'grid',gap:6,marginTop:8}}>{ILLINOIS_STREETVERSE_HUBS.map(node=><button key={node.id} onClick={()=>focusIllinois(node.id,node.label,node.status)} style={rowBtn}><span><b>{node.label}</b><small style={{display:'block',opacity:.68}}>{node.region} • {node.detail}</small></span><span style={{fontSize:8,color:node.status==='live'?'#72ffb0':node.status==='building'?'#6de3ff':'#ffd15c'}}>{node.status.toUpperCase()}</span></button>)}</div>
    </>}

    {tab==='map'&&scale==='usa'&&<>
     <article style={card}><b>UNITED STATES • 50-STATE WORLD COMPILER</b><p style={muted}>Illinois drills back into the statewide build. Other states are registered as planned compiler targets until cities and source-backed geography are actually built and certified.</p></article>
     <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:6,marginTop:8}}>{US_STREETVERSE_STATES.map(node=><button key={node.id} onClick={()=>focusState(node.id,node.label,node.status)} style={{...rowBtn,minHeight:54,contentVisibility:'auto'}}><span><b>{node.label}</b><small style={{display:'block',opacity:.68}}>{node.status}</small></span><span>›</span></button>)}</div>
    </>}

    {tab==='map'&&scale==='world'&&<>
     <article style={card}><b>GLOBAL STREETVERSE</b><p style={muted}>One shared world engine with city manifests. Chicago is live-alpha; BUILDING and PLANNED cities remain compiler targets until their source, rights, mobile, accessibility and performance gates pass.</p></article>
     <div style={{display:'grid',gap:6,marginTop:8}}>{STREETVERSE_GLOBAL_CITIES.map(city=><button key={city.id} onClick={()=>focusWorldCity(city.id,city.name,city.status)} style={rowBtn}><span><b>{city.name} • {city.country}</b><small style={{display:'block',opacity:.68}}>{city.region} • {city.features.slice(0,4).join(' • ')}</small></span><span style={{fontSize:8,color:city.status==='live-alpha'?'#72ffb0':city.status==='building'?'#6de3ff':'#ffd15c'}}>{city.status.toUpperCase()}</span></button>)}</div>
    </>}

    {tab==='build'&&<>
     <article style={card}><b>BUILD CONTROL • {scaleLabel[scale]}</b><p style={muted}>Visible construction manifest for the selected world scale. Build actions still require committed code/assets; this screen does not pretend background work happened.</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}><button onClick={requestQuantumPlan} style={{...actionBtn,gridColumn:'1 / -1'}}>⚛ QUANTUM AUTO PLAN</button><button onClick={openCursorConstruct} style={actionBtn}>CURSOR CONSTRUCT</button><button onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:construct:scan'));setNotice('CONSTRUCT SCAN • checking nearby world targets.')}} style={actionBtn}>SCAN</button><button onClick={originalizeSelected} style={{...actionBtn,gridColumn:'1 / -1',borderColor:'#c48cff99'}}>🧠 MIND OVER MATTER • MAKE OUR VERSION</button><button onClick={openBuildSwarm} style={{...actionBtn,gridColumn:'1 / -1'}}>OPEN BUILD SWARM</button></div></article>
     {quantumPlan&&<article style={card}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>QUANTUM BUILD QUEUE</b><span style={{fontSize:8,color:'#6de3ff'}}>{quantumPlan.oracle.cloudReturnMode.toUpperCase()}</span></div><div style={{fontSize:11,fontWeight:850,marginTop:5}}>{quantumPlan.target.label}</div><div style={muted}>{quantumPlan.quantumMeaning}</div><div style={{display:'grid',gap:5,marginTop:8}}>{quantumPlan.tasks.map((task,index)=><div key={task.id} style={{display:'grid',gridTemplateColumns:'24px 1fr auto',gap:7,alignItems:'center',padding:'7px 8px',borderRadius:9,background:'#0c1b24',border:'1px solid #294655'}}><span style={{fontSize:9,fontWeight:950,color:'#6de3ff'}}>{String(index+1).padStart(2,'0')}</span><span><b style={{fontSize:10}}>{task.label}</b><small style={{display:'block',opacity:.62}}>{task.stage}{task.approvalRequired?' • approval gate':''}</small></span><span style={{fontSize:8,color:task.state==='ready'?'#72ffb0':task.state==='passed'?'#72ffb0':task.state==='failed'?'#ff7c7c':'#ffd15c'}}>{task.state.toUpperCase()}</span></div>)}</div><div style={{marginTop:8,fontSize:9,color:'#9eb4c0'}}>Oracle requirements: {quantumPlan.oracle.requirements.length} • Certification gates: {quantumPlan.certificationGates.length}</div></article>}
     {cleanRoom.lastJob&&<article style={{...card,borderColor:'#7a4d9a'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>MIND OVER MATTER • CLEAN ROOM</b><span style={{fontSize:8,color:'#d69bff'}}>{cleanRoom.jobs.length} JOBS</span></div><div style={{fontSize:11,fontWeight:850,marginTop:5}}>{cleanRoom.lastJob.targetLabel}</div><div style={muted}>Latest: {cleanRoom.lastJob.kind} • {cleanRoom.lastJob.reason} • {cleanRoom.lastJob.status}. Original replacements stay blocked from production until human originality/visual review and normal asset certification pass.</div></article>}
     <article style={card}><b>EXPANSION CHAIN</b><div style={{fontSize:11,lineHeight:1.7,color:'#c7d7df'}}>WEST SIDE → 77 CHICAGO COMMUNITY AREAS → ILLINOIS → 50 U.S. STATES → GLOBAL CITIES</div></article>
     <article style={card}><b>WHAT IS STILL MISSING</b><div style={{display:'grid',gap:5,marginTop:7}}>{MISSING_SYSTEMS.map(item=><div key={item} style={{padding:'7px 8px',borderRadius:9,background:'#111b20',border:'1px solid #604f2d',fontSize:10,color:'#ffd98b'}}>○ {item}</div>)}</div></article>
     <div style={{display:'grid',gap:8,marginTop:8}}>{BUILD_LANES.map(l=><article key={l.id} style={card}><div style={{display:'flex',justifyContent:'space-between'}}><b>{l.label}</b><span style={{fontSize:9,color:'#72ffb0'}}>CONNECTED</span></div><div style={muted}>{l.items}</div></article>)}</div>
     <article style={card}><b>CHICAGO BUILD GRID</b><div style={{display:'grid',gap:6,marginTop:7}}>{CHICAGO_BUILD_GRID.map(g=><button key={g.id} onClick={()=>{setNotice(`GRID FOCUS • ${g.grid} • ${g.label}`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-builder-grid',{detail:g}))}} style={rowBtn}><span><b>{g.grid} • {g.label}</b><small style={{display:'block',opacity:.7}}>{g.description}</small></span><span>{g.buildable?'BUILD':'LOCK'}</span></button>)}</div></article>
    </>}

    {tab==='missions'&&<div style={{display:'grid',gap:8}}>
     {MISSIONS.map((m,i)=><article key={m} style={card}><b>{String(i+1).padStart(2,'0')} • {m}</b><button onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:`world-builder-board-${i+1}`,title:m,source:'streetverse-world-builder-board'}}));setNotice(`MISSION SENT • ${m}`)}} style={{...actionBtn,marginTop:7}}>START / PIN</button></article>)}
    </div>}

    {tab==='campuses'&&<>
     <article style={card}><b>UIC WEST CAMPUS • PHYSICAL HUBS</b><div style={{display:'grid',gap:6,marginTop:7}}>{UIC_ALL_CAMPUS_HUBS.filter(h=>h.district==='West Campus').map(h=><button key={h.id} onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:campusverse-destination',{detail:{campus:'uic',hubId:h.id,label:h.label,district:h.district,source:'streetverse-world-builder'}}));setNotice(`UIC ROUTE • ${h.label}`)}} style={rowBtn}><span><b>{h.label}</b><small style={{display:'block',opacity:.7}}>{h.kind.replace('-',' ')}</small></span><span>ROUTE</span></button>)}</div></article>
     <article style={card}><b>ILLINOIS CAMPUSVERSE NETWORK</b><div style={{display:'grid',gap:6,marginTop:7}}>{ILLINOIS_CAMPUSVERSE_NETWORK.map(c=><button key={c.id} onClick={()=>openCampus(c.id)} style={rowBtn}><span><b>{c.name}</b><small style={{display:'block',opacity:.7}}>{c.region} • {c.system||c.archetype}</small></span><span>OPEN</span></button>)}</div></article>
    </>}

    <div role="status" style={{position:'sticky',bottom:0,marginTop:9,padding:'9px 10px',borderRadius:12,background:'#0b2430ee',border:'1px solid #4eb9cf77',fontSize:10,fontWeight:850}}>{notice}</div>
   </div>
  </section>}
 </>
}

const card:React.CSSProperties={marginTop:8,padding:11,borderRadius:14,border:'1px solid #294655',background:'#081722'}
const muted:React.CSSProperties={fontSize:10,lineHeight:1.5,color:'#93a9b7',marginTop:5}
const actionBtn:React.CSSProperties={minHeight:42,borderRadius:10,border:'1px solid #64dded77',background:'#0b2632',color:'#fff',fontWeight:900,padding:'8px 10px'}
const rowBtn:React.CSSProperties={display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,width:'100%',minHeight:48,padding:'8px 9px',borderRadius:10,border:'1px solid #2d4654',background:'#0a1922',color:'#fff',textAlign:'left'}
const tabBtn:React.CSSProperties={minHeight:40,border:'1px solid #29404e',borderRadius:10,color:'#fff',fontWeight:900,fontSize:9}
const chip:React.CSSProperties={flex:'0 0 auto',minHeight:34,padding:'6px 8px',borderRadius:999,border:'1px solid #345363',background:'#0a1d27',color:'#fff',fontWeight:850,fontSize:8}
const closeBtn:React.CSSProperties={width:44,height:44,borderRadius:14,border:'1px solid #4e7183',background:'#0a1821',color:'#fff',fontSize:22,fontWeight:900}
