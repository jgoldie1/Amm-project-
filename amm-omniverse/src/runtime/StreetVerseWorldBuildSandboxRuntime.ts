import {parallelWaves,type BuildUnit} from '../agents/quantumSpeedEngine'
import {QUANTUM_SPEED_BUDGETS,chooseQuantumSpeedMode,type QuantumSpeedSample} from '../game/runtime/quantumSpeedEngine'
import {queueWorldBuild,advanceWorldBuild,canPublishWorld,WORLD_CERTIFICATION_CHECKS,type BuildManifest,type WorldSeed} from '../game/simulation/worldBuilderPipeline'
import type {QuantumWorldBuildPlan,WorldBuildTask} from './StreetVerseQuantumWorldBuilderOrchestrator'

export type SandboxEvidenceKey=typeof WORLD_CERTIFICATION_CHECKS[number]
export type SandboxEvidence=Partial<Record<SandboxEvidenceKey,boolean>>

export type WorldBuildSandboxState={
 schema:'tryamm.streetverse.world-build-sandbox.v1'
 planId:string|null
 targetLabel:string|null
 speedMode:'eco'|'balanced'|'boost'
 maxConcurrentJobs:number
 waves:Array<{index:number;taskIds:string[];labels:string[]}>
 manifest:BuildManifest|null
 evidence:SandboxEvidence
 missingEvidence:SandboxEvidenceKey[]
 publishable:boolean
 productionMutation:false
 lastRunAt?:string
}

const STORAGE='tryamm.streetverse.world-build-sandbox.v1'
let installed=false

const emit=(name:string,detail:unknown)=>{
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))
}

function read():WorldBuildSandboxState{
 try{
  const value=JSON.parse(localStorage.getItem(STORAGE)||'null')
  if(value?.schema==='tryamm.streetverse.world-build-sandbox.v1')return value
 }catch{}
 return{
  schema:'tryamm.streetverse.world-build-sandbox.v1',
  planId:null,
  targetLabel:null,
  speedMode:'balanced',
  maxConcurrentJobs:QUANTUM_SPEED_BUDGETS.balanced.maxConcurrentJobs,
  waves:[],
  manifest:null,
  evidence:{},
  missingEvidence:[...WORLD_CERTIFICATION_CHECKS],
  publishable:false,
  productionMutation:false,
 }
}

function save(state:WorldBuildSandboxState){
 try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}
 emit('tryamm:world-build-sandbox-state',state)
}

function seedFor(plan:QuantumWorldBuildPlan):WorldSeed{
 const target=plan.target
 const chicago=target.scale==='west'||target.scale==='chicago'
 const illinois=target.scale==='illinois'
 return{
  id:`sandbox-${target.id}`,
  scope:chicago?'chicago':'global',
  country:'US',
  region:chicago||illinois?'IL':target.stateId?.toUpperCase()||'GLOBAL',
  city:chicago?'Chicago':target.cityId||target.label,
  neighborhoods:[target.label],
  locale:'en-US',
  currency:'USD',
 }
}

function speedUnits(tasks:WorldBuildTask[]):BuildUnit[]{
 return tasks.map(task=>({
  id:task.id,
  goal:task.label,
  lane:task.stage==='asset-forge'||task.stage==='original-fallback'?'assets'
   :task.stage==='living-world'||task.stage==='construct-placement'||task.stage==='geospatial'||task.stage==='cad-reconstruction'?'world'
   :task.stage==='missions-economy'?'creator'
   :task.stage==='qa-certification'||task.stage==='sandbox-validation'||task.stage==='rights-provenance'?'guardian'
   :'runtime',
  dependencies:task.dependencies,
  risk:task.approvalRequired?'high':task.stage==='source-discovery'?'low':'medium',
  evidence:task.stage==='qa-certification'||task.stage==='sandbox-validation'?['test','runtime']:task.stage==='source-discovery'?['source']:['runtime'],
 }))
}

function computeWaves(plan:QuantumWorldBuildPlan){
 const waves=parallelWaves(speedUnits(plan.tasks))
 return waves.map((wave,index)=>({index,taskIds:wave.map(item=>item.id),labels:wave.map(item=>item.goal)}))
}

function buildManifestWithEvidence(plan:QuantumWorldBuildPlan,evidence:SandboxEvidence){
 let manifest=queueWorldBuild(seedFor(plan))
 const orderedChecks=[...WORLD_CERTIFICATION_CHECKS]
 const stages=['seed','compile','simulate','validate','certify','playable'] as const
 for(let i=0;i<stages.length;i++){
  const key=orderedChecks[i]
  if(!key)break
  manifest=advanceWorldBuild(manifest,`stage:${stages[i]}`,true)
 }
 for(const check of orderedChecks)manifest=advanceWorldBuild(manifest,check,evidence[check]===true)
 return manifest
}

function recalc(plan:QuantumWorldBuildPlan,evidence:SandboxEvidence,sample:QuantumSpeedSample):WorldBuildSandboxState{
 const speedMode=chooseQuantumSpeedMode(sample)
 const budget=QUANTUM_SPEED_BUDGETS[speedMode]
 const manifest=buildManifestWithEvidence(plan,evidence)
 const missingEvidence=WORLD_CERTIFICATION_CHECKS.filter(check=>evidence[check]!==true)
 return{
  schema:'tryamm.streetverse.world-build-sandbox.v1',
  planId:plan.id,
  targetLabel:plan.target.label,
  speedMode,
  maxConcurrentJobs:budget.maxConcurrentJobs,
  waves:computeWaves(plan),
  manifest,
  evidence,
  missingEvidence,
  publishable:missingEvidence.length===0&&canPublishWorld(manifest),
  productionMutation:false,
  lastRunAt:new Date().toISOString(),
 }
}

export function installStreetVerseWorldBuildSandboxRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 let state=read()
 let currentPlan:QuantumWorldBuildPlan|null=null
 save(state)

 addEventListener('tryamm:quantum-world-builder-state',(event:Event)=>{
  const d=(event as CustomEvent<{activePlan?:QuantumWorldBuildPlan|null}>).detail||{}
  currentPlan=d.activePlan||null
  if(!currentPlan)return
  state={
   ...state,
   planId:currentPlan.id,
   targetLabel:currentPlan.target.label,
   waves:computeWaves(currentPlan),
   publishable:false,
   productionMutation:false,
  }
  save(state)
 })

 addEventListener('tryamm:world-build-sandbox-run',(event:Event)=>{
  if(!currentPlan){
   emit('tryamm:world-build-sandbox-blocked',{reason:'NO_ACTIVE_QUANTUM_PLAN'})
   return
  }
  const d=(event as CustomEvent<{evidence?:SandboxEvidence;sample?:QuantumSpeedSample}>).detail||{}
  const evidence={...state.evidence,...(d.evidence||{})}
  const sample=d.sample||{fps:45,frameMs:22,networkRttMs:120,memoryPressure:.5,thermalPressure:.35}
  state=recalc(currentPlan,evidence,sample)
  save(state)
  emit('tryamm:quantum-speed-wave-plan',{
   planId:currentPlan.id,
   target:currentPlan.target,
   mode:state.speedMode,
   maxConcurrentJobs:state.maxConcurrentJobs,
   waves:state.waves,
   rule:'Parallelize only dependency-ready work; certification and publication remain fail-closed.',
  })
  emit('tryamm:world-build-sandbox-result',{
   planId:currentPlan.id,
   target:currentPlan.target,
   manifest:state.manifest,
   missingEvidence:state.missingEvidence,
   publishable:state.publishable,
   productionMutation:false,
  })
 })

 addEventListener('tryamm:world-build-sandbox-evidence',(event:Event)=>{
  const d=(event as CustomEvent<{evidence?:SandboxEvidence}>).detail||{}
  state={...state,evidence:{...state.evidence,...(d.evidence||{})}}
  save(state)
 })

 addEventListener('tryamm:world-build-sandbox-request-state',()=>save(state))

 emit('tryamm:world-build-sandbox-ready',{
  engine:'game/simulation/worldBuilderPipeline',
  speedEngine:'TRYAMM Quantum Speed Engine',
  certificationChecks:WORLD_CERTIFICATION_CHECKS,
  productionMutation:false,
 })
}
