import {buildCeoPlan,FOUNDER_AI_CEO_CHARTER} from '../data/FounderAiCeoExecutor'
import {BUILD_AGENTS,ASSET_FORGE_CONTRACT} from '../agents/buildSwarm'
import {CIRCLE_PARK_RELEASE_POLICY,SELF_CONTAINED_ASSET_POLICY} from '../data/QuantumAssetForgeOrchestrator'
import {MESHY_RIG_FACTORY,STREETVERSE_CHARACTER_RIG_QUEUE} from './MeshyRigFactory'

export const STREETVERSE_ASSET_EXECUTIVE_CHAIN={
  founder:'Founder authorizes provider credit use, likeness references and production publication.',
  ceo:'AI CEO sets product-readiness priority and keeps the real missing GLB/rig evidence at the top of the backlog.',
  distinguishedEngineer:'Distinguished Engineer owns end-to-end architecture: generate → rig → validate → publish → runtime swap → global reuse.',
  assetEngineer:'HoloForge / Meshy Asset Engineer operates provider tasks and GLB validation.',
  characterEngineer:'Character Systems Engineer verifies skeleton, height, walk/run animation and fallback behavior.',
  globalWorldEngineer:'StreetVerse Global Engineer reuses the certified base rig pack across cities, then applies city-specific wardrobe/style packs.',
  releaseGuardian:'Release Guardian requires provider task IDs, stored GLBs and runtime load evidence before calling an asset complete.',
} as const

export const STREETVERSE_ASSET_EXECUTIVE_RULES={
  useExistingStructures:true,
  ceoCharter:FOUNDER_AI_CEO_CHARTER,
  ceoPlan:buildCeoPlan(['product-readiness','reliability']),
  buildAgents:BUILD_AGENTS.map(a=>a.id),
  assetForgeContract:ASSET_FORGE_CONTRACT,
  nativeBaseline:SELF_CONTAINED_ASSET_POLICY.nativeBaseline,
  externalCreditPolicy:CIRCLE_PARK_RELEASE_POLICY,
  meshyRigFactory:MESHY_RIG_FACTORY,
  firstRigQueue:STREETVERSE_CHARACTER_RIG_QUEUE.map(item=>item.assetId),
  completionEvidence:['real Meshy generation task id','real Meshy rig task id','validated GLB bytes','durable TRYAMM asset URL','runtime load success','fallback preserved','mobile visual proof'],
} as const

let installed=false
export function installStreetVerseAssetExecutiveRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:asset-executive-state',{detail:STREETVERSE_ASSET_EXECUTIVE_RULES})))
  window.addEventListener('tryamm:asset-executive-sprint',()=>{
    const tasks=[
      {workstream:'executive',title:'AI CEO: make real rigged StreetVerse GLBs the product-readiness blocker',priority:'critical'},
      {workstream:'assets',title:'Distinguished Engineer: converge Meshy generation rig validation publication and runtime swap',priority:'critical'},
      {workstream:'streetverse',title:'Character Engineer: verify published BJ/NPC rigs load, move and preserve fallback',priority:'critical'},
      {workstream:'global-business',title:'StreetVerse Global Engineer: reuse certified global character pack across city registry',priority:'high'},
      {workstream:'release',title:'Release Guardian: require task IDs + stored GLB + visual evidence before GREEN',priority:'critical'},
    ]
    for(const task of tasks)window.dispatchEvent(new CustomEvent('tryamm:ai-cafe-task',{detail:task}))
    window.dispatchEvent(new CustomEvent('tryamm:asset-executive-order',{detail:{chain:STREETVERSE_ASSET_EXECUTIVE_CHAIN,tasks}}))
  })
}
