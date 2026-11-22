import { BUILD_ONCE_PROTOCOL, REUSE_FIRST_RULES } from './reuseRegistry';

export type SpeedLane = 'runtime' | 'world' | 'commerce' | 'creator' | 'assets' | 'guardian';
export type BuildRisk = 'low' | 'medium' | 'high';
export type BuildUnit = { id:string; goal:string; lane:SpeedLane; dependencies:string[]; risk:BuildRisk; evidence:Array<'source'|'route'|'runtime'|'persistence'|'test'|'deployment'> };

export const QUANTUM_SPEED_ENGINE = {
 name:'TRYAMM Quantum Speed Engine',
 targetThroughput:'3x on reusable web/product work; lower on novel/high-risk systems',
 rule:'Speed comes from decomposition, reuse, caching, parallelism, observability and automated proof—not skipped QA.',
 reuseFirst:REUSE_FIRST_RULES,
 buildOnceProtocol:BUILD_ONCE_PROTOCOL,
 accelerators:[
  'ONE PAGE CONTRACT before implementation',
  'Dependency graph removes unnecessary serialization',
  'AI Cafe lanes execute independent work in parallel',
  'HoloForge/GLE reuses assets across Web/Unity/Unreal/Godot',
  'Shared component/API templates eliminate duplicate scaffolding',
  'Quantum Lag Buster development profile reduces preview/render/network stalls',
  'Incremental build, dependency cache and asset cache reuse unchanged work',
  'Delta tests target impacted contracts instead of blindly repeating every test',
  'Preview once, smoke once, merge once',
  'Guardian runs security/accessibility/release checks in the same wave',
 ],
 pipeline:['GOAL INTAKE','ONE PAGE CONTRACT','HOLOGPT DECOMPOSITION','DEPENDENCY GRAPH','REUSE REGISTRY SEARCH','CACHE/REUSE LOOKUP','AI CAFE PARALLEL LANES','HOLOFORGE/GLE ASSET REUSE','COMPONENT + API TEMPLATE REUSE','QUANTUM LAG BUSTER DEV PROFILE','INCREMENTAL BUILD/CACHE','DELTA TEST PLAN','GUARDIAN STATIC + SECURITY + ACCESSIBILITY CHECKS','INTEGRATION TEST','PREVIEW DEPLOY','SMOKE PROOF','MERGE ONCE','HUMAN APPROVAL FOR HIGH-RISK ACTIONS','PRODUCTION RELEASE','TELEMETRY + ROLLBACK','REGISTER VERIFIED OUTPUT'],
} as const;

export function parallelWaves(units:BuildUnit[]){
 const pending=new Map(units.map(u=>[u.id,u]))
 if(pending.size!==units.length||units.some(u=>!u.id.trim()))throw new Error('Build graph contains duplicate or empty IDs')
 const completed=new Set<string>(),waves:BuildUnit[][]=[]
 while(pending.size){
  const wave=[...pending.values()].filter(u=>u.dependencies.every(d=>completed.has(d)))
  if(!wave.length)throw new Error('Build graph contains a missing dependency or cycle')
  waves.push(wave)
  wave.forEach(u=>{pending.delete(u.id);completed.add(u.id)})
 }
 return waves
}

export type BuildProof={artifact:string;verified:boolean}
export type BuildExecutionResult={id:string;state:'verified'|'failed'|'blocked';artifact?:string;durationMs:number;reason?:string}
export type BuildExecutor=(unit:BuildUnit,dependencies:ReadonlyMap<string,BuildExecutionResult>)=>Promise<BuildProof>

/** Executes dependency-ready work with bounded concurrency.
 * Callers supply trusted adapters; this does not grant provider, payment or deployment authority.
 * A task only releases descendants after a verified artifact is returned.
 */
export async function executeBuildUnits(units:BuildUnit[],execute:BuildExecutor,options:{concurrency?:number;allowHighRisk?:boolean}={}){
 parallelWaves(units)
 const requested=options.concurrency??4
 const concurrency=Number.isFinite(requested)?Math.max(1,Math.min(8,Math.floor(requested))):4
 const pending=new Map(units.map(u=>[u.id,u]))
 const results=new Map<string,BuildExecutionResult>()
 const running=new Map<string,Promise<void>>()
 const clock=()=>Date.now()
 function finish(result:BuildExecutionResult){results.set(result.id,result)}
 const run=async(unit:BuildUnit)=>{
  const start=clock()
  try{
   if(unit.risk==='high'&&!options.allowHighRisk)throw new Error('High-risk work requires authorized execution')
   const dependencies=new Map(unit.dependencies.map(id=>[id,results.get(id)!]))
   const proof=await execute(unit,dependencies)
   if(!proof?.verified||typeof proof.artifact!=='string'||!proof.artifact.trim())throw new Error('Missing verified artifact evidence')
   finish({id:unit.id,state:'verified',artifact:proof.artifact,durationMs:clock()-start})
  }catch(error){
   finish({id:unit.id,state:'failed',durationMs:clock()-start,reason:error instanceof Error?error.message:String(error)})
  }
 }
 while(pending.size||running.size){
  for(const unit of pending.values()){
   if(unit.dependencies.some(id=>results.has(id)&&results.get(id)!.state!=='verified')){
    pending.delete(unit.id)
    finish({id:unit.id,state:'blocked',durationMs:0,reason:'Dependency did not verify'})
   }
  }
  for(const unit of pending.values()){
   if(running.size>=concurrency)break
   if(!unit.dependencies.every(id=>results.get(id)?.state==='verified'))continue
   pending.delete(unit.id)
   running.set(unit.id,run(unit).finally(()=>{running.delete(unit.id)}))
  }
  if(running.size)await Promise.race(running.values())
  else if(pending.size&&!Array.from(pending.values()).some(u=>u.dependencies.some(id=>results.get(id)?.state==='blocked'||results.get(id)?.state==='failed')))throw new Error('Build graph could not advance')
 }
 return units.map(unit=>results.get(unit.id)!)
}


export const ONE_PAGE_CONTRACT=['OUTCOME','ROUTE','USER/AUTH STATE','DATA/API','REUSABLE UI','ASSET NEEDS','WORLD PLACEMENT','COMMERCE/CREATOR HOOKS','ACCESSIBILITY','ERROR/LOADING','TEST EVIDENCE','DEPLOYMENT PROOF'] as const;
export const FAST_PAGE_FACTORY=['PAGE BRIEF','ROUTE CONTRACT','DESIGN TOKEN TEMPLATE','REUSABLE COMPONENTS','DATA/API CONTRACT','ASSET CACHE LOOKUP','ACCESSIBILITY','RESPONSIVE STATES','ERROR/LOADING STATES','DELTA TEST PLAN','PREVIEW','SMOKE','PUBLISH','REGISTER FOR REUSE'] as const;
export const PARALLEL_PAGE_WAVE={runtime:'API + persistence + route',commerce:'data + pricing + transactions',assets:'GLE/GLB + media',creator:'content + sharing + attribution',world:'placement + interactions',guardian:'tests + accessibility + telemetry'} as const;
