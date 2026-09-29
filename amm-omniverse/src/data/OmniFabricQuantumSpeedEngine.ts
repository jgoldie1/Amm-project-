import {compileOmniIntent,type OmniIntent,type ComputeLane} from './TryammOmniFabric'

export type QuantumAccelerationMode='parallel'|'pipeline'|'cache-hit'|'incremental'|'speculative-safe'
export interface QuantumExecutionNode{
 id:string;lane:ComputeLane;dependsOn:string[];mode:QuantumAccelerationMode;cacheKey:string;
 deterministic:boolean;serverAuthority:boolean;
}

export const OMNI_QUANTUM_SPEED_ENGINE={
 name:'OmniFabric Quantum Speed Engine',
 meaning:'Software acceleration inspired by dependency-graph and parallel execution. No claim of quantum-computer hardware.',
 strategies:[
  'parallelize independent compute lanes','pipeline dependent stages as soon as evidence passes',
  'reuse certified cache outputs','incrementally rebuild only invalidated nodes',
  'speculatively prepare non-authoritative visual/media work','batch world and asset validation',
  'prioritize player-visible critical path','prewarm adjacent districts and likely intents',
 ] as const,
}

export function compileQuantumOmniIntent(intent:OmniIntent):QuantumExecutionNode[]{
 const base=compileOmniIntent(intent)
 return base.tiles.map((tile,i)=>{
  const lane=tile.lanes[0]
  const authoritative=intent.rewardBearing||lane==='commerce'
  return{id:tile.id,lane,dependsOn:i===0?[]:[base.tiles[i-1].id],
   mode:i===0?'parallel':lane==='render'||lane==='media'?'speculative-safe':'pipeline',
   cacheKey:`omni:qse:${intent.cityId??'global'}:${intent.action}:${lane}`,
   deterministic:authoritative||lane==='physics'||lane==='world-sim',serverAuthority:authoritative}
 })
}

export function quantumParallelWaves(nodes:QuantumExecutionNode[]){
 const done=new Set<string>();const waves:QuantumExecutionNode[][]=[];let pending=[...nodes]
 while(pending.length){
  const ready=pending.filter(n=>n.dependsOn.every(d=>done.has(d)))
  if(!ready.length)throw new Error('Quantum execution graph contains a dependency cycle')
  waves.push(ready);ready.forEach(n=>done.add(n.id));pending=pending.filter(n=>!done.has(n.id))
 }
 return waves
}

export const QUANTUM_SPEED_SAFETY={
 neverSpeculatePayments:true,neverSpeculateLedgerPosts:true,neverSkipRights:true,
 neverSkipCertification:true,neverWeakenPrivacy:true,neverWeakenAccessibility:true,
 cacheMustBeVersioned:true,deterministicRewards:true,
} as const
