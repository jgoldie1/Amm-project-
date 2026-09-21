import { discoverStreetVerseMission, completeStreetVerseMission } from './StreetVerseMissionDiscoveryRuntime'
import { createLearningPassport, type LearningPassport } from '../education/learningPassport'
import { nextLearningAction, type MasteryRecord } from '../education/missionTaskAssessmentEngine'

export type LivingLearningMission = {
  missionId:string
  skillId:string
  title:string
  world:'streetverse'
  category:'business'|'delivery'|'story'|'exploration'
  lessonContext:string
  realLifeSimulation:string
  accessibility:{oneHandABC:true;voiceReady:true;virtualAlternative:true}
}

const skillMissions:Record<string,Omit<LivingLearningMission,'missionId'|'skillId'>>={
  'budget-builder':{title:'Neighborhood Budget Run',world:'streetverse',category:'business',lessonContext:'Build a budget and distinguish needs, costs and reserves.',realLifeSimulation:'Balance a simulated neighborhood business budget before making purchasing choices.',accessibility:{oneHandABC:true,voiceReady:true,virtualAlternative:true}},
  'creator-rights':{title:'Creator Rights Studio Mission',world:'streetverse',category:'story',lessonContext:'Identify ownership, permission, attribution and clearance requirements.',realLifeSimulation:'Prepare a fictional media release while resolving rights and attribution choices.',accessibility:{oneHandABC:true,voiceReady:true,virtualAlternative:true}},
  'college-trade-ready':{title:'Career Pathway Mission',world:'streetverse',category:'exploration',lessonContext:'Compare college, trade, apprenticeship and work pathways.',realLifeSimulation:'Visit simulated pathway stations and build a next-step plan.',accessibility:{oneHandABC:true,voiceReady:true,virtualAlternative:true}},
  'grant-ready':{title:'Business Readiness Mission',world:'streetverse',category:'business',lessonContext:'Understand business readiness, documentation, budget and eligibility.',realLifeSimulation:'Assemble a simulated readiness packet without claiming approval or guaranteed funding.',accessibility:{oneHandABC:true,voiceReady:true,virtualAlternative:true}},
}

export function compileLearningMission(skillId:string,studentId:string):LivingLearningMission{
 const template=skillMissions[skillId]??{title:'Adaptive StreetVerse Skill Mission',world:'streetverse' as const,category:'exploration' as const,lessonContext:'Practice the current learning objective.',realLifeSimulation:'Apply the skill in a safe fictional simulation and preserve evidence.',accessibility:{oneHandABC:true as const,voiceReady:true as const,virtualAlternative:true as const}}
 const mission={...template,skillId,missionId:`learn:${skillId}:${studentId}`}
 discoverStreetVerseMission({missionId:mission.missionId,title:mission.title,rarity:'common',category:mission.category,playerId:studentId,metadata:{learningMission:true,skillId,lessonContext:mission.lessonContext,accessibility:mission.accessibility}})
 return mission
}

export function recommendMissionFromMastery(record:MasteryRecord){
 const next=nextLearningAction(record)
 if(next.action==='NEXT_SKILL') return {action:next.action,mission:null,message:next.message}
 return {action:next.action,mission:compileLearningMission(record.skillId,record.studentId),message:next.message}
}

export function recordLearningMissionEvidence(input:{mission:LivingLearningMission;scorePercent:number;passport?:LearningPassport}){
 const score=Math.max(0,Math.min(100,input.scorePercent))
 const completed=completeStreetVerseMission(input.mission.missionId,{learningEvidence:true,skillId:input.mission.skillId,scorePercent:score})
 const passport=input.passport??createLearningPassport({userId:'local-student'})
 return {completed,passport,evidence:{missionId:input.mission.missionId,skillId:input.mission.skillId,scorePercent:score,simulation:input.mission.realLifeSimulation}}
}

export function installLivingLearningMissionBridge(){
 if(typeof window==='undefined')return
 window.addEventListener('tryamm:learning:mission-request',(event:Event)=>{
  const detail=(event as CustomEvent<{skillId?:string;studentId?:string}>).detail||{}
  if(!detail.skillId)return
  const mission=compileLearningMission(detail.skillId,detail.studentId||'local-student')
  window.dispatchEvent(new CustomEvent('tryamm:learning:mission-ready',{detail:mission}))
 })
 window.dispatchEvent(new CustomEvent('tryamm:living-learning:ready',{detail:{loop:['classroom','lesson','homework','streetverse-mission','assessment','mastery','learning-passport','next-mission'],oneHandABC:true,voiceReady:true}}))
}
