export type StubbsRelationshipMemory={
 characterId:string
 metCount:number
 relationshipXp:number
 lastMetAt:string
 lastDialogue?:string
 missionIds:string[]
 milestones:string[]
}
export type StubbsRelationshipLedger=Record<string,StubbsRelationshipMemory>
export const STUBBS_RELATIONSHIP_MEMORY_KEY='tryamm:stubbs-family.relationships.v1'
export function readStubbsRelationshipLedger():StubbsRelationshipLedger{
 if(typeof localStorage==='undefined')return {}
 try{return JSON.parse(localStorage.getItem(STUBBS_RELATIONSHIP_MEMORY_KEY)||'{}')}catch{return {}}
}
export function rememberStubbsInteraction(characterId:string,dialogue?:string){
 const ledger=readStubbsRelationshipLedger(),prev=ledger[characterId]
 const next:StubbsRelationshipMemory={
  characterId,
  metCount:(prev?.metCount||0)+1,
  relationshipXp:(prev?.relationshipXp||0)+1,
  lastMetAt:new Date().toISOString(),
  lastDialogue:dialogue||prev?.lastDialogue,
  missionIds:prev?.missionIds||[],
  milestones:prev?.milestones||[],
 }
 ledger[characterId]=next
 localStorage.setItem(STUBBS_RELATIONSHIP_MEMORY_KEY,JSON.stringify(ledger))
 return next
}
export function rememberStubbsMission(characterId:string,missionId:string,milestone?:string){
 const ledger=readStubbsRelationshipLedger(),prev=ledger[characterId]
 const missionIds=Array.from(new Set([...(prev?.missionIds||[]),missionId]))
 const milestones=milestone?Array.from(new Set([...(prev?.milestones||[]),milestone])):(prev?.milestones||[])
 const next:StubbsRelationshipMemory={
  characterId,metCount:prev?.metCount||0,relationshipXp:(prev?.relationshipXp||0)+5,
  lastMetAt:prev?.lastMetAt||new Date().toISOString(),lastDialogue:prev?.lastDialogue,missionIds,milestones,
 }
 ledger[characterId]=next
 localStorage.setItem(STUBBS_RELATIONSHIP_MEMORY_KEY,JSON.stringify(ledger))
 return next
}

export type StubbsFamilyHistoryEvent={
 id:string
 characterId:string
 kind:'met'|'mission-complete'|'milestone'
 occurredAt:string
 missionId?:string
 milestone?:string
 cityId?:string
 neighborhoodId?:string
}
export const STUBBS_FAMILY_HISTORY_KEY='tryamm:stubbs-family.history.v1'
export function readStubbsFamilyHistory():StubbsFamilyHistoryEvent[]{
 if(typeof localStorage==='undefined')return []
 try{return JSON.parse(localStorage.getItem(STUBBS_FAMILY_HISTORY_KEY)||'[]')}catch{return []}
}
export function appendStubbsFamilyHistory(event:Omit<StubbsFamilyHistoryEvent,'id'|'occurredAt'>){
 const history=readStubbsFamilyHistory()
 const entry:StubbsFamilyHistoryEvent={...event,id:`${event.kind}:${event.characterId}:${Date.now()}`,occurredAt:new Date().toISOString()}
 const next=[...history,entry].slice(-250)
 localStorage.setItem(STUBBS_FAMILY_HISTORY_KEY,JSON.stringify(next))
 return entry
}
export function completeStubbsCharacterMission(characterId:string,missionId:string,options?:{milestone?:string;cityId?:string;neighborhoodId?:string}){
 const memory=rememberStubbsMission(characterId,missionId,options?.milestone)
 const history=appendStubbsFamilyHistory({characterId,kind:'mission-complete',missionId,milestone:options?.milestone,cityId:options?.cityId,neighborhoodId:options?.neighborhoodId})
 return {memory,history}
}
