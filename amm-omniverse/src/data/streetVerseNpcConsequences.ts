export type StreetVerseNpcHealth=Readonly<{maxHealth:number;staggerMs:number;downedMs:number;canBeTargeted:boolean}>
export const DEFAULT_NPC_HEALTH:StreetVerseNpcHealth={maxHealth:100,staggerMs:420,downedMs:5000,canBeTargeted:true}
export const PROTECTED_NPC_ROLES=['medical-worker','student','campus-guide'] as const
export const STREETVERSE_HIT_CONSEQUENCE={
 damagePerHit:25,
 missionEvent:'tryamm:streetverse-npc-consequence',
 hitEvent:'tryamm:streetverse-npc-hit',
 rules:'Fictional gameplay only. Server validates target eligibility, health, mission state, cooldown and protected zones.'
} as const
