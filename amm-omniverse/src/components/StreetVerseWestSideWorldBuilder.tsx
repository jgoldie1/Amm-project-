import {useEffect,useMemo,useState} from 'react'
import {CHICAGO_BUILD_GRID} from '../data/StreetVerseChicagoBuildGrid'
import {TRYAMM_NATIVE_RUNTIME_ASSETS} from '../data/TryammNativeRuntimeAssetCatalog'
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
type SandboxStateView={planId:string|null;targetLabel:string|null;speedMode:string;maxConcurrentJobs:number;waves:Array<{index:number;taskIds:string[];labels:string[]}>;missingEvidence:string[];publishable:boolean;lastRunAt?:string}
type RepairTicketView={id:string;title:string;message:string;severity:string;risk:string;status:string;repairLayer:string;problemClass:string;occurrences:number;humanApprovalRequired:boolean;assignedWorkstreams:string[]}
type RepairStateView={tickets:RepairTicketView[];activeTicketId:string|null}
type MiddleverseRepairItemView={id:string;ticketId:string;lane:string;title:string;risk:string;supervisorRequired:boolean}
type MiddleverseRepairStateView={items:MiddleverseRepairItemView[];activeTicketId:string|null}
type Zone={
 id:string
 label:string
 group:'neighborhood'|'school'|'faith'|'campus'|'medical'|'transit'
 x:number
 z:number
 status:'live'|'playable'|'planned'
 detail:string
 mission?:string
 campusId?:string
 worldX?:number
 worldZ?:number
}

const ZONES:readonly Zone[]=[
 {id:'circle-park',label:'Circle Park',group:'neighborhood',x:32,z:18,status:'live',detail:'West Side spawn, homes, park, streets, traffic, trees and neighborhood missions.',mission:'circle-park'},
 {id:'circle-park-1111-laflin',label:'1111 S Laflin • Circle Park',group:'neighborhood',x:33,z:21,status:'playable',worldX:-38,worldZ:30,detail:'Original game reconstruction: 1111 entrance, guarded gate, apartments, courtyard and basketball. Current leasing also uses S Ashland.',mission:'circle-park'},
 {id:'taylor-laflin',label:'Taylor + Laflin',group:'neighborhood',x:35,z:34,status:'playable',worldX:-24,worldZ:-8,detail:'Named Taylor/Laflin street connection between Circle Park, ABLA history and Little Italy.'},
 {id:'abla-village',label:'ABLA Village',group:'neighborhood',x:40,z:23,status:'playable',worldX:54,worldZ:56,detail:'Original 3D village streetscape and ABLA heritage corridor; game-block positions are approximate.'},
 {id:'abla-new-homes',label:'ABLA New Homes',group:'neighborhood',x:43,z:25,status:'playable',worldX:74,worldZ:60,detail:'Original multi-unit brick townhome visual block reflecting the mixed-income redevelopment era, not surveyed homes.'},
 {id:'jefferson-school',label:'Thomas Jefferson School',group:'school',x:43,z:28,status:'playable',detail:'Reconstructed school exterior with school-life and learning mission hooks.',mission:'jefferson-school'},
 {id:'roosevelt',label:'Roosevelt Road',group:'neighborhood',x:49,z:43,status:'live',detail:'Business, mobility, delivery and mission corridor.',mission:'roosevelt'},
 {id:'saint-ignatius',label:'St. Ignatius College Prep',group:'school',x:54,z:40,status:'playable',detail:'Roosevelt Road school landmark reconstructed as a gameplay campus anchor from the real-world address.',mission:'ignatius-campus-memory'},
 {id:'holy-family',label:'Holy Family Church',group:'faith',x:51,z:39,status:'playable',detail:'Roosevelt Road faith/history landmark reconstructed as a gameplay anchor from the real-world address.',mission:'holy-family-history-faith'},
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
 'St. Ignatius Roosevelt campus memory route',
 'Holy Family faith + neighborhood history route',
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

export default function StreetVerseWestSideWorldBuilder({launcher=true}:{launcher?:boolean}={}){
 const [open,setOpen]=useState(false)
 // Playable Chicago exposes this board through the one-hand quick menu;
 // SafeWorld can retain its familiar floating WORLD button.
 useEffect(()=>{
  const openBoard=()=>setOpen(true)
  window.addEventListener('tryamm:streetverse-open-world-builder',openBoard)
  return()=>window.removeEventListener('tryamm:streetverse-open-world-builder',openBoard)
 },[])
 const [tab,setTab]=useState<Tab>('map')
 const [scale,setScale]=useState<Scale>('west')
 const [selected,setSelected]=useState<Zone>(ZONES[0])
 const [notice,setNotice]=useState('World Builder ready • West Side → Chicago 77 → Illinois → USA → World.')
 const [nativeEvidence,setNativeEvidence]=useState<{source:string;loaded:number;failed:number;detail:string}|null>(null)
 const [nativeProbe,setNativeProbe]=useState<{checking:boolean;ok:number;failed:string[]}|null>(null)
 const [forgeEvidence,setForgeEvidence]=useState<{status:string;provider:string}|null>(null)
 const [placedEvidence,setPlacedEvidence]=useState<{status:string;placed:number;requested:number;count:number;missing:string[]}|null>(null)
 const [quantumPlan,setQuantumPlan]=useState<QuantumPlanView|null>(null)
 const [cleanRoom,setCleanRoom]=useState<CleanRoomStateView>({jobs:[],lastJob:null})
 const [sandbox,setSandbox]=useState<SandboxStateView>({planId:null,targetLabel:null,speedMode:'balanced',maxConcurrentJobs:4,waves:[],missingEvidence:[],publishable:false})
 const [repairs,setRepairs]=useState<RepairStateView>({tickets:[],activeTicketId:null})
 const [middleverseRepairs,setMiddleverseRepairs]=useState<MiddleverseRepairStateView>({items:[],activeTicketId:null})
 const [layers,setLayers]=useState({neighborhood:true,school:true,faith:true,campus:true,medical:true,transit:true})
 const visible=useMemo(()=>ZONES.filter(z=>layers[z.group]),[layers])

 useEffect(()=>{
  // Report only models actually attached to a Three.js group. Asset recipes and
  // a queued provider result do NOT mean that anything appeared in the game.
  const west=(event:Event)=>{
    const d=(event as CustomEvent<{loaded?:number;failed?:number}>).detail||{}
    setNativeEvidence({source:'West Side active 3D world',loaded:Number(d.loaded||0),failed:Number(d.failed||0),detail:'Native GLBs mounted; visual-only until collision/animation QA.'})
  }
  const taylor=(event:Event)=>{
    const d=(event as CustomEvent<{loaded?:number;failed?:unknown[]}>).detail||{}
    setNativeEvidence({source:'Taylor/UIC active 3D world',loaded:Number(d.loaded||0),failed:Array.isArray(d.failed)?d.failed.length:0,detail:'Native GLBs mounted on Near West 3D scene, independent of blocked external Meshy assets.'})
  }
  const error=(event:Event)=>setNativeEvidence({source:'Taylor/UIC',loaded:0,failed:1,detail:String((event as CustomEvent<{error?:string}>).detail?.error||'The model layer failed to load.')})
  const forge=(event:Event)=>{
    const d=(event as CustomEvent<{status?:string;provider?:string}>).detail||{}
    setForgeEvidence({status:String(d.status||'unknown'),provider:String(d.provider||'unknown')})
  }
  const main3D=(event:Event)=>{
   const d=(event as CustomEvent<{loaded?:number;failed?:number}>).detail||{}
   setNativeEvidence({source:'Main iPhone playable 3D',loaded:Number(d.loaded||0),failed:Number(d.failed||0),detail:'Native GLBs loaded in the active mobile canvas; preview-only models retain the existing gameplay collision authority.'})
  }
  const placement=(event:Event)=>{
    const d=(event as CustomEvent<{status?:string;placed?:number;requested?:number;count?:number;missing?:string[]}>).detail||{}
    setPlacedEvidence({status:String(d.status||'unknown'),placed:Number(d.placed||0),requested:Number(d.requested||0),count:Number(d.count||0),missing:Array.isArray(d.missing)?d.missing:[]})
  }
  window.addEventListener('tryamm:streetverse-native-mobile-ready',main3D)
  window.addEventListener('tryamm:streetverse-west-side-native-assets',west)
  window.addEventListener('tryamm:streetverse-chicago-native-assets-ready',taylor)
  window.addEventListener('tryamm:streetverse-chicago-native-assets-error',error)
  window.addEventListener('tryamm:streetverse-forge-placement-result',placement)
  window.addEventListener('tryamm:holoforge-asset-ready',forge)
  return()=>{
    window.removeEventListener('tryamm:streetverse-native-mobile-ready',main3D)
    window.removeEventListener('tryamm:streetverse-west-side-native-assets',west)
    window.removeEventListener('tryamm:streetverse-chicago-native-assets-ready',taylor)
    window.removeEventListener('tryamm:streetverse-chicago-native-assets-error',error)
    window.removeEventListener('tryamm:streetverse-forge-placement-result',placement)
    window.removeEventListener('tryamm:holoforge-asset-ready',forge)
  }
 },[])

 // Explicit four-file probe only on a user's tap; never auto-poll the host or
 // consume Meshy/Higgsfield credits just to render status information.
 const inspectBuiltAssets=async()=>{
   const samples=(['building','tree','sportSedan2027','heroPlayer'] as const).map(key=>TRYAMM_NATIVE_RUNTIME_ASSETS[key])
   setNativeProbe({checking:true,ok:0,failed:[]})
   const result=await Promise.all(samples.map(async asset=>{
     try{
       const response=await fetch(asset.url,{method:'HEAD',cache:'no-store'})
       const type=response.headers.get('content-type')||''
       return {label:asset.id,ok:response.ok&&!/text\/html/i.test(type),status:response.status}
     }catch{return {label:asset.id,ok:false,status:0}}
   }))
   const ok=result.filter(entry=>entry.ok).length
   const failed=result.filter(entry=>!entry.ok).map(entry=>entry.label+' ('+(entry.status||'network')+')')
   setNativeProbe({checking:false,ok,failed})
   setNotice(ok===samples.length?'LOCAL ASSETS FOUND • generated GLBs respond on this deployment. Enter Taylor 3D to see loaded models.':'ASSET DELIVERY BLOCKED • '+failed.join(', ')+' — inspect build output or host status.')
 }
 const openBuiltWestSide=()=>{
   // The main mobile renderer already contains the Circle Park and Taylor
   // corridors. Travel inside it instead of mounting a second WebGL canvas.
   window.dispatchEvent(new CustomEvent('tryamm:west-side-route-request',{detail:{x:24,z:-8,missionId:'taylor-single-canvas',source:'streetverse-world-builder'}}))
   setOpen(false)
 }
 const forgeVisible=(preset:'park'|'street'|'storefront')=>{
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-forge-placement-request',{detail:{preset,source:'west-side-world-builder'}}))
   setNotice('FORGE '+preset.toUpperCase()+' • requested placement inside the active mobile 3D scene; confirm the result below.')
 }
 const undoForge=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-forge-placement-undo',{detail:{source:'west-side-world-builder'}}))

 useEffect(()=>{
  if(open&&tab==='build')window.dispatchEvent(new Event('tryamm:streetverse-forge-request-state'))
 },[open,tab])
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
   const d=(event as CustomEvent<Partial<SandboxStateView>>).detail||{}
   setSandbox(prev=>({...prev,...d,waves:Array.isArray(d.waves)?d.waves:prev.waves,missingEvidence:Array.isArray(d.missingEvidence)?d.missingEvidence:prev.missingEvidence}))
  }
  window.addEventListener('tryamm:world-build-sandbox-state',sync)
  window.dispatchEvent(new CustomEvent('tryamm:world-build-sandbox-request-state'))
  return()=>window.removeEventListener('tryamm:world-build-sandbox-state',sync)
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
  const sync=(event:Event)=>{
   const d=(event as CustomEvent<Partial<RepairStateView>>).detail||{}
   setRepairs({tickets:Array.isArray(d.tickets)?d.tickets:[],activeTicketId:d.activeTicketId||null})
  }
  window.addEventListener('tryamm:repair-ticket-state',sync)
  window.dispatchEvent(new CustomEvent('tryamm:repair-ticket-request-state'))
  return()=>window.removeEventListener('tryamm:repair-ticket-state',sync)
 },[])

 useEffect(()=>{
  const sync=(event:Event)=>{
   const d=(event as CustomEvent<Partial<MiddleverseRepairStateView>>).detail||{}
   setMiddleverseRepairs({items:Array.isArray(d.items)?d.items:[],activeTicketId:d.activeTicketId||null})
  }
  window.addEventListener('tryamm:middleverse-repair-state',sync)
  window.dispatchEvent(new CustomEvent('tryamm:middleverse-repair-request-state'))
  return()=>window.removeEventListener('tryamm:middleverse-repair-state',sync)
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

 const visitPlayableBlock=(zone:Zone)=>{
  if(zone.worldX===undefined||zone.worldZ===undefined)return
  const canvas=document.querySelector('[data-streetverse-world-root="true"] canvas[data-streetverse-world-canvas="true"]')
  if(!canvas){setNotice('This route requires the active 3D Chicago city. Retry 3D first; your 2D recovery world stays available.');return}
  window.dispatchEvent(new CustomEvent('tryamm:west-side-route-request',{detail:{x:zone.worldX,z:zone.worldZ,missionId:zone.id,source:'streetverse-world-builder'}}))
  setOpen(false)
 }

 const startMission=(zone:Zone)=>{
  const missionId=zone.id==='circle-park'?'hold-the-block':zone.id==='taylor'?'first-ride-story':'business-on-the-block'
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-cinematic-mission-open',{detail:{missionId,source:'streetverse-world-builder',zoneId:zone.id}}))
  setOpen(false)
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

 const runSandbox=()=>{
  if(!quantumPlan){requestQuantumPlan();setNotice('SANDBOX • created a Quantum plan first. Tap SANDBOX TEST again after the queue appears.');return}
  window.dispatchEvent(new CustomEvent('tryamm:world-build-sandbox-run',{detail:{sample:{fps:45,frameMs:22,networkRttMs:120,memoryPressure:.5,thermalPressure:.35}}}))
  setNotice(`QUANTUM SPEED SANDBOX • ${quantumPlan.target.label} • dependency waves calculated; release remains blocked until evidence passes.`)
 }

 const runRepairSweep=()=>{
  window.dispatchEvent(new CustomEvent('tryamm:repair-sweep'))
  setNotice('SELF-HEAL / REPAIR SWEEP • health, AI Cafe, assets, Construct, sandbox and Release Guardian queues refreshed.')
 }

 const openMiddleverseRepair=(ticketId?:string)=>{
  window.dispatchEvent(new CustomEvent('tryamm:middleverse-repair-open',{detail:{ticketId}}))
  setNotice(`MIDDLEVERSE AI • repair workforce opened${ticketId?` for ${ticketId}`:''}.`)
 }

 return <>
  {launcher&&<button aria-label="Open StreetVerse World Builder" onClick={()=>setOpen(true)} style={{position:'fixed',left:12,top:'max(62px,calc(env(safe-area-inset-top) + 54px))',zIndex:42100,minHeight:42,padding:'7px 10px',borderRadius:12,border:'1px solid #6de3ff88',background:'#071923e8',color:'#e8fbff',font:'950 9px system-ui',boxShadow:'0 8px 24px #0008'}}>🛠 WORLD</button>}

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
       {selected.worldX!==undefined&&selected.worldZ!==undefined&&<button onClick={()=>visitPlayableBlock(selected)} style={{...actionBtn,gridColumn:'1 / -1',background:'#145742',borderColor:'#92ffd0'}}>🎮 GO TO THIS CHICAGO BLOCK</button>}
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
     <article style={{...card,borderColor:'#72ffb080'}} aria-label="West Side existing asset delivery status">
       <b>EXISTING TRYAMM FORGE ASSETS · DELIVERY PROOF</b>
       <p style={muted}>Foundry defines {Object.keys(TRYAMM_NATIVE_RUNTIME_ASSETS).length} native asset types. A recipe, blueprint or saved GLB link is not proof of an asset appearing on-screen. The counters below show real loaded geometry only when the 3D loader reports it.</p>
       <div role="status" style={{fontSize:11,lineHeight:1.6,color:'#b5d9e7'}}>
        {nativeEvidence?<><strong>{nativeEvidence.source}: {nativeEvidence.loaded} placed · {nativeEvidence.failed} failed</strong><div>{nativeEvidence.detail}</div></>:<strong>No asset-layer completion reported for this game session yet.</strong>}
        {forgeEvidence&&<div>HoloForge latest: {forgeEvidence.status} via {forgeEvidence.provider}. Provider status alone is not a loaded model.</div>}
        {nativeProbe&&<div>Static asset delivery: {nativeProbe.checking?'checking four existing files':nativeProbe.ok+'/4 respond'+(nativeProbe.failed.length?' · unavailable: '+nativeProbe.failed.join(', '):'')}.</div>}
       </div>
       <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:10}}>
        <button onClick={inspectBuiltAssets} disabled={nativeProbe?.checking} style={actionBtn}>🔎 VERIFY 4 GLBs</button>
        <button onClick={openBuiltWestSide} style={{...actionBtn,background:'#145742',borderColor:'#92ffd0'}}>🎮 WALK TAYLOR IN GAME</button>
       </div>
       <div style={{marginTop:9,display:'grid',gap:7}}>
        <strong style={{fontSize:11,color:'#c6ffde'}}>BUILD INTO THE ACTIVE 3D CITY</strong>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>
          <button style={actionBtn} onClick={()=>forgeVisible('storefront')}>🏢 PLACE STOREFRONTS</button>
          <button style={actionBtn} onClick={()=>forgeVisible('park')}>🌳 PLACE PARK</button>
          <button style={actionBtn} onClick={()=>forgeVisible('street')}>🚏 PLACE STREET PROPS</button>
          <button style={actionBtn} onClick={undoForge}>↶ UNDO LAST PROP</button>
        </div>
        <div role="status" style={{fontSize:11,color:'#c1e4ed'}}>{placedEvidence?<>FORGE {placedEvidence.status.toUpperCase()} · {placedEvidence.placed}/{placedEvidence.requested} added · {placedEvidence.count} saved in the scene{placedEvidence.missing.length>0?' · missing: '+placedEvidence.missing.join(', '):''}</>:'No user-forged placements confirmed yet. Each action reuses GLBs already loaded by the current game.'}</div>
        <button style={{...actionBtn,background:'#176044'}} onClick={()=>setOpen(false)}>👁 VIEW LIVE CITY CHANGES</button>
       </div>
       <p style={muted}>Uses your existing West Side native kit and Taylor Street world. Does not call an asset-generation API, purchase credits, replace original GLBs or certify BJ's likeness.</p>
      </article>
     <article style={card}><b>BUILD CONTROL • {scaleLabel[scale]}</b><p style={muted}>Visible construction manifest for the selected world scale. Build actions still require committed code/assets; this screen does not pretend background work happened.</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}><button onClick={requestQuantumPlan} style={{...actionBtn,gridColumn:'1 / -1'}}>⚛ QUANTUM AUTO PLAN</button><button onClick={openCursorConstruct} style={actionBtn}>CURSOR CONSTRUCT</button><button onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:construct:scan'));setNotice('CONSTRUCT SCAN • checking nearby world targets.')}} style={actionBtn}>SCAN</button><button onClick={originalizeSelected} style={{...actionBtn,gridColumn:'1 / -1',borderColor:'#c48cff99'}}>🧠 MIND OVER MATTER • MAKE OUR VERSION</button><button onClick={runSandbox} style={{...actionBtn,gridColumn:'1 / -1',borderColor:'#74ffa899'}}>⚡ QUANTUM SPEED • SANDBOX TEST</button><button onClick={runRepairSweep} style={{...actionBtn,gridColumn:'1 / -1',borderColor:'#ff9f6e99'}}>🛠 SELF-HEAL • REPAIR SWEEP</button><button onClick={()=>openMiddleverseRepair(repairs.activeTicketId||undefined)} style={{...actionBtn,gridColumn:'1 / -1',borderColor:'#e8b94499'}}>∞ MIDDLEVERSE AI • REPAIR WORKFORCE</button><button onClick={openBuildSwarm} style={{...actionBtn,gridColumn:'1 / -1'}}>OPEN BUILD SWARM</button></div></article>
     {quantumPlan&&<article style={card}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>QUANTUM BUILD QUEUE</b><span style={{fontSize:8,color:'#6de3ff'}}>{quantumPlan.oracle.cloudReturnMode.toUpperCase()}</span></div><div style={{fontSize:11,fontWeight:850,marginTop:5}}>{quantumPlan.target.label}</div><div style={muted}>{quantumPlan.quantumMeaning}</div><div style={{display:'grid',gap:5,marginTop:8}}>{quantumPlan.tasks.map((task,index)=><div key={task.id} style={{display:'grid',gridTemplateColumns:'24px 1fr auto',gap:7,alignItems:'center',padding:'7px 8px',borderRadius:9,background:'#0c1b24',border:'1px solid #294655'}}><span style={{fontSize:9,fontWeight:950,color:'#6de3ff'}}>{String(index+1).padStart(2,'0')}</span><span><b style={{fontSize:10}}>{task.label}</b><small style={{display:'block',opacity:.62}}>{task.stage}{task.approvalRequired?' • approval gate':''}</small></span><span style={{fontSize:8,color:task.state==='ready'?'#72ffb0':task.state==='passed'?'#72ffb0':task.state==='failed'?'#ff7c7c':'#ffd15c'}}>{task.state.toUpperCase()}</span></div>)}</div><div style={{marginTop:8,fontSize:9,color:'#9eb4c0'}}>Oracle requirements: {quantumPlan.oracle.requirements.length} • Certification gates: {quantumPlan.certificationGates.length}</div></article>}
     {cleanRoom.lastJob&&<article style={{...card,borderColor:'#7a4d9a'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>MIND OVER MATTER • CLEAN ROOM</b><span style={{fontSize:8,color:'#d69bff'}}>{cleanRoom.jobs.length} JOBS</span></div><div style={{fontSize:11,fontWeight:850,marginTop:5}}>{cleanRoom.lastJob.targetLabel}</div><div style={muted}>Latest: {cleanRoom.lastJob.kind} • {cleanRoom.lastJob.reason} • {cleanRoom.lastJob.status}. Original replacements stay blocked from production until human originality/visual review and normal asset certification pass.</div></article>}
     {sandbox.planId&&<article style={{...card,borderColor:sandbox.publishable?'#4fa978':'#7d6f3d'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>QUANTUM SPEED • SANDBOX</b><span style={{fontSize:8,color:sandbox.publishable?'#72ffb0':'#ffd15c'}}>{sandbox.publishable?'PUBLISHABLE':'PROOF REQUIRED'}</span></div><div style={{fontSize:11,fontWeight:850,marginTop:5}}>{sandbox.targetLabel}</div><div style={muted}>Mode: {sandbox.speedMode.toUpperCase()} • parallel jobs: {sandbox.maxConcurrentJobs} • dependency waves: {sandbox.waves.length}. Speed never bypasses rights, accessibility, security, performance or certification.</div>{sandbox.missingEvidence.length>0&&<div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:7}}>{sandbox.missingEvidence.map(item=><span key={item} style={{fontSize:8,padding:'4px 6px',borderRadius:999,border:'1px solid #6a5b31',color:'#ffd98b'}}>NEEDS {item.toUpperCase()}</span>)}</div>}</article>}
     {repairs.tickets.length>0&&<article style={{...card,borderColor:'#8a5c45'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>SELF-HEAL • REPAIR TICKETS</b><span style={{fontSize:8,color:'#ffb58c'}}>{repairs.tickets.filter(t=>t.status!=='resolved').length} OPEN</span></div><div style={{display:'grid',gap:5,marginTop:8}}>{repairs.tickets.slice(-6).reverse().map(ticket=><button key={ticket.id} onClick={()=>openMiddleverseRepair(ticket.id)} style={rowBtn}><span><b>{ticket.title}</b><small style={{display:'block',opacity:.68}}>{ticket.status} • {ticket.repairLayer} • {ticket.problemClass} • x{ticket.occurrences}</small></span><span style={{fontSize:8,color:ticket.status==='resolved'?'#72ffb0':ticket.severity==='critical'?'#ff7777':'#ffd15c'}}>{ticket.humanApprovalRequired?'MIDDLEVERSE':'AUTO/QA'}</span></button>)}</div></article>}
     {middleverseRepairs.items.length>0&&<article style={{...card,borderColor:'#806b30'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>MIDDLEVERSE AI • REPAIR WORK</b><span style={{fontSize:8,color:'#ffe49b'}}>{middleverseRepairs.items.length} ITEMS</span></div><div style={muted}>Repair work routes to developer, trainer, moderator, contact-center or business-operator lanes with skill/accessibility matching. Supervisor/founder authority remains required where risk demands it.</div></article>}
     <article style={card}><b>EXPANSION CHAIN</b><div style={{fontSize:11,lineHeight:1.7,color:'#c7d7df'}}>WEST SIDE → 77 CHICAGO COMMUNITY AREAS → ILLINOIS → 50 U.S. STATES → GLOBAL CITIES</div></article>
     <article style={card}><b>WHAT IS STILL MISSING</b><div style={{display:'grid',gap:5,marginTop:7}}>{MISSING_SYSTEMS.map(item=><div key={item} style={{padding:'7px 8px',borderRadius:9,background:'#111b20',border:'1px solid #604f2d',fontSize:10,color:'#ffd98b'}}>○ {item}</div>)}</div></article>
     <div style={{display:'grid',gap:8,marginTop:8}}>{BUILD_LANES.map(l=><article key={l.id} style={card}><div style={{display:'flex',justifyContent:'space-between'}}><b>{l.label}</b><span style={{fontSize:9,color:'#72ffb0'}}>CONNECTED</span></div><div style={muted}>{l.items}</div></article>)}</div>
     <article style={card}><b>CHICAGO BUILD GRID</b><div style={{display:'grid',gap:6,marginTop:7}}>{CHICAGO_BUILD_GRID.map(g=><button key={g.id} onClick={()=>{setNotice(`GRID FOCUS • ${g.grid} • ${g.label}`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-builder-grid',{detail:g}))}} style={rowBtn}><span><b>{g.grid} • {g.label}</b><small style={{display:'block',opacity:.7}}>{g.description}</small></span><span>{g.buildable?'BUILD':'LOCK'}</span></button>)}</div></article>
    </>}

    {tab==='missions'&&<div style={{display:'grid',gap:8}}>
     {MISSIONS.map((m,i)=><article key={m} style={card}><b>{String(i+1).padStart(2,'0')} • {m}</b><button onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-cinematic-mission-open',{detail:{missionId:i%3===0?'hold-the-block':i%3===1?'business-on-the-block':'first-ride-story',source:'streetverse-world-builder-board',boardTitle:m}}));setOpen(false)}} style={{...actionBtn,marginTop:7}}>START / PIN</button></article>)}
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
