import { getAccessToken } from './supabaseClient'

const API=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||''
export const STREETVERSE_LIFE_API={
  smoke:'/api/streetverse/life/smoke',
  biography:'/api/streetverse/life/biography-save',
  returnWorld:'/api/streetverse/life/return-world',
  archive:'/api/streetverse/life/archive-progress',
  creator:'/api/streetverse/life/creator-work',
  mission:'/api/streetverse/life/mission-state',
  rejoin:'/api/streetverse/life/rejoin',
} as const

async function parse<T>(response:Response,fallback:string):Promise<T>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.error||fallback);return data as T}
async function request<T>(path:string,init:RequestInit={},requiresAuth=true):Promise<T>{const headers=new Headers(init.headers||{});headers.set('Content-Type','application/json');if(requiresAuth){const token=await getAccessToken();if(!token)throw new Error('Authentication required');headers.set('Authorization',`Bearer ${token}`)}return parse<T>(await fetch(`${API}${path}`,{...init,headers}),'StreetVerse life API request failed')}

export type BiographyInput={characterId:string;chapter:string;regionId:string;state:Record<string,unknown>;legacyScore:number}
export type WorldChange={entity_id:string;entity_kind:string;before_state:string;after_state:string;reason:string;importance:number}
export type RejoinState={ok:true;biography:any|null;changes:any[];missions:any[];works:any[];missionRuns:any[]}

export const runStreetVerseLifeSmoke=()=>request<{ok:boolean;checks:Record<string,boolean>}>(STREETVERSE_LIFE_API.smoke,{},false)
export const saveBiography=(input:BiographyInput)=>request<{ok:true;snapshot:any}>(STREETVERSE_LIFE_API.biography,{method:'POST',body:JSON.stringify(input)})
export const simulateReturn=(input:{characterId:string;regionId:string})=>request<{ok:true;daysAway:number;changes:WorldChange[];previousChapter:string|null;previousLegacyScore:number}>(STREETVERSE_LIFE_API.returnWorld,{method:'POST',body:JSON.stringify(input)})
export const saveArchiveProgress=(input:{characterId:string;missionId:string;status:'discovered'|'researching'|'solved'|'created'|'preserved';sourceUrl?:string;evidenceClass:'archive-fact'|'interpretation'|'family-memory'|'community-lead'|'rights-cleared';resultSummary?:string})=>request<{ok:true;progress:any}>(STREETVERSE_LIFE_API.archive,{method:'POST',body:JSON.stringify(input)})
export const saveCreatorWork=(input:{characterId:string;title:string;workType:'music'|'visual-art'|'video'|'writing'|'performance'|'interactive-art'|'business-concept'|'other';rightsStatus?:'original-claimed'|'collaborator-review'|'rights-review'|'rights-cleared';provenance?:Record<string,unknown>;collaboratorSplits?:unknown[];sourceMissionId?:string})=>request<{ok:true;work:any}>(STREETVERSE_LIFE_API.creator,{method:'POST',body:JSON.stringify(input)})
export const saveMissionState=(input:{characterId:string;missionId:string;beatId:string;status:'active'|'complete'|'failed'|'paused';choice?:Record<string,unknown>;runtimeState?:Record<string,unknown>})=>request<{ok:true;mission:any}>(STREETVERSE_LIFE_API.mission,{method:'POST',body:JSON.stringify(input)})
export const loadRejoinState=(characterId:string)=>request<RejoinState>(`${STREETVERSE_LIFE_API.rejoin}?characterId=${encodeURIComponent(characterId)}`)
