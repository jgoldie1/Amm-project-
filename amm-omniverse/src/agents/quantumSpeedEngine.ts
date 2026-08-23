export type SpeedLane = 'runtime' | 'world' | 'commerce' | 'creator' | 'assets' | 'guardian';
export type BuildRisk = 'low' | 'medium' | 'high';
export type BuildUnit = { id:string; goal:string; lane:SpeedLane; dependencies:string[]; risk:BuildRisk; evidence:Array<'source'|'route'|'runtime'|'persistence'|'test'|'deployment'> };

export const QUANTUM_SPEED_ENGINE = {
 name:'TRYAMM Quantum Speed Engine',
 targetThroughput:'3x on reusable web/product work; lower on novel/high-risk systems',
 rule:'Speed comes from decomposition, reuse, caching, parallelism, observability and automated proof—not skipped QA.',
 accelerators:[
  'ONE PAGE CONTRACT before implementation',
  'Dependency graph removes unnecessary serialization',
  'AI Cafe lanes execute independent work in parallel',
  'HoloForge/GLE reuses assets across Web/Unity/Unreal/Godot',
  'Shared component/API templates eliminate duplicate scaffolding',
  'Quantum Lag Buster development profile reduces preview/render/network stalls',
  'Incremental build, dependency cache and asset cache reuse unchanged work',
  'Preview once, smoke once, merge once',
  'Guardian runs security/accessibility/release checks in the same wave',
 ],
 pipeline:['GOAL INTAKE','ONE PAGE CONTRACT','HOLOGPT DECOMPOSITION','DEPENDENCY GRAPH','CACHE/REUSE LOOKUP','AI CAFE PARALLEL LANES','HOLOFORGE/GLE ASSET REUSE','COMPONENT + API TEMPLATE REUSE','QUANTUM LAG BUSTER DEV PROFILE','INCREMENTAL BUILD/CACHE','GUARDIAN STATIC + SECURITY + ACCESSIBILITY CHECKS','INTEGRATION TEST','PREVIEW DEPLOY','SMOKE PROOF','HUMAN APPROVAL FOR HIGH-RISK ACTIONS','PRODUCTION RELEASE','TELEMETRY + ROLLBACK'],
} as const;

export function parallelWaves(units:BuildUnit[]){const pending=new Map(units.map(u=>[u.id,u]));const completed=new Set<string>();const waves:BuildUnit[][]=[];while(pending.size){const wave=[...pending.values()].filter(u=>u.dependencies.every(d=>completed.has(d)));if(!wave.length)throw new Error('Build graph contains a missing dependency or cycle');waves.push(wave);wave.forEach(u=>{pending.delete(u.id);completed.add(u.id)})}return waves}

export const ONE_PAGE_CONTRACT=['OUTCOME','ROUTE','USER/AUTH STATE','DATA/API','REUSABLE UI','ASSET NEEDS','WORLD PLACEMENT','COMMERCE/CREATOR HOOKS','ACCESSIBILITY','ERROR/LOADING','TEST EVIDENCE','DEPLOYMENT PROOF'] as const;
export const FAST_PAGE_FACTORY=['PAGE BRIEF','ROUTE CONTRACT','DESIGN TOKEN TEMPLATE','REUSABLE COMPONENTS','DATA/API CONTRACT','ASSET CACHE LOOKUP','ACCESSIBILITY','RESPONSIVE STATES','ERROR/LOADING STATES','TEST','PREVIEW','SMOKE','PUBLISH'] as const;
export const PARALLEL_PAGE_WAVE={runtime:'API + persistence + route',commerce:'data + pricing + transactions',assets:'GLE/GLB + media',creator:'content + sharing + attribution',world:'placement + interactions',guardian:'tests + accessibility + telemetry'} as const;
