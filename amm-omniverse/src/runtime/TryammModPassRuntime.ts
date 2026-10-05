export type TryammModScope=
  |'asset'
  |'cosmetic'
  |'mission'
  |'world-overlay'
  |'city-rule'
  |'audio'
  |'accessibility'
  |'ar-overlay'

export type TryammModAsset={
  id:string
  kind:'model'|'texture'|'audio'|'data'|'lottie'
  url:string
  license:string
  sha256?:string
}

export type TryammArPlacement={
  id:string
  assetId:string
  label?:string
  position?:[number,number,number]
  rotation?:[number,number,number]
  scale?:number
  anchor?:'floor'|'wall'|'table'|'geo'|'player'|'world'
}

export type TryammModManifest={
  schema:'tryamm.modpass.v1'
  id:string
  name:string
  version:string
  author:string
  license:string
  ownership:'owned'|'licensed'|'cc0'|'permissive'
  description?:string
  scopes:TryammModScope[]
  targets:string[]
  assets:TryammModAsset[]
  missions?:Array<Record<string,unknown>>
  cityRules?:Array<Record<string,unknown>>
  arPlacements?:TryammArPlacement[]
  compatibility?:{
    minTryammVersion?:string
    adapters?:string[]
  }
}

export type TryammModValidation={
  ok:boolean
  errors:string[]
  warnings:string[]
}

export type TryammModAdapter={
  id:string
  label:string
  official:boolean
  supports:TryammModScope[]
  canExport:(manifest:TryammModManifest)=>boolean
  exportManifest:(manifest:TryammModManifest)=>Promise<Record<string,unknown>>
}

type InstalledMod={
  manifest:TryammModManifest
  installedAt:string
  enabled:boolean
}

const STORAGE_KEY='tryamm.modpass.installed.v1'
const ALLOWED_SCOPES=new Set<TryammModScope>(['asset','cosmetic','mission','world-overlay','city-rule','audio','accessibility','ar-overlay'])
const ALLOWED_EXTENSIONS=new Set(['glb','gltf','png','jpg','jpeg','webp','ktx2','ogg','mp3','wav','json','lottie'])
const DENIED_EXTENSIONS=new Set(['js','mjs','cjs','html','htm','wasm','exe','dll','dylib','so','bat','cmd','ps1','sh','apk','ipa','jar'])
const MAX_ASSETS=250
const MAX_AR_PLACEMENTS=200

declare global{
  interface Window{
    __TRYAMM_MOD_PASS__?:{
      version:string
      validate:(manifest:TryammModManifest)=>TryammModValidation
      install:(manifest:TryammModManifest)=>TryammModValidation
      uninstall:(id:string)=>boolean
      enable:(id:string,enabled:boolean)=>boolean
      list:()=>InstalledMod[]
      exportTo:(id:string,adapterId:string)=>Promise<Record<string,unknown>>
      registerAdapter:(adapter:TryammModAdapter)=>boolean
      placeAR:(modId:string,placementId:string)=>boolean
    }
  }
}

const safeId=(value:string)=>/^[a-z0-9][a-z0-9._-]{2,80}$/i.test(String(value||''))
const extension=(url:string)=>{
  try{
    const path=new URL(url,location.origin).pathname
    const name=path.split('/').pop()||''
    return (name.includes('.')?name.split('.').pop():'')?.toLowerCase()||''
  }catch{return''}
}
const clone=<T>(value:T):T=>JSON.parse(JSON.stringify(value)) as T

function isSafeAssetUrl(raw:string){
  try{
    const url=new URL(raw,location.origin)
    return url.protocol==='https:'||url.origin===location.origin
  }catch{return false}
}

export function validateTryammModManifest(manifest:TryammModManifest):TryammModValidation{
  const errors:string[]=[]
  const warnings:string[]=[]
  if(!manifest||manifest.schema!=='tryamm.modpass.v1')errors.push('schema')
  if(!safeId(manifest?.id))errors.push('id')
  if(!String(manifest?.name||'').trim())errors.push('name')
  if(!/^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(String(manifest?.version||'')))errors.push('version')
  if(!String(manifest?.author||'').trim())errors.push('author')
  if(!String(manifest?.license||'').trim())errors.push('license')
  if(!['owned','licensed','cc0','permissive'].includes(String(manifest?.ownership||'')))errors.push('ownership')
  if(!Array.isArray(manifest?.scopes)||manifest.scopes.length===0)errors.push('scopes')
  for(const scope of manifest?.scopes||[])if(!ALLOWED_SCOPES.has(scope))errors.push('scope:'+String(scope))
  if(!Array.isArray(manifest?.targets)||manifest.targets.length===0)errors.push('targets')
  if(!Array.isArray(manifest?.assets))errors.push('assets')
  if((manifest?.assets?.length||0)>MAX_ASSETS)errors.push('too-many-assets')
  if((manifest?.arPlacements?.length||0)>MAX_AR_PLACEMENTS)errors.push('too-many-ar-placements')

  const seen=new Set<string>()
  for(const asset of manifest?.assets||[]){
    if(!safeId(asset.id))errors.push('asset-id:'+String(asset.id))
    if(seen.has(asset.id))errors.push('duplicate-asset:'+asset.id)
    seen.add(asset.id)
    const ext=extension(asset.url)
    if(DENIED_EXTENSIONS.has(ext))errors.push('executable-asset-denied:'+asset.id)
    else if(!ALLOWED_EXTENSIONS.has(ext))errors.push('asset-type-denied:'+asset.id)
    if(!isSafeAssetUrl(asset.url))errors.push('asset-url:'+asset.id)
    if(!String(asset.license||'').trim())errors.push('asset-license:'+asset.id)
  }

  for(const placement of manifest?.arPlacements||[]){
    if(!safeId(placement.id))errors.push('ar-placement-id:'+String(placement.id))
    if(!seen.has(placement.assetId))errors.push('ar-asset-missing:'+placement.assetId)
    if(placement.scale!==undefined&&(placement.scale<=0||placement.scale>25))errors.push('ar-scale:'+placement.id)
  }

  if(manifest.scopes.includes('ar-overlay')&&!(manifest.arPlacements?.length))warnings.push('ar-overlay-without-placements')
  if(manifest.targets.includes('*'))warnings.push('wildcard-target-requires-adapter-approval')
  return {ok:errors.length===0,errors:Array.from(new Set(errors)),warnings:Array.from(new Set(warnings))}
}

function readInstalled():InstalledMod[]{
  if(typeof localStorage==='undefined')return[]
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')
    return Array.isArray(raw)?raw.filter(x=>x?.manifest?.schema==='tryamm.modpass.v1'):[]
  }catch{return[]}
}

function writeInstalled(mods:InstalledMod[]){
  if(typeof localStorage==='undefined')return
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(mods.slice(0,100)))}catch{}
}

export function installTryammModPassRuntime(){
  if(typeof window==='undefined')return()=>{}
  if(window.__TRYAMM_MOD_PASS__)return()=>{}

  const adapters=new Map<string,TryammModAdapter>()

  adapters.set('tryamm-native',{
    id:'tryamm-native',
    label:'TRYAMM Native / CrossVerse',
    official:true,
    supports:Array.from(ALLOWED_SCOPES),
    canExport:()=>true,
    exportManifest:async manifest=>({
      schema:'tryamm.crossverse.mod.v1',
      adapter:'tryamm-native',
      exportedAt:new Date().toISOString(),
      manifest:clone(manifest),
    }),
  })

  adapters.set('webxr-ar',{
    id:'webxr-ar',
    label:'TRYAMM WebXR AR Overlay',
    official:true,
    supports:['asset','cosmetic','world-overlay','accessibility','ar-overlay'],
    canExport:manifest=>manifest.scopes.some(scope=>['asset','cosmetic','world-overlay','accessibility','ar-overlay'].includes(scope)),
    exportManifest:async manifest=>({
      schema:'tryamm.crossverse.ar-mod.v1',
      adapter:'webxr-ar',
      exportedAt:new Date().toISOString(),
      assets:clone(manifest.assets),
      placements:clone(manifest.arPlacements||[]),
    }),
  })

  const publishInstalled=(reason:string)=>{
    const mods=readInstalled()
    window.dispatchEvent(new CustomEvent('tryamm:mod-pass-state',{detail:{
      reason,
      installed:mods.map(x=>({id:x.manifest.id,name:x.manifest.name,version:x.manifest.version,enabled:x.enabled,scopes:x.manifest.scopes})),
      sandbox:'declarative-no-executable-code',
      adapters:Array.from(adapters.values()).map(a=>({id:a.id,label:a.label,official:a.official,supports:a.supports})),
    }}))
  }

  const api={
    version:'1.0.0',
    validate:validateTryammModManifest,
    install:(manifest:TryammModManifest)=>{
      const result=validateTryammModManifest(manifest)
      if(!result.ok)return result
      const mods=readInstalled().filter(x=>x.manifest.id!==manifest.id)
      mods.push({manifest:clone(manifest),installedAt:new Date().toISOString(),enabled:true})
      writeInstalled(mods)
      window.dispatchEvent(new CustomEvent('tryamm:mod-installed',{detail:{id:manifest.id,name:manifest.name,version:manifest.version,scopes:manifest.scopes}}))
      publishInstalled('install')
      return result
    },
    uninstall:(id:string)=>{
      const before=readInstalled()
      const after=before.filter(x=>x.manifest.id!==id)
      if(after.length===before.length)return false
      writeInstalled(after)
      window.dispatchEvent(new CustomEvent('tryamm:mod-uninstalled',{detail:{id}}))
      publishInstalled('uninstall')
      return true
    },
    enable:(id:string,enabled:boolean)=>{
      const mods=readInstalled()
      const found=mods.find(x=>x.manifest.id===id)
      if(!found)return false
      found.enabled=Boolean(enabled)
      writeInstalled(mods)
      window.dispatchEvent(new CustomEvent('tryamm:mod-enabled',{detail:{id,enabled:Boolean(enabled)}}))
      publishInstalled('enable')
      return true
    },
    list:()=>clone(readInstalled()),
    exportTo:async(id:string,adapterId:string)=>{
      const installed=readInstalled().find(x=>x.manifest.id===id&&x.enabled)
      if(!installed)throw new Error('mod_not_installed_or_disabled')
      const adapter=adapters.get(adapterId)
      if(!adapter)throw new Error('adapter_not_registered')
      const unsupported=installed.manifest.scopes.filter(scope=>!adapter.supports.includes(scope))
      if(unsupported.length)throw new Error('adapter_scope_unsupported:'+unsupported.join(','))
      if(!adapter.canExport(installed.manifest))throw new Error('adapter_rejected_manifest')
      const exported=await adapter.exportManifest(installed.manifest)
      window.dispatchEvent(new CustomEvent('tryamm:crossverse-mod-exported',{detail:{id,adapterId,exported}}))
      return exported
    },
    registerAdapter:(adapter:TryammModAdapter)=>{
      if(!adapter||!safeId(adapter.id)||typeof adapter.exportManifest!=='function')return false
      adapters.set(adapter.id,adapter)
      publishInstalled('adapter-register')
      return true
    },
    placeAR:(modId:string,placementId:string)=>{
      const installed=readInstalled().find(x=>x.manifest.id===modId&&x.enabled)
      if(!installed)return false
      const placement=installed.manifest.arPlacements?.find(x=>x.id===placementId)
      if(!placement)return false
      const asset=installed.manifest.assets.find(x=>x.id===placement.assetId)
      if(!asset)return false
      const detail={
        modId,
        placementId,
        asset,
        placement,
        source:'tryamm-mod-pass',
        webxrMode:'immersive-ar',
        sandboxed:true,
      }
      window.dispatchEvent(new CustomEvent('tryamm:ar-mod-overlay',{detail}))
      window.dispatchEvent(new CustomEvent('tryamm:holo-scan-request',{detail:{...detail,kind:'ar-mod-overlay'}}))
      return true
    },
  }

  window.__TRYAMM_MOD_PASS__=api

  const onInstall=(event:Event)=>{
    const manifest=(event as CustomEvent<TryammModManifest>).detail
    const result=api.install(manifest)
    window.dispatchEvent(new CustomEvent('tryamm:mod-pass-install-result',{detail:{id:manifest?.id,result}}))
  }
  const onExport=(event:Event)=>{
    const d=(event as CustomEvent<{id?:string;adapterId?:string}>).detail||{}
    if(!d.id||!d.adapterId)return
    void api.exportTo(d.id,d.adapterId).catch(error=>window.dispatchEvent(new CustomEvent('tryamm:crossverse-mod-export-error',{detail:{id:d.id,adapterId:d.adapterId,message:String(error?.message||error)}})))
  }
  const onAR=(event:Event)=>{
    const d=(event as CustomEvent<{modId?:string;placementId?:string}>).detail||{}
    if(d.modId&&d.placementId)api.placeAR(d.modId,d.placementId)
  }

  addEventListener('tryamm:mod-pass-install',onInstall)
  addEventListener('tryamm:crossverse-mod-export',onExport)
  addEventListener('tryamm:mod-pass-ar-place',onAR)

  publishInstalled('startup')
  window.dispatchEvent(new CustomEvent('tryamm:mod-pass-ready',{detail:{
    version:'1.0.0',
    sandboxed:true,
    executableCodeAllowed:false,
    crossVerse:true,
    arOverlay:true,
    officialAdapterOnlyForExternalGames:true,
  }}))

  return()=>{
    removeEventListener('tryamm:mod-pass-install',onInstall)
    removeEventListener('tryamm:crossverse-mod-export',onExport)
    removeEventListener('tryamm:mod-pass-ar-place',onAR)
    delete window.__TRYAMM_MOD_PASS__
  }
}
