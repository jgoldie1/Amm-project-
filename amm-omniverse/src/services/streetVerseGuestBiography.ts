import type { BiographyInput } from './streetVerseLifeApi'
import { saveBiography } from './streetVerseLifeApi'
import { getAccessToken } from './supabaseClient'

const KEY='tryamm.streetverse.biography.pending.v1'

export type PendingBiographyDraft={
  id:string
  input:BiographyInput
  createdAt:string
  syncState:'local-only'|'syncing'|'synced'|'failed'
  error?:string
}

function read():PendingBiographyDraft[]{
  try{return JSON.parse(localStorage.getItem(KEY)||'[]') as PendingBiographyDraft[]}catch{return []}
}
function write(items:PendingBiographyDraft[]){localStorage.setItem(KEY,JSON.stringify(items.slice(-50)))}

export function queueGuestBiography(input:BiographyInput):PendingBiographyDraft{
  const draft:PendingBiographyDraft={id:`draft-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,input,createdAt:new Date().toISOString(),syncState:'local-only'}
  write([...read(),draft]);return draft
}

export function listGuestBiographyDrafts(){return read()}

export async function syncGuestBiographyDrafts(){
  const token=await getAccessToken();if(!token)return {ok:false,reason:'Authentication required',synced:0,remaining:read().length}
  const items=read();let synced=0;const next:PendingBiographyDraft[]=[]
  for(const item of items){
    try{await saveBiography(item.input);synced++}
    catch(error){next.push({...item,syncState:'failed',error:error instanceof Error?error.message:'sync failed'})}
  }
  write(next);return {ok:true,synced,remaining:next.length}
}

export function clearSyncedGuestBiographyDrafts(){write(read().filter(x=>x.syncState!=='synced'))}
