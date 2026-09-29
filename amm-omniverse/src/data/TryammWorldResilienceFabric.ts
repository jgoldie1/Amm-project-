export type VerseResilienceDomain='middleverse-ai'|'multiverse'|'metaverse'|'streetverse'|'holoverse'|'gameverse'

export const TRYAMM_WORLD_RESILIENCE_FABRIC={
  schema:'tryamm.middlewear.world-resilience.v1',
  promise:'A failure in one verse, AI provider, or downstream service should degrade that path without taking down unrelated TRYAMM experiences.',
  domains:{
    'middleverse-ai':{
      role:'intent routing, context preservation, AI/workforce orchestration',
      protections:['identity','audit','provider circuit breakers','AI bulkheads','request deadlines','risk gate','idempotent high-impact handoffs'],
      failureMode:'return VERIFY/DEGRADED/BLOCKED state while preserving non-AI navigation and local UI',
    },
    multiverse:{
      role:'cross-world identity/progression/context fabric across multiple TRYAMM worlds',
      protections:['Passport identity','world-transition policy','per-world bulkheads','route health','graceful fallback','event isolation'],
      failureMode:'failed world stays isolated; Passport and healthy worlds remain available',
    },
    metaverse:{
      role:'immersive business, creator, AR/VR/MR and persistent-space workflows',
      protections:['provider gating','commerce risk gate','idempotency','asset/media budgets','offline/cache fallback','audit'],
      failureMode:'pause expensive/remote operations while retaining local world state and safe navigation',
    },
    streetverse:{
      role:'playable living-city world',
      protections:['PWA cache','native asset fallback','gameplay-authoritative primitives','API backpressure','mission persistence'],
      failureMode:'visual/provider layers can fall back without destroying the playable core',
    },
    holoverse:{
      role:'holographic/spatial presentation and cross-system navigation',
      protections:['device-aware fallback','provider timeouts','route isolation','permission checks'],
      failureMode:'fall back to standard 2D/3D interface when advanced spatial providers are unavailable',
    },
    gameverse:{
      role:'multi-world game nexus',
      protections:['world health state','isolated world sessions','shared Passport','per-world capacity','safe reconnect'],
      failureMode:'one game world may reconnect while other worlds remain playable',
    },
  },
  sharedControls:[
    'Vercel edge/CDN/WAF absorption',
    'signed Origin Shield for protected legacy origin routes',
    'Jacobie Quantum Shield / crypto agility',
    'Red Hat Sentinel defensive detection',
    'Jacobie Swarm Shield rate/cost controls',
    'MiddleWear identity and authorization',
    'risk/provider/audit gating',
    'bulkheads + circuit breakers + deadlines',
    'distributed idempotency for high-impact creation',
    'graceful degradation and health/readiness reporting',
    'data minimization and disposal',
  ],
} as const

export function verseResilience(domain:VerseResilienceDomain){
  return TRYAMM_WORLD_RESILIENCE_FABRIC.domains[domain]
}
