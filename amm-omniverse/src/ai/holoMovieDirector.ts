import type {AIFactoryLaneId,AIFactorySnapshot} from './stubbsAIFactory'
import {laneReady} from './stubbsAIFactory'

export type CharacterBible={id:string;name:string;identity:string;faceBodyReference?:string;voice:string;wardrobe:string;emotionalBaseline:string}
export type ProjectBible={
  title:string
  genre:string
  logline:string
  cameraLanguage:string
  colorLanguage:string
  musicLanguage:string
  storyTime:string
  characters:CharacterBible[]
  locations:string[]
  props:string[]
  vehicles:string[]
  continuityRules:string[]
}
export type ContinuityEnvelope={fingerprint:string;characterState:string[];wardrobeState:string[];location:string;storyTime:string;cameraLanguage:string;musicLanguage:string;rules:string[]}
export type MovieShot={id:string;sceneId:string;index:number;durationSeconds:number;purpose:string;continuity:ContinuityEnvelope;requiredLanes:AIFactoryLaneId[]}
export type MovieScene={id:string;index:number;title:string;durationSeconds:number;location:string;shots:MovieShot[]}
export type MoviePlan={
  id:string
  durationMinutes:number
  bible:ProjectBible
  continuityFingerprint:string
  scenes:MovieScene[]
  shotCount:number
  requiredLanes:AIFactoryLaneId[]
  planningReady:true
}
export type MovieReadiness={planningReady:true;renderReady:boolean;availableLanes:AIFactoryLaneId[];blockedLanes:AIFactoryLaneId[];blockers:string[]}

export const FULL_MOVIE_REQUIRED_LANES:AIFactoryLaneId[]=['llm','vision_ocr','image','video','audio']

function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n))}
function slug(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'movie'}
function fingerprint(value:string){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return `cont-${(h>>>0).toString(16).padStart(8,'0')}`}

export function makeProjectBible(input:Partial<ProjectBible>&Pick<ProjectBible,'title'>):ProjectBible{
  return {
    title:String(input.title||'Untitled Holo Movie').slice(0,120),
    genre:String(input.genre||'cinematic drama').slice(0,80),
    logline:String(input.logline||'A coherent feature-length TRYAMM story built scene by scene.').slice(0,1000),
    cameraLanguage:String(input.cameraLanguage||'Motivated cinematic coverage; preserve lens, movement and screen direction across cuts.').slice(0,600),
    colorLanguage:String(input.colorLanguage||'Consistent grade, skin tones, exposure and time-of-day continuity.').slice(0,600),
    musicLanguage:String(input.musicLanguage||'Recurring themes mapped to characters and story beats; preserve tempo and key across transitions.').slice(0,600),
    storyTime:String(input.storyTime||'continuous story chronology').slice(0,200),
    characters:Array.isArray(input.characters)?input.characters.slice(0,30).map((c,i)=>({id:String(c.id||`character-${i+1}`),name:String(c.name||`Character ${i+1}`).slice(0,100),identity:String(c.identity||'locked character identity').slice(0,700),faceBodyReference:c.faceBodyReference?String(c.faceBodyReference).slice(0,1000):undefined,voice:String(c.voice||'voice locked per character').slice(0,300),wardrobe:String(c.wardrobe||'wardrobe locked until scene change').slice(0,500),emotionalBaseline:String(c.emotionalBaseline||'track emotional state from prior scene').slice(0,400)})):[],
    locations:Array.isArray(input.locations)&&input.locations.length?input.locations.map(x=>String(x).slice(0,300)).slice(0,50):['Primary story location'],
    props:Array.isArray(input.props)?input.props.map(x=>String(x).slice(0,200)).slice(0,80):[],
    vehicles:Array.isArray(input.vehicles)?input.vehicles.map(x=>String(x).slice(0,200)).slice(0,50):[],
    continuityRules:Array.isArray(input.continuityRules)&&input.continuityRules.length?input.continuityRules.map(x=>String(x).slice(0,500)).slice(0,50):['Do not change a character face, body, age, voice or wardrobe without an explicit story event.','Preserve handedness, eyelines, screen direction, prop state, damage state and location geography between adjacent shots.','Carry camera language, color language and music motifs through every scene.'],
  }
}

export function planFullMovie({durationMinutes=90,bible}: {durationMinutes?:number;bible:ProjectBible}):MoviePlan{
  const minutes=Math.round(clamp(Number(durationMinutes)||90,30,120))
  const sceneCount=clamp(Math.round(minutes/5),6,24)
  const shotsPerScene=8
  const totalSeconds=minutes*60
  const baseSceneSeconds=Math.floor(totalSeconds/sceneCount)
  const movieContinuity=fingerprint(JSON.stringify(bible))
  const scenes:MovieScene[]=[]
  let allocated=0
  for(let s=0;s<sceneCount;s++){
    const sceneSeconds=s===sceneCount-1?totalSeconds-allocated:baseSceneSeconds
    allocated+=sceneSeconds
    const location=bible.locations[s%bible.locations.length]
    const sceneId=`scene-${String(s+1).padStart(2,'0')}`
    const baseShotSeconds=Math.floor(sceneSeconds/shotsPerScene)
    let shotAllocated=0
    const shots:MovieShot[]=[]
    for(let i=0;i<shotsPerScene;i++){
      const durationSeconds=i===shotsPerScene-1?sceneSeconds-shotAllocated:baseShotSeconds
      shotAllocated+=durationSeconds
      const stateSource=`${movieContinuity}|${sceneId}|${i+1}|${location}|${bible.storyTime}|${bible.characters.map(c=>`${c.id}:${c.wardrobe}:${c.emotionalBaseline}`).join('|')}`
      const continuity:ContinuityEnvelope={
        fingerprint:fingerprint(stateSource),
        characterState:bible.characters.map(c=>`${c.name}: ${c.identity}; emotion=${c.emotionalBaseline}`),
        wardrobeState:bible.characters.map(c=>`${c.name}: ${c.wardrobe}`),
        location,storyTime:bible.storyTime,cameraLanguage:bible.cameraLanguage,musicLanguage:bible.musicLanguage,rules:bible.continuityRules,
      }
      shots.push({id:`${sceneId}-shot-${String(i+1).padStart(2,'0')}`,sceneId,index:i+1,durationSeconds,purpose:i===0?'establish scene and continuity':i===shotsPerScene-1?'close scene and hand continuity to next scene':'advance story beat without breaking continuity',continuity,requiredLanes:FULL_MOVIE_REQUIRED_LANES})
    }
    scenes.push({id:sceneId,index:s+1,title:`Scene ${s+1} • ${location}`,durationSeconds:sceneSeconds,location,shots})
  }
  return {id:`movie-${slug(bible.title)}-${movieContinuity.slice(-8)}`,durationMinutes:minutes,bible,continuityFingerprint:movieContinuity,scenes,shotCount:scenes.reduce((n,s)=>n+s.shots.length,0),requiredLanes:FULL_MOVIE_REQUIRED_LANES,planningReady:true}
}

export function assessMovieReadiness(plan:MoviePlan,factory:AIFactorySnapshot):MovieReadiness{
  const available=plan.requiredLanes.filter(id=>laneReady(factory,id))
  const blocked=plan.requiredLanes.filter(id=>!laneReady(factory,id))
  const blockers=blocked.map(id=>id==='video'?'Video generation provider or self-hosted video runtime is not connected.':id==='llm'&&!factory.ownedGpuConnected?'LLM lane needs an authorized cloud provider or the first HoloGPT GPU server.':`${id} execution provider is not connected.`)
  return {planningReady:true,renderReady:blocked.length===0,availableLanes:available,blockedLanes:blocked,blockers}
}
