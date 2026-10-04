import {useEffect,useMemo,useState} from 'react'
import {CHICAGO_BUILD_GRID} from '../data/StreetVerseChicagoBuildGrid'
import {UIC_ALL_CAMPUS_HUBS} from '../data/uicCampusVerseHubs'
import {ILLINOIS_CAMPUSVERSE_NETWORK} from '../data/campusVerseIllinoisUniversityNetwork'

type Tab='map'|'build'|'missions'|'campuses'
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

export default function StreetVerseWestSideWorldBuilder(){
 const [open,setOpen]=useState(false)
 const [tab,setTab]=useState<Tab>('map')
 const [selected,setSelected]=useState<Zone>(ZONES[0])
 const [notice,setNotice]=useState('West Side builder ready.')
 const [layers,setLayers]=useState({neighborhood:true,school:true,campus:true,medical:true,transit:true})
 const visible=useMemo(()=>ZONES.filter(z=>layers[z.group]),[layers])

 useEffect(()=>{
  const show=()=>setOpen(true)
  window.addEventListener('tryamm:west-side-builder-open',show)
  return()=>window.removeEventListener('tryamm:west-side-builder-open',show)
 },[])

 useEffect(()=>{
  if(!open)return
  const targets=ZONES.map(z=>({id:`west-builder:${z.id}`,label:z.label,kind:z.campusId?'portal':'mission',x:z.x,z:z.z,metadata:{builder:true,status:z.status,group:z.group,campusId:z.campusId}}))
  window.dispatchEvent(new CustomEvent('tryamm:construct:targets',{detail:targets}))
 },[open])

 const focus=(zone:Zone)=>{
  setSelected(zone)
  setNotice(`FOCUS • ${zone.label}`)
  window.dispatchEvent(new CustomEvent('tryamm:construct:focus',{detail:{id:`west-builder:${zone.id}`}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-builder-focus',{detail:zone}))
 }

 const startMission=(zone:Zone)=>{
  const detail={missionId:`west-builder:${zone.id}`,id:`west-builder:${zone.id}`,title:`West Side • ${zone.label}`,objective:`Reach and complete the ${zone.label} district objective.`,campus:zone.campusId,source:'west-side-world-builder'}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-mission-open',{detail}))
  setNotice(`MISSION SENT • ${zone.label}`)
 }

 const openCampus=(campusId:string)=>{
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-travel',{detail:{to:campusId,source:'west-side-world-builder'}}))
  setNotice(`CAMPUSVERSE • ${campusId.toUpperCase()}`)
 }

 const openBuildSwarm=()=>{
  const fn=(window as any).__showBuildSwarm
  if(typeof fn==='function'){fn();setNotice('Build Swarm opened.')}
  else setNotice('Build Swarm is installed but its control panel is not mounted on this surface.')
 }

 return <>
  <button aria-label="Open West Side World Builder" onClick={()=>setOpen(true)} style={{position:'fixed',left:12,top:'max(62px,calc(env(safe-area-inset-top) + 54px))',zIndex:42100,minHeight:42,padding:'7px 10px',borderRadius:12,border:'1px solid #6de3ff88',background:'#071923e8',color:'#e8fbff',font:'950 9px system-ui',boxShadow:'0 8px 24px #0008'}}>🛠 WEST SIDE</button>

  {open&&<section role="dialog" aria-modal="true" aria-label="West Side World Builder" style={{position:'fixed',inset:0,zIndex:62000,display:'grid',gridTemplateRows:'auto auto 1fr',background:'#020810f8',color:'#fff',fontFamily:'system-ui',overflow:'hidden'}}>
   <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'calc(env(safe-area-inset-top) + 8px) 12px 8px',borderBottom:'1px solid #244254',background:'linear-gradient(90deg,#071722,#15102a)'}}>
    <div><div style={{fontSize:9,fontWeight:950,letterSpacing:2,color:'#6de3ff'}}>STREETVERSE • WORLD FORGER</div><strong style={{fontSize:18}}>WEST SIDE WORLD BUILDER</strong><div style={{fontSize:9,opacity:.68}}>Map • districts • campuses • missions • build lanes</div></div>
    <button onClick={()=>setOpen(false)} aria-label="Close West Side World Builder" style={closeBtn}>×</button>
   </header>

   <nav style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,padding:8,borderBottom:'1px solid #193343'}}>
    {(['map','build','missions','campuses'] as const).map(t=><button key={t} onClick={()=>setTab(t)} style={{...tabBtn,borderColor:tab===t?'#6de3ff':'#29404e',background:tab===t?'#103140':'#09151e'}}>{t.toUpperCase()}</button>)}
   </nav>

   <div style={{minHeight:0,overflow:'auto',padding:10}}>
    {tab==='map'&&<>
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

    {tab==='build'&&<>
     <article style={card}><b>BUILD CONTROL</b><p style={muted}>This is the visible construction manifest for the West Side. Build actions still require committed code/assets; this screen does not pretend background work happened.</p><button onClick={openBuildSwarm} style={actionBtn}>OPEN BUILD SWARM</button></article>
     <article style={card}><b>WHAT IS STILL MISSING</b><div style={{display:'grid',gap:5,marginTop:7}}>{MISSING_SYSTEMS.map(item=><div key={item} style={{padding:'7px 8px',borderRadius:9,background:'#111b20',border:'1px solid #604f2d',fontSize:10,color:'#ffd98b'}}>○ {item}</div>)}</div></article>
     <div style={{display:'grid',gap:8,marginTop:8}}>{BUILD_LANES.map(l=><article key={l.id} style={card}><div style={{display:'flex',justifyContent:'space-between'}}><b>{l.label}</b><span style={{fontSize:9,color:'#72ffb0'}}>CONNECTED</span></div><div style={muted}>{l.items}</div></article>)}</div>
     <article style={card}><b>CHICAGO BUILD GRID</b><div style={{display:'grid',gap:6,marginTop:7}}>{CHICAGO_BUILD_GRID.map(g=><button key={g.id} onClick={()=>{setNotice(`GRID FOCUS • ${g.grid} • ${g.label}`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-builder-grid',{detail:g}))}} style={rowBtn}><span><b>{g.grid} • {g.label}</b><small style={{display:'block',opacity:.7}}>{g.description}</small></span><span>{g.buildable?'BUILD':'LOCK'}</span></button>)}</div></article>
    </>}

    {tab==='missions'&&<div style={{display:'grid',gap:8}}>
     {MISSIONS.map((m,i)=><article key={m} style={card}><b>{String(i+1).padStart(2,'0')} • {m}</b><button onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:`west-builder-board-${i+1}`,title:m,source:'west-side-world-builder-board'}}));setNotice(`MISSION SENT • ${m}`)}} style={{...actionBtn,marginTop:7}}>START / PIN</button></article>)}
    </div>}

    {tab==='campuses'&&<>
     <article style={card}><b>UIC WEST CAMPUS • PHYSICAL HUBS</b><div style={{display:'grid',gap:6,marginTop:7}}>{UIC_ALL_CAMPUS_HUBS.filter(h=>h.district==='West Campus').map(h=><button key={h.id} onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:campusverse-destination',{detail:{campus:'uic',hubId:h.id,label:h.label,district:h.district,source:'west-side-world-builder'}}));setNotice(`UIC ROUTE • ${h.label}`)}} style={rowBtn}><span><b>{h.label}</b><small style={{display:'block',opacity:.7}}>{h.kind.replace('-',' ')}</small></span><span>ROUTE</span></button>)}</div></article>
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
