import {STREETVERSE_GLOBALIZATION_WAVES,type StreetVerseCity} from './StreetVerseGlobalRegistry'
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
