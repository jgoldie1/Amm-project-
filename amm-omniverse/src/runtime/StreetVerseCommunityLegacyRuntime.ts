/** StreetVerse Community Legacy: fictional, local-only civic world changes.
 * No payments, grants, donations, real property rights, or external services.
 */
export const STREETVERSE_LEGACY_SAVE_KEY='tryamm.streetverse.community-legacy.v1'
export const STREETVERSE_LEGACY_UPDATED='tryamm:streetverse-community-legacy-updated'

export const STREETVERSE_LEGACY_PROJECTS=[
 {id:'access-ramp',label:'Circle Park Accessible Ramp',detail:'Build a visible accessible entry ramp.',cost:1},
 {id:'community-garden',label:'Community Food Garden',detail:'Add raised beds and neighborhood greenery.',cost:1},
 {id:'solar-wayfinding',label:'Solar Wayfinding Lights',detail:'Install a visible solar-lit neighborhood pathway.',cost:1},
] as const

export type StreetVerseLegacyProjectId=typeof STREETVERSE_LEGACY_PROJECTS[number]['id']
export type StreetVerseCommunityLegacyState={
 version:1
 points:number
 built:StreetVerseLegacyProjectId[]
 rewardedMissionIds:string[]
}
const ALL_IDS=STREETVERSE_LEGACY_PROJECTS.map(project=>project.id)
const MAX_REWARDED_MISSIONS=64
const MAX_POINTS=10

export function initialStreetVerseCommunityLegacy():StreetVerseCommunityLegacyState{
 // One fictional welcome point lets a new RP player build a visible improvement.
 return {version:1,points:1,built:[],rewardedMissionIds:[]}
}

export function readStreetVerseCommunityLegacy(raw:string|null):StreetVerseCommunityLegacyState{
 const fallback=initialStreetVerseCommunityLegacy()
 if(!raw||raw.length>12000)return fallback
 try{
  const data:unknown=JSON.parse(raw)
  if(!data||typeof data!=='object')return fallback
  const input=data as Record<string,unknown>
  if(input.version!==1||!Number.isSafeInteger(input.points)||Number(input.points)<0||Number(input.points)>MAX_POINTS)return fallback
  if(!Array.isArray(input.built)||input.built.length>ALL_IDS.length||input.built.some(x=>!ALL_IDS.includes(x as StreetVerseLegacyProjectId))||new Set(input.built).size!==input.built.length)return fallback
  if(!Array.isArray(input.rewardedMissionIds)||input.rewardedMissionIds.length>MAX_REWARDED_MISSIONS||new Set(input.rewardedMissionIds).size!==input.rewardedMissionIds.length||input.rewardedMissionIds.some(x=>typeof x!=='string'||!/^[-a-zA-Z0-9_:]{1,96}$/.test(x)))return fallback
  return {version:1,points:Number(input.points),built:[...input.built] as StreetVerseLegacyProjectId[],rewardedMissionIds:[...input.rewardedMissionIds] as string[]}
 }catch{return fallback}
}

export const serializeStreetVerseCommunityLegacy=(state:StreetVerseCommunityLegacyState)=>JSON.stringify(state)

export function buildStreetVerseLegacyProject(state:StreetVerseCommunityLegacyState,id:StreetVerseLegacyProjectId){
 const project=STREETVERSE_LEGACY_PROJECTS.find(item=>item.id===id)
 if(!project)return {ok:false,state,message:'Unknown community improvement.'}
 if(state.built.includes(id))return {ok:false,state,message:project.label+' is already built.'}
 if(state.points<project.cost)return {ok:false,state,message:'Complete a verified StreetVerse mission to earn another fictional Legacy Point.'}
 return {ok:true,state:{...state,points:state.points-project.cost,built:[...state.built,id]},message:project.label+' is now visible in your Chicago world.'}
}

/** Reward exactly one fictional point per verified in-game mission identity.
 * Replaying the same Chicago delivery does not produce additional points.
 */
export function awardStreetVerseLegacyMission(state:StreetVerseCommunityLegacyState,missionId:string){
 if(!/^[-a-zA-Z0-9_:]{1,96}$/.test(missionId)||state.rewardedMissionIds.includes(missionId)||state.rewardedMissionIds.length>=MAX_REWARDED_MISSIONS)return {ok:false,state}
 return {ok:true,state:{...state,points:Math.min(MAX_POINTS,state.points+1),rewardedMissionIds:[...state.rewardedMissionIds,missionId]}}
}
