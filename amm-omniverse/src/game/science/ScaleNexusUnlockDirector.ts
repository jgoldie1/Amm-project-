export type UnlockDomain='streetverse'|'sports'|'racing'|'holo'|'micro'|'earth'|'space'|'creator'

export interface CrossGameUnlock {
  id:string
  domain:UnlockDomain
  title:string
  description:string
  requiresThreads:string[]
  requiresDiscoveries?:string[]
  teenSafe:boolean
}

export interface UnlockState {
  completedThreads:string[]
  discoveries:string[]
  unlockedIds:string[]
  achievements:string[]
}

const unique=<T>(xs:T[])=>[...new Set(xs)]

export const CROSS_GAME_UNLOCKS:CrossGameUnlock[]=[
  {id:'portal-hidden-scale',domain:'holo',title:'Hidden Scale Portal',description:'Unlock a secret Holo Portal that can transition directly between MicroWorld, Living Earth and Living Space scenes.',requiresThreads:['thread-worlds-within-worlds'],teenSafe:true},
  {id:'streetverse-lab-mission',domain:'streetverse',title:'Holo Heights Research Job',description:'Unlock a StreetVerse mission chain connecting Copy Smart NPC rumors to a science-lab investigation.',requiresThreads:['thread-signal-across-scale'],teenSafe:true},
  {id:'sports-zero-g-arena',domain:'sports',title:'Zero-G Arena Exhibition',description:'Unlock an orbital exhibition arena with altered presentation and movement rules while preserving competitive fairness.',requiresThreads:['thread-dust-to-stars'],teenSafe:true},
  {id:'volcano-cosmic-circuit',domain:'racing',title:'Cosmic Circuit',description:'Unlock a fictional Holo racing circuit using orbital and planetary visual themes.',requiresThreads:['thread-dust-to-stars','thread-worlds-within-worlds'],teenSafe:true},
  {id:'creator-scale-showcase',domain:'creator',title:'Worlds Within Worlds Showcase',description:'Unlock a creator stage where microscope, Earth and space discoveries can drive music, visuals and educational performances.',requiresThreads:['thread-worlds-within-worlds'],teenSafe:true},
  {id:'space-deep-relay',domain:'space',title:'Deep Relay',description:'Unlock a new orbital communications mission after solving the cross-scale signal thread.',requiresThreads:['thread-signal-across-scale'],teenSafe:true}
]

export function evaluateCrossGameUnlocks(state:UnlockState){
  const earned=CROSS_GAME_UNLOCKS.filter(u=>
    u.requiresThreads.every(t=>state.completedThreads.includes(t))&&
    (u.requiresDiscoveries??[]).every(d=>state.discoveries.includes(d))
  )
  return {
    ...state,
    unlockedIds:unique([...state.unlockedIds,...earned.map(x=>x.id)]),
    achievements:unique([...state.achievements,...earned.map(x=>`achievement:${x.id}`)])
  }
}

export const HIDDEN_PORTAL_ROUTES=[
  {id:'micro-to-holo-heights',from:'micro-chip-world',to:'streetverse-holo-heights',requiresUnlock:'portal-hidden-scale'},
  {id:'earth-to-orbital-arena',from:'living-earth',to:'sports-zero-g-arena',requiresUnlock:'sports-zero-g-arena'},
  {id:'streetverse-to-deep-relay',from:'streetverse-holo-heights',to:'space-deep-relay',requiresUnlock:'space-deep-relay'},
  {id:'micro-to-space-direct',from:'micro-material-lab',to:'living-space-orbit',requiresUnlock:'portal-hidden-scale'}
] as const

export const SCALE_UNLOCK_RULES={
  authoritativeAwarding:'game-server',
  aiCan:'explain-hints-suggest-next-goal',
  aiCannot:'grant-unlocks-xp-currency-entitlements',
  competitiveRule:'Cross-scale unlocks may change presentation, venues and mission access but never secretly boost ranked competitive stats.',
  teenRule:'Only teen-safe unlocks are exposed inside Teen Takeover.'
} as const
