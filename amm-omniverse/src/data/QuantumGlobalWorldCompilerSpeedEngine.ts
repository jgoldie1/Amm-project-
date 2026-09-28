import {STREETVERSE_GLOBALIZATION_WAVES,GLOBAL_CONVERGENCE_REQUIREMENTS,type StreetVerseCity} from './StreetVerseGlobalRegistry'
import {compileGlobalWorld,type WorldCompilerStage} from './GlobalWorldCompiler'

export type QuantumCompilerPriority='critical'|'high'|'normal'
export interface QuantumCityJob{
 cityId:string;wave:1|2|3|4|5|6|7;stage:WorldCompilerStage;priority:QuantumCompilerPriority;
 cacheKey:string;dependsOn:WorldCompilerStage[];batch:string;verification:string[]
}

const DEPS:Record<WorldCompilerStage,WorldCompilerStage[]>={
 registry:[],geospatial:['registry'],environment:['registry','geospatial'],mobility:['geospatial'],
 population:['geospatial'],business:['registry'],missions:['business','population'],media:['registry'],
 economy:['business','media'],accessibility:['registry'],certification:['geospatial','environment','mobility','population','business','missions','media','economy','accessibility'],
}
const CRITICAL=new Set<WorldCompilerStage>(['registry','geospatial','economy','accessibility','certification'])

const waveFor=(cityId:string)=>{
 for(const wave of [1,2,3,4,5,6] as const)if((STREETVERSE_GLOBALIZATION_WAVES[wave] as readonly string[]).includes(cityId))return wave
 return 7
}

export const createQuantumGlobalCityJobs=(city:StreetVerseCity):QuantumCityJob[]=>{
 const plan=compileGlobalWorld(city.id),wave=waveFor(city.id)
 return plan.modules.map(module=>({
  cityId:city.id,wave,stage:module.stage,priority:CRITICAL.has(module.stage)?'critical':module.parallelSafe?'high':'normal',
  cacheKey:`global-world:v1:${city.id}:${module.stage}`,
  dependsOn:DEPS[module.stage],
  batch:`wave-${wave}:${module.stage}`,
  verification:module.stage==='certification'?plan.releaseGates:['inputs resolved','rights/source policy preserved','incremental output deterministic'],
 }))
}

export const scheduleQuantumGlobalJobs=(cities:StreetVerseCity[])=>{
 const jobs=cities.flatMap(createQuantumGlobalCityJobs)
 const rank=(p:QuantumCompilerPriority)=>p==='critical'?0:p==='high'?1:2
 return jobs.sort((a,b)=>rank(a.priority)-rank(b.priority)||a.wave-b.wave||a.batch.localeCompare(b.batch))
}

export const QUANTUM_GLOBAL_WORLD_COMPILER_SPEED_ENGINE={
 meaning:'Software build acceleration only; no quantum-computer execution is claimed.',
 acceleration:[
  'parallel independent city jobs','dependency-safe stage pipelining','reusable regional templates','content-addressable caching',
  'incremental builds','stage batching','critical-path prioritization','automated verification',
 ],
 invariants:[
  'rights/source validation is never bypassed','privacy gates are never bypassed','accessibility gates are never bypassed',
  'security gates are never bypassed','payment verification remains server-authoritative','ledger verification is mandatory',
  'certification remains serial/fail-closed after required dependencies','no deployed/live claim without verified release evidence',
 ],
} as const


export interface QuantumWaveExecutionPlan{
 wave:1|2|3|4|5|6|7
 cityIds:string[]
 batches:Record<WorldCompilerStage,string[]>
 convergenceRequirements:readonly string[]
 hardGates:readonly string[]
}

const HARD_GLOBAL_GATES=[
 'rights/source validation','privacy','accessibility','security',
 'server-authoritative payment verification','ledger verification','release certification',
] as const

export const createQuantumWaveExecutionPlans=(cities:StreetVerseCity[]):QuantumWaveExecutionPlan[]=>{
 const cityById=new Map(cities.map(city=>[city.id,city]))
 return ([1,2,3,4,5,6,7] as const).map(wave=>{
  const cityIds=(STREETVERSE_GLOBALIZATION_WAVES[wave] as readonly string[]).filter(id=>cityById.has(id))
  const jobs=scheduleQuantumGlobalJobs(cityIds.map(id=>cityById.get(id)!))
  const batches={} as Record<WorldCompilerStage,string[]>
  for(const job of jobs)(batches[job.stage]??=[]).push(`${job.cityId}:${job.stage}`)
  return{
   wave,cityIds,batches,
   convergenceRequirements:wave===7?GLOBAL_CONVERGENCE_REQUIREMENTS:[],
   hardGates:HARD_GLOBAL_GATES,
  }
 })
}


export type QuantumStageEvidence=Partial<Record<WorldCompilerStage,'verified'|'failed'>>
export interface QuantumHourlyCycle{
 cycleMinutes:60
 eligible:string[]
 blocked:string[]
 failed:string[]
 complete:string[]
 nextBatch:string[]
}

export const planQuantumHourlyCycle=(cities:StreetVerseCity[],evidence:Record<string,QuantumStageEvidence>={}):QuantumHourlyCycle=>{
 const jobs=scheduleQuantumGlobalJobs(cities)
 const complete:string[]=[],failed:string[]=[],eligible:string[]=[],blocked:string[]=[]
 for(const job of jobs){
  const state=evidence[job.cityId]?.[job.stage]
  if(state==='verified'){complete.push(`${job.cityId}:${job.stage}`);continue}
  if(state==='failed'){failed.push(`${job.cityId}:${job.stage}`);continue}
  const depsVerified=job.dependsOn.every(stage=>evidence[job.cityId]?.[stage]==='verified')
  ;(depsVerified?eligible:blocked).push(`${job.cityId}:${job.stage}`)
 }
 // Failed work is intentionally excluded from nextBatch: repair evidence first, then reschedule.
 return{
  cycleMinutes:60,eligible,blocked,failed,complete,
  nextBatch:eligible.slice(0,Math.max(1,Math.min(eligible.length,16))),
 }
}

export const QUANTUM_HOURLY_MULTITASK_POLICY={
 cycleMinutes:60,
 behavior:[
  'inspect current branch head and CI before scheduling work',
  'repair failed certification or CI work before feature expansion',
  'select the highest-priority dependency-ready jobs across all waves',
  'multitask independent city jobs while reusing shared compiler outputs',
  'record verified, failed and blocked evidence instead of assuming completion',
  'finish each cycle with automated verification and a truthful status report',
 ],
 stopCondition:'Stop unnecessary changes only after all seven waves have verified production-complete certification evidence.',
} as const


export interface QuantumCycleEvidenceSummary{
 totalJobs:number
 verifiedJobs:number
 failedJobs:number
 blockedJobs:number
 eligibleJobs:number
 completionPercent:number
 productionComplete:boolean
}

export const summarizeQuantumCycleEvidence=(cities:StreetVerseCity[],evidence:Record<string,QuantumStageEvidence>={}):QuantumCycleEvidenceSummary=>{
 const cycle=planQuantumHourlyCycle(cities,evidence)
 const totalJobs=cycle.complete.length+cycle.failed.length+cycle.blocked.length+cycle.eligible.length
 const verifiedJobs=cycle.complete.length
 return{
  totalJobs,verifiedJobs,
  failedJobs:cycle.failed.length,
  blockedJobs:cycle.blocked.length,
  eligibleJobs:cycle.eligible.length,
  completionPercent:totalJobs===0?0:Math.floor((verifiedJobs/totalJobs)*100),
  productionComplete:totalJobs>0&&verifiedJobs===totalJobs&&cycle.failed.length===0&&cycle.blocked.length===0&&cycle.eligible.length===0,
 }
}


export interface QuantumSharedWorkItem{
 id:string
 stage:WorldCompilerStage
 cityIds:string[]
 cacheKey:string
 priority:QuantumCompilerPriority
 verification:string[]
}

export const createQuantumSharedWorkItems=(cities:StreetVerseCity[]):QuantumSharedWorkItem[]=>{
 const jobs=scheduleQuantumGlobalJobs(cities)
 const grouped=new Map<string,QuantumCityJob[]>()
 for(const job of jobs){
  const key=`${job.wave}:${job.stage}`
  grouped.set(key,[...(grouped.get(key)??[]),job])
 }
 return [...grouped.entries()].map(([id,batch])=>({
  id,stage:batch[0].stage,
  cityIds:[...new Set(batch.map(job=>job.cityId))],
  cacheKey:`global-shared:v1:${id}:${batch.map(job=>job.cacheKey).sort().join('|')}`,
  priority:batch.some(job=>job.priority==='critical')?'critical':batch.some(job=>job.priority==='high')?'high':'normal',
  verification:[
   'all city inputs for the batch resolve',
   'shared output is deterministic and reusable',
   'rights/source, privacy, accessibility and security policies remain fail-closed',
   ...(batch[0].stage==='economy'?['server-authoritative payment and ledger verification pass']:[]),
   ...(batch[0].stage==='certification'?['every required city-stage evidence item is verified']:[]),
  ],
 }))
}
