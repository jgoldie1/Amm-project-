/**
 * Omni LIVE / AI League design contracts.
 * Non-monetary test-only rankings. No third-party gift ingestion or broadcast claims.
 */
export type BattleMode='solo'|'duo'|'team'|'rp-mission'|'talent-show'
export type LeagueTier='rookie'|'rising'|'pro'|'legend'
export type VerifiedActivity={creatorId:string;kind:'completed-stream'|'moderated-audition'|'mission'|'talent-vote';id:string;points:number;verified:boolean}
export type CreatorUnlock={id:string;level:number;name:string;category:'sound'|'overlay'|'stage'|'battle'|'ai'}
export const CREATOR_UNLOCKS:readonly CreatorUnlock[]=[
 {id:'basic-sfx',level:1,name:'Basic sound effects',category:'sound'},
 {id:'accessible-soundboard',level:1,name:'One-tap accessible soundboard',category:'sound'},
 {id:'standard-live-match',level:1,name:'Standard LIVE matches',category:'battle'},
 {id:'custom-soundboard',level:2,name:'Custom licensed soundboard',category:'sound'},
 {id:'team-battle',level:2,name:'Team PK room',category:'battle'},
 {id:'holographic-stage',level:3,name:'Holographic stage overlay',category:'stage'},
 {id:'ai-cohost',level:3,name:'AI cohost assistant',category:'ai'},
 {id:'legendary-visuals',level:4,name:'Legendary original visual effects',category:'overlay'},
]
export const LEVEL_THRESHOLDS=[0,200,800,2500] as const
export function creatorLevel(points:number):1|2|3|4{
 const p=Number.isFinite(points)?Math.max(0,points):0
 return p>=LEVEL_THRESHOLDS[3]?4:p>=LEVEL_THRESHOLDS[2]?3:p>=LEVEL_THRESHOLDS[1]?2:1
}
export function previewCreatorPoints(activity:readonly VerifiedActivity[],creatorId:string):number{
 const seen=new Set<string>()
 let total=0
 for(const row of activity){
  if(row.creatorId!==creatorId||!row.verified||seen.has(row.id))continue
  seen.add(row.id)
  total+=Math.max(0,Math.min(100,Math.floor(Number(row.points)||0)))
 }
 return total
}
export function creatorUnlocks(level:1|2|3|4){return CREATOR_UNLOCKS.filter(u=>u.level<=level)}
export type BattleScore={creatorId:string;talentVotes:number;missionPoints:number;engagementPoints:number;paidGiftPoints:number}
/** Paid gifting does not influence this gameplay battle outcome. */
export function fairBattleScore(score:BattleScore){
 return Math.max(0,Math.floor(score.talentVotes))*3+Math.max(0,Math.floor(score.missionPoints))*2+Math.max(0,Math.floor(score.engagementPoints))
}
