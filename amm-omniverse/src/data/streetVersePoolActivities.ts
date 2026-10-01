export type StreetVersePoolMode=
 'free-swim'|'lap-race'|'relay'|'ring-hunt'|'water-basketball'|'float-race'|'sync-routine'|'aqua-fitness'|'rescue-challenge'|'pool-party-live'

export const STREETVERSE_POOL_MODES=[
 {id:'free-swim',label:'Free Swim',xp:20,competitive:false},
 {id:'lap-race',label:'Lap Race',xp:75,competitive:true},
 {id:'relay',label:'Team Relay',xp:100,competitive:true},
 {id:'ring-hunt',label:'Underwater Ring Hunt',xp:80,competitive:true},
 {id:'water-basketball',label:'Water Basketball',xp:100,competitive:true},
 {id:'float-race',label:'Float Race',xp:60,competitive:true},
 {id:'sync-routine',label:'Sync Routine',xp:90,competitive:true},
 {id:'aqua-fitness',label:'Aqua Fitness',xp:45,competitive:false},
 {id:'rescue-challenge',label:'Lifeguard Rescue Challenge',xp:110,competitive:true},
 {id:'pool-party-live',label:'Pool Party LIVE / PK',xp:50,competitive:false},
] as const

export const STREETVERSE_POOL_RULES={
 reusableAcrossAllPools:true,
 accessibility:{oneButtonLaneAssist:true,lowImpactMode:true,spectatorMode:true,reducedMotion:true},
 safety:{gameOnly:true,noBreathHoldInstruction:true,depthCheckedDiveEvents:true,noRealMoneyWagering:true},
 rewards:'Server validates XP, achievements, tournament results and creator rewards.',
 liveHooks:['race-start','relay-finish','trick-moment','water-basket','sync-finish','pool-party-live','reel-moment'],
} as const

export const requestPoolReward=(detail:Record<string,unknown>)=>window.dispatchEvent(new CustomEvent('tryamm:pool-reward-request',{detail:{...detail,serverValidate:true}}))
