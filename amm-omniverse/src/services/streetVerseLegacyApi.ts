import { getAccessToken } from './supabaseClient'
const API=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||''
export type LegacySceneStatus='draft'|'rights-review'|'original-ready'|'licensed-ready'
export type LegacySceneRecord={id:string;characterId:string;status:LegacySceneStatus;summary:string;rightsProofId?:string;memoryTags:string[];updatedAt:string}
async function parse<T>(response:Response,fallback:string):Promise<T>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.error||fallback);return data as T}
async function publicRequest<T>(path:string,init:RequestInit={}):Promise<T>{const headers=new Headers(init.headers||{});headers.set('Content-Type','application/json');return parse<T>(await fetch(`${API}${path}`,{...init,headers}),'StreetVerse public API request failed')}
async function authed<T>(path:string,init:RequestInit={}):Promise<T>{const token=await getAccessToken();if(!token)throw new Error('Authentication required');const headers=new Headers(init.headers||{});headers.set('Authorization',`Bearer ${token}`);headers.set('Content-Type','application/json');return parse<T>(await fetch(`${API}${path}`,{...init,headers}),'Legacy API request failed')}
export const STREETVERSE_LEGACY_API={scene:'/api/streetverse/legacy/scene',memory:'/api/streetverse/legacy/memory',evidence:'/api/streetverse/legacy/evidence',rights:'/api/streetverse/legacy/rights',eve:'/api/streetverse/legacy/eve-directive',assets:'/api/streetverse/legacy/assets',smoke:'/api/streetverse/legacy/smoke'} as const
export const saveLegacyScene=(input:Omit<LegacySceneRecord,'updatedAt'>)=>authed<{scene:LegacySceneRecord}>(STREETVERSE_LEGACY_API.scene,{method:'POST',body:JSON.stringify(input)})
export const saveLegacyMemory=(input:{characterId:string;summary:string;tags:string[]})=>authed<{ok:true;memoryId:string}>(STREETVERSE_LEGACY_API.memory,{method:'POST',body:JSON.stringify(input)})
export const submitLegacyEvidence=(input:{memoryKey:string;evidenceType:string;storagePath?:string;externalReference?:string;note?:string})=>authed<{ok:true;evidence:{id:string;verification_state:string}}>(STREETVERSE_LEGACY_API.evidence,{method:'POST',body:JSON.stringify(input)})
export const getLegacyRightsStatus=(sceneId:string)=>authed<{sceneId:string;status:LegacySceneStatus;rightsProofId?:string}>(`${STREETVERSE_LEGACY_API.rights}?sceneId=${encodeURIComponent(sceneId)}`)
export const requestEveLegacyDirective=(input:Record<string,unknown>)=>publicRequest<{directive:Record<string,unknown>}>(STREETVERSE_LEGACY_API.eve,{method:'POST',body:JSON.stringify(input)})
export const getLegacyReusableAssets=()=>publicRequest<{version:string;runtime:string;assets:string[];rightsDefault:string}>(STREETVERSE_LEGACY_API.assets)
export const runLegacyBackendSmoke=()=>publicRequest<{ok:boolean;checks:Record<string,boolean>}>(STREETVERSE_LEGACY_API.smoke)
