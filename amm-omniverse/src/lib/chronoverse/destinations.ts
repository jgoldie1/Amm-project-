import { CHRONOVERSE_ERAS } from './timeline'
import { ATLANTIC_BLACK_HISTORY_MISSIONS } from './atlanticHistory'

export type ChronoMode='learn'|'live'|'mission'
export type CommunicationMode='learn'|'translate'|'immersion'

export type ChronoDestination={
 id:string
 eraId:string
 title:string
 modes:ChronoMode[]
 communication:CommunicationMode[]
 evidencePanel:boolean
 observerLock:boolean
 missionIds:string[]
 legacyPassport:{xp:number;badge:string}
 preload:{profile:'light'|'balanced'|'immersive';fallback:'checkpoint'}
}

const missionsByEra=(era:string)=>ATLANTIC_BLACK_HISTORY_MISSIONS.filter(m=>m.era===era).map(m=>m.id)

export const CHRONO_DESTINATIONS:ChronoDestination[]=CHRONOVERSE_ERAS.map((era,index)=>({
 id:`chrono-${era.id}`,
 eraId:era.id,
 title:era.title,
 modes:[...era.modes],
 communication:['learn','translate','immersion'],
 evidencePanel:true,
 observerLock:era.safety==='observer-lock',
 missionIds:
  era.id==='slavery'?['africa-before-captivity','transatlantic-slave-trade']:
  era.id==='reconstruction'?['freedom-reconstruction']:
  era.id==='civil-rights'?['civil-rights']:
  era.id==='future'?['newmerica']:
  era.id==='ancient'?['mali-atlantic-expedition','indigenous-americas','pre-columbian-contact-lab','1492-language-mystery']:
  missionsByEra(era.range),
 legacyPassport:{xp:100+(index*25),badge:`CHRONO_${era.id.toUpperCase().replace(/-/g,'_')}`},
 preload:{profile:era.id==='dinosaurs'||era.id==='slavery'?'immersive':'balanced',fallback:'checkpoint'}
}))

export const getChronoDestination=(id:string)=>CHRONO_DESTINATIONS.find(d=>d.id===id)

export type ChronoMissionSession={
 destinationId:string
 mode:ChronoMode
 communication:CommunicationMode
 evidenceAcknowledged:boolean
 startedAt:string
 completedObjectives:string[]
 knowledgeCheckPassed:boolean
 xpAwarded:number
 legacyBadge?:string
}

export const canCompleteChronoMission=(session:ChronoMissionSession)=>
 session.mode==='mission'&&
 session.evidenceAcknowledged&&
 session.completedObjectives.length>0&&
 session.knowledgeCheckPassed

export const completeChronoMission=(session:ChronoMissionSession)=>{
 if(!canCompleteChronoMission(session)) return {...session,xpAwarded:0}
 const destination=getChronoDestination(session.destinationId)
 if(!destination) return {...session,xpAwarded:0}
 return {...session,xpAwarded:destination.legacyPassport.xp,legacyBadge:destination.legacyPassport.badge}
}
