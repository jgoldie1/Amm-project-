export type ChronoEvidenceLevel='documented'|'mixed'|'inferred'|'simulation'|string
export type ChronoExperienceState={
  active:boolean
  runId?:string
  scenarioId?:string
  slug?:string
  name?:string
  era?:string
  scenarioType?:string
  evidenceLevel?:ChronoEvidenceLevel
  description?:string
  checkpoint:number
  missionStep:number
  returnPoint:'advanced-worlds'|'streetverse'|'command-nexus'
  startedAt?:string
  updatedAt:string
}

const KEY='tryamm_chrono_experience_v1'
let installed=false
const now=()=>new Date().toISOString()
const fresh=():ChronoExperienceState=>({active:false,checkpoint:0,missionStep:0,returnPoint:'advanced-worlds',updatedAt:now()})
export function readChronoExperience():ChronoExperienceState{if(typeof localStorage==='undefined')return fresh();try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return fresh()}}
function write(state:ChronoExperienceState){localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('tryamm:chrono-state',{detail:state}));return state}
function narrate(title:string,message:string){window.dispatchEvent(new CustomEvent('tryamm:benny-utterance',{detail:{mode:'guide',title,message}}));window.dispatchEvent(new CustomEvent('tryamm:construct:context',{detail:{agent:'Chronicle',title,message,actions:['explain','evidence-label','next-checkpoint']}}))}
function evidenceMessage(level?:string){const l=(level||'simulation').toLowerCase();if(l.includes('document')||l.includes('primary'))return 'This reconstruction is anchored to documented historical evidence. Interpretive gaps remain labeled.';if(l.includes('mixed'))return 'This reconstruction mixes documented evidence with clearly marked inference.';if(l.includes('infer'))return 'This reconstruction contains inference. Treat reconstructed details as interpretation, not established fact.';return 'This is a simulation. It is not a prediction and does not claim physical travel through time.'}
function missionFor(state:ChronoExperienceState){const missions=['Stabilize the corridor and verify the evidence label.','Reach the first reconstruction anchor and inspect the source context.','Complete the scenario objective without changing the evidence classification.','Record the return checkpoint and open the portal home.'];return missions[Math.min(state.missionStep,missions.length-1)]}
export function launchChronoExperience(detail:Record<string,any>){const state:ChronoExperienceState={active:true,runId:String(detail.runId||detail.id||''),scenarioId:String(detail.scenarioId||detail.scenario_id||''),slug:String(detail.slug||detail.scenario?.slug||''),name:String(detail.name||detail.scenario?.name||'Chrono Scenario'),era:String(detail.era||detail.scenario?.era||''),scenarioType:String(detail.scenarioType||detail.scenario_type||detail.scenario?.scenario_type||'simulation'),evidenceLevel:String(detail.evidenceLevel||detail.evidence_level||detail.scenario?.evidence_level||'simulation'),description:String(detail.description||detail.scenario?.description||''),checkpoint:Number(detail.checkpoint||0),missionStep:0,returnPoint:(detail.returnPoint||'advanced-worlds') as ChronoExperienceState['returnPoint'],startedAt:now(),updatedAt:now()};write(state);window.dispatchEvent(new CustomEvent('tryamm:chrono-immersive-open',{detail:state}));window.dispatchEvent(new CustomEvent('tryamm:chrono-evidence',{detail:{level:state.evidenceLevel,message:evidenceMessage(state.evidenceLevel),scenario:state.name}}));window.dispatchEvent(new CustomEvent('tryamm:chrono-mission',{detail:{step:0,title:'Chrono Mission',objective:missionFor(state)}}));narrate('TIME MACHINE ONLINE',`${state.name}. ${evidenceMessage(state.evidenceLevel)} ${missionFor(state)}`);return state}
export function advanceChronoCheckpoint(){const s=readChronoExperience();if(!s.active)return s;const next={...s,checkpoint:s.checkpoint+1,missionStep:Math.min(3,s.missionStep+1),updatedAt:now()};write(next);window.dispatchEvent(new CustomEvent('tryamm:chrono-checkpoint',{detail:next}));window.dispatchEvent(new CustomEvent('tryamm:chrono-mission',{detail:{step:next.missionStep,title:'Chrono Mission',objective:missionFor(next)}}));narrate(`CHECKPOINT ${next.checkpoint}`,missionFor(next));return next}
export function createChronoStreetVersePortal(){const s=readChronoExperience();const portal={id:'chrono-return-portal',kind:'portal',title:s.active?`Return to ${s.name||'Chrono Run'}`:'TIME MACHINE',x:0,z:-70,activeRun:s.active,checkpoint:s.checkpoint};window.dispatchEvent(new CustomEvent('tryamm:construct:targets',{detail:{targets:[portal]}}));window.dispatchEvent(new CustomEvent('tryamm:chrono-streetverse-portal',{detail:portal}));return portal}
export function returnFromChrono(){const s=readChronoExperience();const next={...s,active:false,updatedAt:now()};write(next);window.dispatchEvent(new CustomEvent('tryamm:chrono-return',{detail:{returnPoint:s.returnPoint,checkpoint:s.checkpoint,scenario:s.name}}));narrate('RETURN POINT SAVED',`${s.name||'Chrono run'} checkpoint ${s.checkpoint} saved. You can resume from this return point.`);return next}
export function installChronoExperienceRuntime(){if(installed||typeof window==='undefined')return;installed=true;window.addEventListener('tryamm:chrono-run-started',(e:Event)=>launchChronoExperience((e as CustomEvent<Record<string,any>>).detail||{}));window.addEventListener('tryamm:chrono-next-checkpoint',()=>advanceChronoCheckpoint());window.addEventListener('tryamm:chrono-return-request',()=>returnFromChrono());window.addEventListener('tryamm:streetverse-enter',()=>createChronoStreetVersePortal());window.addEventListener('tryamm:chrono-resume',()=>{const s=readChronoExperience();if(s.scenarioId||s.runId)launchChronoExperience({...s,checkpoint:s.checkpoint})});window.dispatchEvent(new CustomEvent('tryamm:chrono-experience-ready',{detail:{persistent:true,immersiveBridge:true,bennyNarration:true,chronicleContext:true,evidenceLabels:true,streetVersePortal:true,savedReturnPoints:true,physicalTimeTravel:false,reasoningPlanner:'local deterministic mission planner'}}))}
