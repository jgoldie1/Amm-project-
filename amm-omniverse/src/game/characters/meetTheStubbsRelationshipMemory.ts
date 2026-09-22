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
