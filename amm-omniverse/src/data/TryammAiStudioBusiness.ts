import type {ProductionDiscipline} from './StreetVerseStudioFactory'

export type StudioRole='creative-director'|'mission-designer'|'character-team'|'animation-team'|'world-team'|'vehicle-team'|'cinematic-team'|'audio-team'|'qa-team'|'optimization-team'
export type MissionLane='story'|'business'|'creator'|'career'|'mystery'|'racing'|'delivery'|'music'|'after-dark'|'global-adventure'

export interface AiStudioAgent{
 id:string;role:StudioRole;disciplines:ProductionDiscipline[];canDraft:boolean;requiresHumanApproval:string[]
}
export const AI_STUDIO_TEAM:AiStudioAgent[]=[
 {id:'director-ai',role:'creative-director',disciplines:['writing','cinematics'],canDraft:true,requiresHumanApproval:['canon','major character arcs']},
 {id:'mission-ai',role:'mission-designer',disciplines:['writing','qa'],canDraft:true,requiresHumanApproval:['reward economy','age lane']},
 {id:'character-ai',role:'character-team',disciplines:['characters'],canDraft:true,requiresHumanApproval:['real-person likeness']},
 {id:'animation-ai',role:'animation-team',disciplines:['animation'],canDraft:true,requiresHumanApproval:['hero performance']},
 {id:'world-ai',role:'world-team',disciplines:['environment-art','physics'],canDraft:true,requiresHumanApproval:['landmarks','cultural representation']},
 {id:'vehicle-ai',role:'vehicle-team',disciplines:['vehicles','physics'],canDraft:true,requiresHumanApproval:['brand/IP use']},
 {id:'cinema-ai',role:'cinematic-team',disciplines:['cinematics'],canDraft:true,requiresHumanApproval:['final cut']},
 {id:'audio-ai',role:'audio-team',disciplines:['sound'],canDraft:true,requiresHumanApproval:['music/voice rights']},
 {id:'qa-ai',role:'qa-team',disciplines:['qa'],canDraft:false,requiresHumanApproval:['waivers']},
 {id:'optimize-ai',role:'optimization-team',disciplines:['optimization'],canDraft:false,requiresHumanApproval:['release exceptions']},
]

export interface EpicMissionBlueprint{
 id:string;lane:MissionLane;cityId:string;title:string;acts:number;estimatedMinutes:number;
 disciplines:ProductionDiscipline[];ageLane:'12+'|'teen'|'adult';rewardBearing:boolean;
}
export function createEpicMission(id:string,cityId:string,lane:MissionLane,title:string):EpicMissionBlueprint{
 return{id,cityId,lane,title,acts:lane==='global-adventure'?5:3,estimatedMinutes:lane==='global-adventure'?60:30,
  disciplines:['characters','animation','writing','physics','vehicles','environment-art','cinematics','sound','qa','optimization'],
  ageLane:lane==='after-dark'?'adult':'12+',rewardBearing:true}
}

export const OMNIVERSE_AFTER_DARK={
 lane:'adult' as const,
 access:'age-gated',
 experiences:['nightlife districts','late-night creator shows','music venues','restaurants','mystery adventures','night racing','cinematic missions','adult social spaces'],
 rules:[
  'No sexual content involving minors.','Adult lane remains separate from teen experiences.',
  'Consent and harassment controls are mandatory.','No real-world illegal-service marketplace.',
  'Reward-bearing missions use server-authoritative settlement.','Alcohol/gambling systems, if ever considered, require separate jurisdictional review and are not enabled by this architecture.',
 ] as const,
}

export const AI_STUDIO_BUSINESS_MODEL={
 services:['mission production','business digital twins','creator shows','commercials','music visuals','virtual events','city content packs'],
 ownership:'TRYAMM owns its original orchestration and commissioned/original IP subject to contracts; third-party rights remain governed by licenses.',
 humanJobs:['creative direction','cultural review','voice/performance','rights clearance','QA','customer success','local business onboarding'],
}
