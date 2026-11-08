import {getSupabaseClient} from '../services/supabaseClient'
import {getCloudSiteSession,latestSiteBackup,listSiteBackups,readSiteBackup,saveSiteBackup,type CloudSiteSnapshot} from '../services/aiWebsiteCloudRecovery'
import {SITE_VAULT_SCHEMA,emptyVault,parseVault,createSite,changeSite,applyChildTheme,softDeleteSite,
 restoreFromTrash,restoreVersion,mergeImportedVault,sanitizeSite,type ThemePreset,type SiteVault,type BusinessSite} from './AIWebsiteRecoveryVault'

export type {BusinessSite} from './AIWebsiteRecoveryVault'
const LOCAL_KEY='tryamm_ai_site_builder_v2_'
const LEGACY_KEY='tryamm_ai_site_builder_v1'
const BROWSER_BACKUP_KEY='tryamm_ai_site_builder_recovery_last_good'
const ownershipPolicy={
 subscription:'Hosted while plan is active',
 buyout:'Customer purchases a transferable site package subject to third-party licenses',
 exported:'Customer receives exportable project/source package'
}
let installed=false
type Status='browser-only'|'connecting'|'cloud-saved'|'offline-pending'|'cloud-unavailable'|'recovery-available'
let cloudStatus:Status='browser-only'
let message='Sign in to save drafts privately in the cloud.'
let vault:SiteVault=emptyVault()
let ownerId:string|null=null
let busy=false
let syncQueue=Promise.resolve()
let backups:CloudSiteSnapshot[]=[]
let hydrated=false
const detail=(e:Event):Record<string,any>=>((e as CustomEvent<any>).detail||{}) as Record<string,any>
const keyFor=(id:string|null)=>LOCAL_KEY+(id||'guest')
const copy=(x:SiteVault):SiteVault=>parseVault(JSON.stringify(x))
function validLocal(key:string):{vault:SiteVault;pending:boolean}|null{
 try{
  const raw=localStorage.getItem(key)
  if(!raw)return null
  const parsed=JSON.parse(raw)
  return {vault:parseVault(parsed.vault),pending:parsed.pending===true}
 }catch{return null}
}
function persistLocal(pending:boolean){
 try{
  const record={vault,pending}
  localStorage.setItem(keyFor(ownerId),JSON.stringify(record))
  // One extra local copy helps after an interrupted write; it is NOT an off-device backup.
  localStorage.setItem(BROWSER_BACKUP_KEY+('_'+(ownerId||'guest')),JSON.stringify(record))
  return true
 }catch{cloudStatus='cloud-unavailable';message='Browser storage unavailable. Export a manual backup.';return false}
}
function emit(){
 window.dispatchEvent(new CustomEvent('tryamm:ai-site-builder-state',{detail:{
  schema:SITE_VAULT_SCHEMA,sites:vault.sites,trash:vault.trash,versions:vault.versions,
  cloudBackups:backups,cloudStatus,message,
  userScoped:Boolean(ownerId),legacyAvailable:Boolean(localStorage.getItem(LEGACY_KEY)),
  ownershipPolicy,revenue:['website subscriptions','one-time website buyout','domain/hosting management',
    'premium templates','commerce transaction services','AI business copilot',
    'marketing/SEO services','creator/broadcast packages','maintenance/support']
 }}))
}
async function refreshBackups(){
 if(!ownerId)return
 try{backups=await listSiteBackups(ownerId);emit()}
 catch{cloudStatus='cloud-unavailable';message='Cloud history unavailable. Local drafts remain available.';emit()}
}
function enqueueCloud(reason:string,snapshot:SiteVault){
 if(!ownerId)return
 const user=ownerId
 syncQueue=syncQueue.catch(()=>{}).then(async()=>{
  if(ownerId!==user)return
  try{
   await saveSiteBackup(user,snapshot,reason)
   if(ownerId===user&&JSON.stringify(vault)===JSON.stringify(snapshot)){
    persistLocal(false);cloudStatus='cloud-saved';message='Private cloud backup saved.'
   }
   await refreshBackups()
  }catch{
   if(ownerId===user){cloudStatus='offline-pending';message='Cloud backup failed. Local copy retained; export a file until sync succeeds.';emit()}
  }
 })
}
function commit(reason:string,next:SiteVault){
 vault=next
 const saved=persistLocal(Boolean(ownerId))
 cloudStatus=ownerId?'offline-pending':'browser-only'
 message=ownerId?'Saving encrypted-in-transit backup in Supabase…':'Browser-only draft; sign in for off-device recovery.'
 emit()
 if(ownerId&&saved)enqueueCloud(reason,copy(vault))
}
function mutate(reason:string,op:(v:SiteVault)=>SiteVault){
 try{commit(reason,op(vault))}
 catch{message='Change could not be applied. Existing backups and drafts were preserved.';emit()}
}
async function hydrateForUser(){
 if(busy)return
 busy=true;cloudStatus='connecting';message='Checking your private cloud drafts…';emit()
 try{
  const session=await getCloudSiteSession(),nextOwner=session?.userId||null
  if(nextOwner===ownerId&&hydrated)return
  ownerId=nextOwner
  const local=validLocal(keyFor(nextOwner))
  const preserved=validLocal(BROWSER_BACKUP_KEY+'_'+(nextOwner||'guest'))
  vault=local?.vault||preserved?.vault||emptyVault()
  backups=[]
  if(!nextOwner){
   cloudStatus='browser-only';message='Not signed in. Drafts are local to this browser; export a backup.'
  }else{
   try{
    const latest=await latestSiteBackup(nextOwner)
    if(latest){
     // Cloud is authoritative on a new device; NEVER discard an unsynced local draft.
     if(local?.pending){
      cloudStatus='recovery-available'
      message='Unsynced browser changes found. Latest cloud copy is available in Backup History; export local draft before restoring.'
    }else{
      vault=latest.vault
      persistLocal(false)
      cloudStatus='cloud-saved';message='Recovered your saved website drafts from Supabase.'
    }
    }else if(vault.sites.length||vault.trash.length){
     cloudStatus='offline-pending';message='Local drafts found; preparing first cloud backup.'
     enqueueCloud('initial_account_backup',copy(vault))
    }else{
     cloudStatus='cloud-saved';message='Cloud recovery ready. New drafts will auto-save.'
    }
    await refreshBackups()
   }catch{
    cloudStatus='cloud-unavailable';message='Could not reach Supabase. Local copy is preserved; cloud recovery is not confirmed.'
   }
  }
 }catch{
  cloudStatus='cloud-unavailable';message='Could not verify app sign-in. Cloud backup is not available.'
 }finally{hydrated=true;busy=false;emit()}
}
async function restoreCloudSnapshot(id:string){
 if(!ownerId){message='Sign in to restore a private cloud backup.';emit();return}
 const currentOwner=ownerId
 try{
  const chosen=await readSiteBackup(currentOwner,id)
  if(ownerId!==currentOwner)return
  if(vault.sites.length||vault.trash.length)enqueueCloud('before_cloud_restore',copy(vault))
  commit('cloud_restore',chosen)
  message='Cloud snapshot restored to the website builder. Other backups remain available.'
  emit()
 }catch{message='Could not load the selected cloud backup. Existing drafts remain unchanged.';emit()}
}
function importLegacy(){
 try{
  const raw=JSON.parse(localStorage.getItem(LEGACY_KEY)||'[]')
  if(!Array.isArray(raw))throw Error('bad_legacy')
  const sites=raw.slice(0,200).map(sanitizeSite)
  const incoming:SiteVault={...emptyVault(),sites}
  commit('user_imported_legacy_browser_drafts',mergeImportedVault(vault,incoming))
  message='Old browser drafts imported. Keep the original browser data until cloud sync is confirmed.';emit()
 }catch{message='Old browser drafts could not be imported. Original data was not changed.';emit()}
}
function handle(eName:string,handler:(d:Record<string,any>)=>void){
 window.addEventListener(eName,(e:Event)=>handler(detail(e)))
}
export function installAIWebsiteBusinessBuilderRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 vault=validLocal(keyFor(null))?.vault||emptyVault()
 handle('tryamm:ai-site-builder-request',()=>emit())
 handle('tryamm:ai-site-create',d=>mutate('site_created',v=>createSite(v,{
  name:String(d.name||'My Business'),industry:String(d.industry||'general'),city:String(d.city||'Global')})))
 handle('tryamm:ai-site-publish',d=>mutate('site_published',v=>changeSite(v,String(d.id),'before_publish',{
  status:'published',...(typeof d.domain==='string'?{domain:d.domain}:{} )})))
 handle('tryamm:ai-site-ownership',d=>mutate('site_ownership_changed',v=>changeSite(v,String(d.id),'before_ownership_change',{
  ownership:d.ownership==='buyout'||d.ownership==='exported'?d.ownership:'subscription'})))
 handle('tryamm:ai-site-theme',d=>mutate('child_theme_changed',v=>applyChildTheme(v,String(d.id),d.preset as ThemePreset)))
 handle('tryamm:ai-site-delete',d=>{if(d.confirmed===true)mutate('site_soft_deleted',v=>softDeleteSite(v,String(d.id)))})
 handle('tryamm:ai-site-restore',d=>mutate('site_undeleted',v=>restoreFromTrash(v,String(d.id))))
 handle('tryamm:ai-site-version-restore',d=>mutate('site_version_restored',v=>restoreVersion(v,Number(d.index))))
 handle('tryamm:ai-site-legacy-import',()=>importLegacy())
 handle('tryamm:ai-site-vault-export',()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-backup-ready',{
  detail:{filename:'TRYAMM_website_backup_'+new Date().toISOString().slice(0,10)+'.json',
   json:JSON.stringify(vault,null,2)}})))
 handle('tryamm:ai-site-vault-import',d=>mutate('manual_backup_imported',v=>mergeImportedVault(v,d.json)))
 handle('tryamm:ai-site-cloud-restore',d=>{void restoreCloudSnapshot(String(d.id))})
 handle('tryamm:ai-site-cloud-refresh',()=>{void refreshBackups()})
 handle('tryamm:ai-site-export',d=>{
  const site=vault.sites.find(s=>s.id===d.id);if(!site)return
  window.dispatchEvent(new CustomEvent('tryamm:ai-site-export-ready',{detail:{
   site:{...site,ownership:'exported'},
   manifest:{format:'portable-web-project',includes:['site configuration','child theme','page structure','feature manifest'],
    excludes:['TRYAMM secrets','provider credentials','hosted files','database','non-transferable licensed assets']}
  }}))
 })
 handle('tryamm:business-launch-from-site',d=>{
  const site=vault.sites.find(s=>s.id===d.id);if(!site)return
  window.dispatchEvent(new CustomEvent('tryamm:metaverse-business-create',{
   detail:{name:site.name,category:site.industry,city:site.city,source:'ai-website-builder'}}))
  window.dispatchEvent(new CustomEvent('tryamm:quantum-sourcing-request',{detail:{business:site.name,industry:site.industry}}))
  window.dispatchEvent(new CustomEvent('tryamm:creator-commerce-launch',{detail:{business:site.name,siteId:site.id}}))
 })
 const db=getSupabaseClient()
 db?.auth.onAuthStateChange((_event,_session)=>{
  // Do not synchronously call Supabase network methods from the auth callback.
  setTimeout(()=>{void hydrateForUser()},0)
 })
 window.addEventListener('online',()=>{
  if(ownerId&&cloudStatus==='offline-pending')enqueueCloud('reconnect_after_offline',copy(vault))
 })
 queueMicrotask(()=>{emit();void hydrateForUser()})
}
