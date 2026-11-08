import {getSupabaseClient} from './supabaseClient'
import {parseVault,type SiteVault} from '../runtime/AIWebsiteRecoveryVault'

export const CLOUD_SITE_TABLE='tryamm_site_recovery_snapshots'
export type CloudSiteSnapshot={id:string;reason:string;created_at:string}
export type CloudSession={userId:string}
const MAX_BACKUP_BYTES=512000

export async function getCloudSiteSession():Promise<CloudSession|null>{
 const db=getSupabaseClient()
 if(!db)return null
 const {data,error}=await db.auth.getUser()
 if(error||!data.user)return null
 return {userId:data.user.id}
}
export async function listSiteBackups(userId:string):Promise<CloudSiteSnapshot[]>{
 const db=getSupabaseClient()
 if(!db)throw new Error('cloud_unconfigured')
 const {data,error}=await db.from(CLOUD_SITE_TABLE).select('id,reason,created_at')
  .eq('owner_id',userId).order('created_at',{ascending:false}).limit(25)
 if(error)throw new Error('cloud_history_unavailable')
 return (data||[]).map(x=>({id:String(x.id),reason:String(x.reason),created_at:String(x.created_at)}))
}
export async function readSiteBackup(userId:string,id:string):Promise<SiteVault>{
 const db=getSupabaseClient()
 if(!db||!/^[a-f0-9-]{36}$/i.test(id))throw new Error('invalid_cloud_backup_id')
 const {data,error}=await db.from(CLOUD_SITE_TABLE).select('payload').eq('owner_id',userId).eq('id',id).single()
 if(error||!data)throw new Error('cloud_backup_unavailable')
 return parseVault(data.payload)
}
export async function latestSiteBackup(userId:string):Promise<{vault:SiteVault;id:string;createdAt:string}|null>{
 const db=getSupabaseClient()
 if(!db)throw new Error('cloud_unconfigured')
 const {data,error}=await db.from(CLOUD_SITE_TABLE).select('id,payload,created_at')
  .eq('owner_id',userId).order('created_at',{ascending:false}).limit(1)
 if(error)throw new Error('cloud_latest_unavailable')
 if(!data?.length)return null
 return {id:String(data[0].id),createdAt:String(data[0].created_at),vault:parseVault(data[0].payload)}
}
export async function saveSiteBackup(userId:string,vault:SiteVault,reason:string):Promise<void>{
 const db=getSupabaseClient()
 if(!db)throw new Error('cloud_unconfigured')
 const verified=parseVault(vault)
 const size=new TextEncoder().encode(JSON.stringify(verified)).byteLength
 if(size>MAX_BACKUP_BYTES)throw new Error('cloud_backup_too_large')
 const {error}=await db.from(CLOUD_SITE_TABLE).insert({
  owner_id:userId,reason:reason.slice(0,80),payload:verified
 })
 if(error)throw new Error('cloud_backup_write_failed')
}
