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
const SOCIAL_CREATOR_STARTER_MISSIONS:StubbsFamilyMission[]=Array.from({length:10},(_,index)=>{
 const slot=String(index+1).padStart(2,'0')
 return {id:`stubbs-social-creator-${slot}-first-live`,characterId:`social-creator-${slot}`,title:`Creator Slot ${slot}: First Live`,objective:'Meet the creator, complete one creator activity, and capture a Reel or LIVE moment.',action:'host-creator-event',milestone:`social-creator-${slot}-introduced`,minMeetings:1,objectiveTarget:3}
})
export const STUBBS_FAMILY_MISSIONS:StubbsFamilyMission[]=[
 {id:'stubbs-benny-omni-guide',characterId:'benny',title:'Omni Guide',objective:'Guide a player from the family district into a connected TRYAMM experience.',action:'host-creator-event',milestone:'omni-guide',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-simone-postal-route',characterId:'simone-johnson',title:'Family Postal Route',objective:'Complete a neighborhood mail and package route connecting homes and businesses.',action:'complete-delivery',milestone:'postal-connector',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-alb-block-purpose',characterId:'al-b',title:'Purpose on the Block',objective:'Complete a neighborhood business-building mission.',action:'open-business',milestone:'block-builder',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-asia-holo-explorer',characterId:'asia-watson',title:'Explore the Holo Lane',objective:'Host a creator event connecting the family district to HoloVerse.',action:'host-creator-event',milestone:'holo-explorer',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-deon-game-run',characterId:'deon-ham',title:'Family Game Run',objective:'Complete a neighborhood delivery challenge through GameVerse.',action:'complete-delivery',milestone:'game-runner',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-bj-street-builder',characterId:'bj-stubbs',title:'Build Your Lane',objective:'Complete a neighborhood delivery and return to BJ.',action:'complete-delivery',milestone:'street-builder',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-kenosha-legacy',characterId:'kenosha-pennifor',title:'Legacy Walk',objective:'Complete a family-history route through the district.',action:'host-creator-event',milestone:'legacy-keeper',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-raymond-route',characterId:'raymond-jarreau',title:'Another Route',objective:'Complete a transit route that connects the family district.',action:'complete-transit-mission',milestone:'route-finder',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-shawndell-creator',characterId:'shawndell-shelton',title:'Creator Family',objective:'Host a creator event in the district.',action:'host-creator-event',milestone:'family-creator',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-marcus-city-intro',characterId:'marcus',title:'Marcus: Show Me the City',objective:'Meet Marcus, travel to a marked StreetVerse stop, and return with the route unlocked.',action:'complete-transit-mission',milestone:'marcus-city-intro',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-tatti-creator-intro',characterId:'tatti',title:'Tatti: Creator Introduction',objective:'Complete a creator activity and capture the moment for Reels or LIVE.',action:'host-creator-event',milestone:'tatti-creator-intro',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-brielle-creator-intro',characterId:'brielle',title:'Brielle: Creator Introduction',objective:'Complete a creator activity and capture the moment for Reels or LIVE.',action:'host-creator-event',milestone:'brielle-creator-intro',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-mike-city-intro',characterId:'mike',title:'Mike: Neighborhood Link',objective:'Meet Mike and complete a neighborhood connection mission.',action:'complete-delivery',milestone:'mike-neighborhood-link',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-alphonso-city-intro',characterId:'alphonso',title:'Alphonso: Neighborhood Link',objective:'Meet Alphonso and complete a neighborhood connection mission.',action:'complete-delivery',milestone:'alphonso-neighborhood-link',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-jasmine-creator-intro',characterId:'jasmine',title:'Jasmine: Creator Introduction',objective:'Complete a creator showcase and capture a Reel or LIVE moment.',action:'host-creator-event',milestone:'jasmine-creator-intro',minMeetings:1,objectiveTarget:3},
 {id:'stubbs-tae-monroe-creator-intro',characterId:'tae-monroe',title:'Tae Monroe: Creator Introduction',objective:'Complete a creator showcase and connect it to BIGO, TikTok, Reels or LIVE.',action:'host-creator-event',milestone:'tae-monroe-creator-intro',minMeetings:1,objectiveTarget:3},
 ...SOCIAL_CREATOR_STARTER_MISSIONS,
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
