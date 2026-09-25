export type HoloSpeedMode='QUANTUM_FAST'|'BALANCED'|'DEEP'
export type MemoryTier='HOT'|'WARM'|'COLD'
export interface LatencySample{provider:string;ttftMs:number;totalMs:number;tokensPerSecond:number;healthy:boolean;cacheHit:boolean}
export interface ContextSlice{id:string;tier:MemoryTier;relevance:number;tokens:number;updatedAt:string}
export interface SpeedDecision{mode:HoloSpeedMode;provider:string;contextIds:string[];parallelTools:boolean;streamImmediately:boolean;reason:string}

export const QUANTUM_SPEED_ENGINE={
  name:'Quantum Speed Engine',
  meaning:'Software latency orchestration; it does not claim quantum-computing hardware.',
  stages:['CLASSIFY_INTENT','SELECT_FASTEST_CAPABLE_PROVIDER','LOAD_MINIMUM_CONTEXT','RUN_SAFE_TOOLS_IN_PARALLEL','STREAM_FIRST_USEFUL_OUTPUT','RECORD_LATENCY'],
  targets:{intentRouteMs:100,streamImmediately:true},
} as const

export const QUANTUM_LAG_BUSTER={
  name:'Quantum Lag Buster',
  rules:[
    'race healthy authorized providers only when policy permits',
    'cancel redundant work after a winner is selected',
    'cache stable tool and retrieval results',
    'pre-index uploaded files instead of reparsing on every turn',
    'use deadlines and circuit breakers for slow providers',
    'keep 3D rendering off the conversational critical path',
    'degrade gracefully from rich context to minimum sufficient context',
  ],
} as const

export const GOOGOLPLEX_MEMORY={
  name:'Googolplex Memory',
  meaning:'A branded hierarchical memory architecture, not literal googolplex-sized storage.',
  tiers:{HOT:'current intent/session working set',WARM:'retrievable project/context graph',COLD:'permissioned archive with retention/deletion rules'},
  principles:['retrieve by relevance, not whole-history injection','hash/provenance every durable artifact','owner permissions before retrieval','summarize and compact repeated context','expire or delete according to retention policy'],
} as const

export function rankProvider(samples:LatencySample[]){
  return samples.filter(x=>x.healthy).sort((a,b)=>(a.ttftMs-b.ttftMs)||(b.tokensPerSecond-a.tokensPerSecond))[0]
}

export function selectContext(slices:ContextSlice[],budgetTokens=6000){
  const ranked=[...slices].sort((a,b)=>b.relevance-a.relevance)
  const chosen:ContextSlice[]=[];let used=0
  for(const item of ranked){if(item.tokens+used>budgetTokens)continue;chosen.push(item);used+=item.tokens}
  return chosen
}

export function buildSpeedDecision(mode:HoloSpeedMode,samples:LatencySample[],slices:ContextSlice[]):SpeedDecision{
  const provider=rankProvider(samples)
  if(!provider)throw new Error('No healthy authorized provider available')
  const budget=mode==='QUANTUM_FAST'?2500:mode==='BALANCED'?6000:14000
  const context=selectContext(slices,budget)
  return{mode,provider:provider.provider,contextIds:context.map(x=>x.id),parallelTools:mode!=='DEEP',streamImmediately:true,reason:`lowest healthy TTFT + relevant context within ${budget}-token budget`}
}
