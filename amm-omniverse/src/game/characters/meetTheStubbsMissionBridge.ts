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
}
export const STUBBS_FAMILY_MISSIONS:StubbsFamilyMission[]=[
 {id:'stubbs-bj-street-builder',characterId:'bj-stubbs',title:'Build Your Lane',objective:'Complete a neighborhood delivery and return to BJ.',action:'complete-delivery',milestone:'street-builder',minMeetings:1},
 {id:'stubbs-kenosha-legacy',characterId:'kenosha',title:'Legacy Walk',objective:'Complete a family-history route through the district.',action:'host-creator-event',milestone:'legacy-keeper',minMeetings:1},
 {id:'stubbs-raymond-route',characterId:'raymond-jarreau',title:'Another Route',objective:'Complete a transit route that connects the family district.',action:'complete-transit-mission',milestone:'route-finder',minMeetings:1},
 {id:'stubbs-shawndell-creator',characterId:'shawndell-shelton',title:'Creator Family',objective:'Host a creator event in the district.',action:'host-creator-event',milestone:'family-creator',minMeetings:1},
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
