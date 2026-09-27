import {compileAllGlobalWorlds,type WorldCompilerStage} from './GlobalWorldCompiler'

export type QuantumJobState='ready'|'blocked'|'running'|'verified'
export interface QuantumBuildJob{
 id:string;cityId:string;stage:WorldCompilerStage
 dependencies:string[];state:QuantumJobState
 cacheKey:string;priority:number
}

const STAGES:WorldCompilerStage[]=[
 'registry','geospatial','environment','mobility','population','business',
 'missions','media','economy','accessibility','certification'
]

const dependencies=(cityId:string,stage:WorldCompilerStage)=>{
 const i=STAGES.indexOf(stage)
 if(i<=0)return[]
 const previous=STAGES[i-1]
 // Certification waits on every prior city stage; other stages can pipeline once their direct dependency is ready.
 if(stage==='certification')return STAGES.slice(0,-1).map(s=>`${cityId}:${s}`)
 return [`${cityId}:${previous}`]
}

export function createQuantumGlobalBuildQueue():QuantumBuildJob[]{
 return compileAllGlobalWorlds().flatMap((world,cityIndex)=>
  STAGES.map((stage,stageIndex)=>({
   id:`${world.cityId}:${stage}`,
   cityId:world.cityId,
   stage,
   dependencies:dependencies(world.cityId,stage),
   state:stageIndex===0?'ready':'blocked',
   cacheKey:`global-world-v1:${world.cityId}:${stage}`,
   priority:(world.cityId==='chicago'?100:80)-cityIndex+Math.max(0,10-stageIndex),
  }))
 ).sort((a,b)=>b.priority-a.priority)
}

export const QUANTUM_SPEED_ENGINE={
 name:'Quantum Global World Compiler Speed Engine',
 meaning:'Software build acceleration through parallel jobs, dependency graphs, reusable templates, caching, incremental compilation and automated verification. It does not claim quantum-computer execution.',
 strategies:[
  'compile independent cities in parallel',
  'pipeline city stages as soon as dependencies pass',
  'reuse shared engine modules instead of city forks',
  'cache unchanged compiler outputs',
  'incrementally rebuild only changed city/stage manifests',
  'batch shared media, accessibility, commerce and ledger validation',
  'prioritize blockers on the critical path',
  'run automated certification evidence after builds',
 ],
 hardRules:[
  'never skip rights/source validation for speed',
  'never bypass payment or ledger verification',
  'never mark preview content production-ready without certification',
  'never duplicate shared infrastructure per city',
  'never use speed mode to weaken privacy, accessibility or security gates',
 ],
} as const

export function quantumBuildSummary(){
 const jobs=createQuantumGlobalBuildQueue()
 return{
  cities:new Set(jobs.map(j=>j.cityId)).size,
  totalJobs:jobs.length,
  readyJobs:jobs.filter(j=>j.state==='ready').length,
  parallelism:'city-level + dependency-safe stage pipelining',
  strategies:QUANTUM_SPEED_ENGINE.strategies,
 }
}
