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
 {id:'stubbs-benny-omni-guide',characterId:'benny',title:'Omni Guide',objective:'Guide a player from the family district into a connected TRYAMM experience.',action:'host-creator-event',milestone:'omni-guide',minMeetings:1},
 {id:'stubbs-simone-postal-route',characterId:'simone-j',title:'Family Postal Route',objective:'Complete a neighborhood mail and package route connecting homes and businesses.',action:'complete-delivery',milestone:'postal-connector',minMeetings:1},
 {id:'stubbs-alb-block-purpose',characterId:'al-b',title:'Purpose on the Block',objective:'Complete a neighborhood business-building mission.',action:'open-business',milestone:'block-builder',minMeetings:1},
 {id:'stubbs-asia-holo-explorer',characterId:'asia-watson',title:'Explore the Holo Lane',objective:'Host a creator event connecting the family district to HoloVerse.',action:'host-creator-event',milestone:'holo-explorer',minMeetings:1},
 {id:'stubbs-deon-game-run',characterId:'deon-ham',title:'Family Game Run',objective:'Complete a neighborhood delivery challenge through GameVerse.',action:'complete-delivery',milestone:'game-runner',minMeetings:1},
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
