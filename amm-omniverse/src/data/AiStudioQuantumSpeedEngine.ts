import {AI_STUDIO_TEAM,type EpicMissionBlueprint} from './TryammAiStudioBusiness'
import type {ProductionDiscipline} from './StreetVerseStudioFactory'

export type StudioJobState='ready'|'blocked'|'running'|'review'|'verified'
export interface StudioQuantumJob{
 id:string;missionId:string;discipline:ProductionDiscipline;agentId?:string;dependsOn:string[];
 state:StudioJobState;cacheKey:string;humanGate:boolean;priority:number;
}

const ORDER:ProductionDiscipline[]=['writing','characters','environment-art','vehicles','physics','animation','cinematics','sound','qa','optimization']
const DEPS:Partial<Record<ProductionDiscipline,ProductionDiscipline[]>>={
 characters:['writing'], 'environment-art':['writing'],vehicles:['writing'],physics:['environment-art','vehicles'],
 animation:['characters','physics'],cinematics:['animation','environment-art'],sound:['writing','cinematics'],
 qa:['characters','animation','writing','physics','vehicles','environment-art','cinematics','sound'],optimization:['qa'],
}

export function compileMissionQuantumJobs(mission:EpicMissionBlueprint):StudioQuantumJob[]{
 return ORDER.filter(d=>mission.disciplines.includes(d)).map((discipline,index)=>{
  const agent=AI_STUDIO_TEAM.find(a=>a.disciplines.includes(discipline))
  return{id:`${mission.id}:${discipline}`,missionId:mission.id,discipline,agentId:agent?.id,
   dependsOn:(DEPS[discipline]??[]).filter(d=>mission.disciplines.includes(d)).map(d=>`${mission.id}:${d}`),
   state:(index===0?'ready':'blocked') as StudioJobState,
   cacheKey:`studio:qse:${mission.cityId}:${mission.id}:${discipline}`,
   humanGate:Boolean(agent?.requiresHumanApproval.length),priority:100-index}
 })
}

export function readyStudioJobs(jobs:StudioQuantumJob[],verified:string[]){
 const done=new Set(verified)
 return jobs.filter(j=>j.state!=='verified'&&j.dependsOn.every(d=>done.has(d)))
}

export const STUDIO_QUANTUM_SPEED_ENGINE={
 mode:'dependency-safe-parallel-production',
 accelerators:[
  'parallel character/environment/vehicle work after story lock',
  'incremental regeneration of changed disciplines only','reuse certified rigs/materials/animations',
  'batch localization/captions/QA','critical-path prioritization','asset and mission cache',
  'precompute cinematics and audio variants','automatic evidence collection for certification',
 ] as const,
 hardGates:[
  'human approval where required','rights/provenance','age lane','cultural review when applicable',
  'server-authoritative rewards','QA','mobile performance','accessibility','release certification',
 ] as const,
}

export const EPIC_MISSION_RELEASE_EVIDENCE=[
 'story-continuity','character-rights','asset-certification','animation-pass','physics-pass','vehicle-pass',
 'environment-source-rights','cinematic-pass','audio-rights','mission-completion-test','reward-security',
 'accessibility','age-rating-lane','performance','crash-test','save-resume','localization','analytics','rollback',
] as const

export function missionReleaseReady(evidence:Partial<Record<(typeof EPIC_MISSION_RELEASE_EVIDENCE)[number],string>>){
 const missing=EPIC_MISSION_RELEASE_EVIDENCE.filter(x=>!evidence[x])
 return{ready:missing.length===0,missing}
}
