import type {GameplayAction} from '../simulation/gameplaySimulationBridge'
import {completeStubbsCharacterMission, readStubbsRelationshipLedger} from './meetTheStubbsRelationshipMemory'
import {getStubbsPassport} from './meetTheStubbsFamilyFriends'

export type StubbsFamilyMission={
 id:string
 characterId:string
 title:string
 objective:string
 action:GameplayAction
 milestone:string
 minMeetings:number
 objectiveTarget:number
}
export const STUBBS_FAMILY_MISSIONS:StubbsFamilyMission[]=[
 {id:'stubbs-benny-omni-guide',characterId:'benny',title:'Omni Guide',objective:'Guide a player from the family district into a connected TRYAMM experience.',action:'host-creator-event',milestone:'omni-guide',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-simone-postal-route',characterId:'simone-j',title:'Family Postal Route',objective:'Complete a neighborhood mail and package route connecting homes and businesses.',action:'complete-delivery',milestone:'postal-connector',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-alb-block-purpose',characterId:'al-b',title:'Purpose on the Block',objective:'Complete a neighborhood business-building mission.',action:'open-business',milestone:'block-builder',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-asia-holo-explorer',characterId:'asia-watson',title:'Explore the Holo Lane',objective:'Host a creator event connecting the family district to HoloVerse.',action:'host-creator-event',milestone:'holo-explorer',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-deon-game-run',characterId:'deon-ham',title:'Family Game Run',objective:'Complete a neighborhood delivery challenge through GameVerse.',action:'complete-delivery',milestone:'game-runner',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-bj-street-builder',characterId:'bj-stubbs',title:'Build Your Lane',objective:'Complete a neighborhood delivery and return to BJ.',action:'complete-delivery',milestone:'street-builder',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-kenosha-legacy',characterId:'kenosha',title:'Legacy Walk',objective:'Complete a family-history route through the district.',action:'host-creator-event',milestone:'legacy-keeper',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-raymond-route',characterId:'raymond-jarreau',title:'Another Route',objective:'Complete a transit route that connects the family district.',action:'complete-transit-mission',milestone:'route-finder',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-shawndell-creator',characterId:'shawndell-shelton',title:'Creator Family',objective:'Host a creator event in the district.',action:'host-creator-event',milestone:'family-creator',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-tasha-help-chain',characterId:'tasha-ash',title:'The Call That Changed Everything',objective:'Complete a fictional help-chain route by connecting a person in need with trusted support and community resources.',action:'complete-delivery',milestone:'help-chain',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-sarah-family-resource-route',characterId:'sarah',title:'Family Resource Route',objective:'Help three fictional StreetVerse households connect with appropriate community resources and follow-up support.',action:'complete-delivery',milestone:'family-resource-connector',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-nikki-detroit-bridge',characterId:'nikki-frances',title:'Detroit Connection',objective:'Complete a regional companion route linking Chicago and the Detroit story lane.',action:'complete-transit-mission',milestone:'detroit-connector',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-tae-florida-bridge',characterId:'tae-monroe',title:'Florida Connection',objective:'Complete a regional companion route linking StreetVerse to the Florida story lane.',action:'complete-transit-mission',milestone:'florida-connector',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-jay-decision-run',characterId:'jay',title:'Four Ways Through',objective:'Complete three StreetVerse objectives while using the A/B/C/D decision system.',action:'complete-delivery',milestone:'decision-runner',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-nova-world-memory',characterId:'nova',title:'World Memory',objective:'Complete three encounters that build persistent StreetVerse relationship history.',action:'host-creator-event',milestone:'world-memory',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-ace-free-roam',characterId:'ace',title:'Corner Challenge',objective:'Discover and complete three optional free-roam activities.',action:'complete-delivery',milestone:'free-roam-discovery',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-sky-alternate-route',characterId:'sky',title:'Another Way',objective:'Complete three objectives using alternate StreetVerse routes.',action:'complete-transit-mission',milestone:'alternate-route',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-miles-reputation',characterId:'miles',title:'City Remembers',objective:'Complete three positive world interactions that build persistent reputation.',action:'open-business',milestone:'reputation-builder',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-michael-vegas-connection',characterId:'michael',title:'Vegas Connection',objective:'Complete a regional StreetVerse route connecting people, jobs and businesses in the Las Vegas story lane.',action:'complete-transit-mission',milestone:'vegas-connector',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-alphonso-care-route',characterId:'alphonso',title:'Care Shift',objective:'Complete three fictional caregiving support objectives while protecting dignity, safety and privacy.',action:'complete-delivery',milestone:'care-support',minMeetings:1,objectiveTarget:3},
]
export function availableStubbsFamilyMissions(characterNameOrId:string){
 const passport=getStubbsPassport(characterNameOrId)
 if(!passport)return []
 const memory=readStubbsRelationshipLedger()[passport.id]
 return STUBBS_FAMILY_MISSIONS.filter(m=>m.characterId===passport.id&&(memory?.metCount||0)>=m.minMeetings&&!memory?.missionIds.includes(m.id))
}
export function finishStubbsFamilyMission(missionId:string,context:{cityId:string;neighborhoodId:string}){
 const mission=STUBBS_FAMILY_MISSIONS.find(m=>m.id===missionId)
 if(!mission)return
 const recorded=completeStubbsCharacterMission(mission.characterId,mission.id,{milestone:mission.milestone,...context})
 return {mission,recorded}
}

export type StubbsFamilyMissionProgress={missionId:string;status:'active'|'complete';startedAt:string;completedAt?:string;objectiveCount:number;objectiveTarget:number}
export const STUBBS_FAMILY_MISSION_PROGRESS_KEY='tryamm:stubbs-family.missions.v1'
export function readStubbsFamilyMissionProgress():Record<string,StubbsFamilyMissionProgress>{
 if(typeof localStorage==='undefined')return {}
 try{return JSON.parse(localStorage.getItem(STUBBS_FAMILY_MISSION_PROGRESS_KEY)||'{}')}catch{return {}}
}
export function acceptStubbsFamilyMission(missionId:string){
 const mission=STUBBS_FAMILY_MISSIONS.find(m=>m.id===missionId)
 if(!mission)return
 const progress=readStubbsFamilyMissionProgress()
 if(progress[missionId]?.status==='complete')return progress[missionId]
 const next:StubbsFamilyMissionProgress=progress[missionId]||{missionId,status:'active',startedAt:new Date().toISOString(),objectiveCount:0,objectiveTarget:mission.objectiveTarget}
 progress[missionId]=next
 localStorage.setItem(STUBBS_FAMILY_MISSION_PROGRESS_KEY,JSON.stringify(progress))
 return next
}
export function markStubbsFamilyMissionComplete(missionId:string,context:{cityId:string;neighborhoodId:string}){
 const result=finishStubbsFamilyMission(missionId,context)
 if(!result)return
 const progress=readStubbsFamilyMissionProgress()
 progress[missionId]={missionId,status:'complete',startedAt:progress[missionId]?.startedAt||new Date().toISOString(),completedAt:new Date().toISOString(),objectiveCount:progress[missionId]?.objectiveTarget||result.mission.objectiveTarget,objectiveTarget:progress[missionId]?.objectiveTarget||result.mission.objectiveTarget}
 localStorage.setItem(STUBBS_FAMILY_MISSION_PROGRESS_KEY,JSON.stringify(progress))
 return {...result,progress:progress[missionId]}
}

export function advanceStubbsFamilyMissionObjective(missionId:string,amount=1){
 const mission=STUBBS_FAMILY_MISSIONS.find(m=>m.id===missionId)
 if(!mission)return
 const progress=readStubbsFamilyMissionProgress(),current=progress[missionId]
 if(!current||current.status!=='active')return current
 const objectiveCount=Math.min(current.objectiveTarget,current.objectiveCount+Math.max(0,amount))
 const next={...current,objectiveCount}
 progress[missionId]=next
 localStorage.setItem(STUBBS_FAMILY_MISSION_PROGRESS_KEY,JSON.stringify(progress))
 return {...next,readyToComplete:objectiveCount>=current.objectiveTarget}
}
