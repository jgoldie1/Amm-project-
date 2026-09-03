import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { OmniProject, OmniWorkstationState } from './OmniWorkstationRuntime'

type CloudStatus='disabled'|'signed-out'|'ready'|'syncing'|'error'
export type OmniGlobalPreferences={
  preferred_language:string
  auto_translate:boolean
  translation_languages:string[]
  accessibility_passport_enabled:boolean
  captions_enabled:boolean
  reduced_motion:boolean
  high_contrast:boolean
  screen_reader_optimized:boolean
  voice_control_enabled:boolean
  large_touch_targets:boolean
  default_share_targets:string[]
}

const url=import.meta.env.VITE_SUPABASE_URL as string|undefined
const key=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY) as string|undefined
const client:SupabaseClient|null=url&&key?createClient(url,key):null

const now=()=>new Date().toISOString()
const emit=(status:CloudStatus,detail:Record<string,unknown>={})=>window.dispatchEvent(new CustomEvent('tryamm:workstation:cloud',{detail:{status,...detail}}))

async function user(){if(!client)return null;const {data}=await client.auth.getUser();return data.user||null}
async function workspace(ownerId:string){
  if(!client)return null
  const found=await client.from('omni_workspaces').select('*').eq('owner_id',ownerId).order('created_at',{ascending:true}).limit(1).maybeSingle()
  if(found.data)return found.data
  const created=await client.from('omni_workspaces').insert({owner_id:ownerId,name:'My Omni Workstation'}).select('*').single()
  if(created.error)throw created.error
  return created.data
}
async function device(ownerId:string,state:OmniWorkstationState){
  if(!client)return null
  const existing=await client.from('omni_devices').select('*').eq('user_id',ownerId).eq('device_public_id',state.deviceId).maybeSingle()
  if(existing.data){await client.from('omni_devices').update({device_name:state.deviceLabel,last_seen_at:now()}).eq('id',existing.data.id);return existing.data}
  const inserted=await client.from('omni_devices').insert({user_id:ownerId,device_type:'workstation-client',device_name:state.deviceLabel,device_public_id:state.deviceId,capabilities:{offline_cache:true,web:true}}).select('*').single()
  if(inserted.error)throw inserted.error
  return inserted.data
}

export const omniWorkstationCloud={
  isConfigured:()=>Boolean(client),
  async status():Promise<CloudStatus>{if(!client)return'disabled';return(await user())?'ready':'signed-out'},
  async sync(state:OmniWorkstationState){
    if(!client){emit('disabled');return {status:'disabled' as CloudStatus,state}}
    const account=await user();if(!account){emit('signed-out');return {status:'signed-out' as CloudStatus,state}}
    emit('syncing')
    try{
      const ws=await workspace(account.id);const dev=await device(account.id,state);if(!ws)throw new Error('workspace_unavailable')
      const cloud=await client.from('omni_workstation_projects').select('*').eq('workspace_id',ws.id).order('updated_at',{ascending:false})
      if(cloud.error)throw cloud.error
      const byClient=new Map<string,any>((cloud.data||[]).map(row=>[String(row.state?.client_id||''),row]))
      for(const project of state.projects){
        const existing=byClient.get(project.id)
        const payload={workspace_id:ws.id,owner_id:account.id,title:project.name,project_type:project.workflow||'general',state:{client_id:project.id,renderTarget:project.renderTarget,assets:project.assets,workflow:project.workflow},last_device_id:dev?.id||null,last_synced_at:now(),updated_at:project.updatedAt}
        if(existing){const res=await client.from('omni_workstation_projects').update({...payload,revision:Number(existing.revision||1)+1}).eq('id',existing.id);if(res.error)throw res.error}
        else{const res=await client.from('omni_workstation_projects').insert(payload).select('id').single();if(res.error)throw res.error}
      }
      const refreshed=await client.from('omni_workstation_projects').select('*').eq('workspace_id',ws.id).order('updated_at',{ascending:false})
      if(refreshed.error)throw refreshed.error
      const merged=new Map(state.projects.map(p=>[p.id,p]))
      for(const row of refreshed.data||[]){const clientId=String(row.state?.client_id||row.id);if(!merged.has(clientId)){const p:OmniProject={id:clientId,name:row.title,createdAt:row.created_at,updatedAt:row.updated_at,renderTarget:row.state?.renderTarget||'cloud',assets:Array.isArray(row.state?.assets)?row.state.assets:[],workflow:row.state?.workflow};merged.set(clientId,p)}}
      const next={...state,projects:Array.from(merged.values()).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
      emit('ready',{syncedAt:now(),projectCount:next.projects.length})
      return {status:'ready' as CloudStatus,state:next}
    }catch(error){emit('error',{message:error instanceof Error?error.message:'sync_failed'});return {status:'error' as CloudStatus,state}}
  },
  async getPreferences():Promise<OmniGlobalPreferences|null>{if(!client)return null;const account=await user();if(!account)return null;const {data}=await client.from('omni_global_preferences').select('*').eq('user_id',account.id).maybeSingle();return data as OmniGlobalPreferences|null},
  async savePreferences(preferences:Partial<OmniGlobalPreferences>){if(!client)return false;const account=await user();if(!account)return false;const {error}=await client.from('omni_global_preferences').upsert({user_id:account.id,...preferences,updated_at:now()},{onConflict:'user_id'});return !error},
  async uploadOmniBox(file:File){if(!client)throw new Error('cloud_not_configured');const account=await user();if(!account)throw new Error('sign_in_required');const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,'-');const path=`${account.id}/omni-box/${Date.now()}-${safe}`;const result=await client.storage.from('creator-media').upload(path,file,{upsert:false});if(result.error)throw result.error;return {bucket:'creator-media',path}},
}
