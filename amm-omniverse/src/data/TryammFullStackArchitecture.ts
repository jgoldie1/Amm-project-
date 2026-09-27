export type StackLayer='experience'|'world-runtime'|'ai-studio'|'assets'|'quantum'|'data'|'identity'|'commerce'|'media'|'observability'|'security'|'delivery'|'governance'
export interface FullStackLayer{layer:StackLayer;systems:string[];productionGates:string[]}

export const TRYAMM_FULL_STACK:FullStackLayer[]=[
 {layer:'experience',systems:['StreetVerse Chicago/Global','Adult After Dark','LIVE/PK/Reels','TV/Radio/News','Marketplace'],productionGates:['mobile navigation','accessibility','age lanes']},
 {layer:'world-runtime',systems:['Living City Runtime','Extreme Reality','LOD Streaming','district opportunities','OmniFabric'],productionGates:['fps/memory','save-resume','offline degradation']},
 {layer:'ai-studio',systems:['AI Studio Team','Epic Mission Composer','Reusable Adventure Library','Quantum Mission Production'],productionGates:['human review','continuity','cultural review']},
 {layer:'assets',systems:['Asset Forge','Asset Passports','Asset Registry','rig/animation/LOD pipeline'],productionGates:['rights/provenance','runtime validation']},
 {layer:'quantum',systems:['Quantum Speed Engine','Quantum Global Compiler','PyQPanda3 adapter','classical baseline router'],productionGates:['benchmark proof','classical fallback','no speculative money/auth']},
 {layer:'data',systems:['Supabase','world manifests','event schema','cache','search/index boundary'],productionGates:['migration tests','retention','backup/restore']},
 {layer:'identity',systems:['Passport','Supabase Auth','entitlements','roles'],productionGates:['provider runtime tests','session security','minor/adult separation']},
 {layer:'commerce',systems:['Stripe checkout','verified webhook','orders','entitlements','ledger','split policy'],productionGates:['server authority','idempotency','refund/reconciliation']},
 {layer:'media',systems:['Holo LIVE','TRYAMM TV','Isaiah AI TV','Radio','News','rights sync'],productionGates:['ingest/playback','rights','captions','replay']},
 {layer:'observability',systems:['structured events','performance telemetry','error/crash reporting','release evidence'],productionGates:['privacy minimization','alerts','SLOs']},
 {layer:'security',systems:['secrets boundary','rate limits','abuse controls','dependency/SAST gates','audit trail'],productionGates:['threat review','least privilege','incident plan']},
 {layer:'delivery',systems:['GitHub Actions','Vercel web','Capacitor Android/iOS','PWA','feature flags'],productionGates:['CI green','signed builds','rollback','deployment verification']},
 {layer:'governance',systems:['70x70 audit','city certification','rights/privacy/accessibility/security policies'],productionGates:['evidence-backed status','no false-live claims']},
]

export const FULL_STACK_NEXT_IMPLEMENTATION=[
 'unified OmniWorldRuntime composing compiler + living city + assets + reality + opportunities + quantum',
 'typed event bus connecting missions/media/commerce/ledger without UI coupling',
 'feature-flag/config service for city, device, age lane and jurisdiction',
 'observability adapter with crash/performance/release evidence',
 'backup/restore and disaster-recovery verification',
 'contract/integration tests for auth, checkout-webhook-entitlement-ledger and mission rewards',
 'Chicago end-to-end playable vertical slice before broadening production claims',
] as const

export function fullStackReadiness(evidence:Partial<Record<StackLayer,string>>){
 const missing=TRYAMM_FULL_STACK.map(x=>x.layer).filter(x=>!evidence[x])
 return{layers:TRYAMM_FULL_STACK.length,verified:TRYAMM_FULL_STACK.length-missing.length,missing,productionReady:missing.length===0}
}
