export type CompanionCommand='follow'|'stay'|'search'|'help'|'defend'|'return'
export type EcologyZone='dense-city'|'residential'|'park'|'lakefront'|'wooded'|'rural'|'interior'
export type EncounterKind='ambient'|'mission'|'rescue'|'territorial'|'predator-prey'|'fictional-combat'

export interface CompanionState{kind:'dog'|'horse'|'bird'|'robotic';name:string;trust:number;health:number;stamina:number;command:CompanionCommand}
export interface EcologyContext{zone:EcologyZone;distanceToPlayer:number;missionRelevant:boolean;companionPresent:boolean;mobile:boolean;hour:number}
export interface EcologyBudget{ambientAnimals:number;missionAnimals:number;insectMode:'off'|'ambient-particles';simulateOffscreen:boolean}

export const STREETVERSE_ECOLOGY_RULES={
 purpose:'Make the city feel alive without animal or insect clutter.',
 realWorldAttackTraining:false,
 fictionalCombatOnly:true,
 persistentCompanions:1,
 mobileVisibleAmbientAnimals:3,
 desktopVisibleAmbientAnimals:6,
 insectRule:'Insects are ambient effects unless a mission explicitly requires an individual creature.',
 encounterRule:'Render conflict only near the player or when mission-relevant; otherwise resolve it as background simulation.',
 priority:['mission','companion','rescue','ambient'] as const,
} as const

export const ecologyBudget=(c:EcologyContext):EcologyBudget=>{
 const active=c.distanceToPlayer<=45||c.missionRelevant
 if(!active)return{ambientAnimals:0,missionAnimals:0,insectMode:'off',simulateOffscreen:true}
 const base=c.mobile?STREETVERSE_ECOLOGY_RULES.mobileVisibleAmbientAnimals:STREETVERSE_ECOLOGY_RULES.desktopVisibleAmbientAnimals
 const zoneFactor:number=({ 'dense-city':.2,residential:.45,park:1,lakefront:.8,wooded:1,rural:1,interior:0 } as Record<EcologyZone,number>)[c.zone]
 const reserved=c.companionPresent?1:0
 return{ambientAnimals:Math.max(0,Math.floor(base*zoneFactor)-reserved),missionAnimals:c.missionRelevant?2:0,insectMode:c.zone==='park'||c.zone==='lakefront'||c.zone==='wooded'||c.zone==='rural'?'ambient-particles':'off',simulateOffscreen:true}
}

export const shouldRenderEncounter=(kind:EncounterKind,distanceToPlayer:number,missionRelevant=false)=>{
 if(kind==='mission'||kind==='rescue')return missionRelevant||distanceToPlayer<=55
 if(kind==='fictional-combat'||kind==='territorial'||kind==='predator-prey')return distanceToPlayer<=30
 return distanceToPlayer<=45
}

export const CIRCLE_PARK_COMPANION:CompanionState={kind:'dog',name:'Companion',trust:50,health:100,stamina:100,command:'follow'}
