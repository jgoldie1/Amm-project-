import {getSupabaseClient} from '../services/supabaseClient'

export type PublishedMeshyAsset={
  assetId:string
  filename:string
  cityScope:string
  url:string
  walkUrl?:string|null
  runUrl?:string|null
  ready:boolean
  completedAt?:string|null
}

const cache=new Map<string,{at:number;promise:Promise<PublishedMeshyAsset[]>}>()
const CACHE_TTL_MS=30_000

export function resetPublishedMeshyManifest(){cache.clear()}

async function vaultPublishedAssets(scope:string):Promise<PublishedMeshyAsset[]>{
  const db=getSupabaseClient()
  if(!db)return[]
  // Column-scoped grants + RLS expose only founder-approved models and URLs.
  // Private draft paths, owner identities and source photos are NEVER queried.
  try{
    const {data,error}=await db.from('asset_factory_assets')
      .select('asset_id,city_scope,published_url,published_at')
      .in('city_scope',['global',scope])
      .order('published_at',{ascending:false})
      .limit(80)
    if(error||!data)return[]
    return data.filter(row=>typeof row.published_url==='string'&&
        row.published_url.startsWith('https://')&&Boolean(row.asset_id))
      .map(row=>({
        assetId:row.asset_id,
        cityScope:row.city_scope,
        filename:String(row.published_url).split('/').pop()||'approved-character.glb',
        url:row.published_url,
        ready:true,
        completedAt:row.published_at,
      }))
  }catch{return[]}
}

async function legacyManifest(scope:string):Promise<PublishedMeshyAsset[]>{
  const controller=new AbortController()
  const timer=window.setTimeout(()=>controller.abort(),3000)
  try{
    const response=await fetch('/api/meshy/asset-manifest?city='+encodeURIComponent(scope),
      {cache:'no-store',signal:controller.signal})
    if(!response.ok)return[]
    const payload=await response.json()
    return Array.isArray(payload?.assets)?
      payload.assets.filter((a:PublishedMeshyAsset)=>a?.ready&&a?.assetId&&a?.url):[]
  }catch{return[]}
  finally{window.clearTimeout(timer)}
}

export async function loadPublishedMeshyManifest(cityScope='global'){
  const scope=String(cityScope||'global').trim()||'global'
  const cached=cache.get(scope)
  if(!cached||Date.now()-cached.at>CACHE_TTL_MS){
    cache.set(scope,{at:Date.now(),promise:(async()=>{
      const [approved,legacy]=await Promise.all([vaultPublishedAssets(scope),legacyManifest(scope)])
      const seen=new Set<string>()
      // Founder-approved version takes precedence over older generated assets
      // when the explicitly approved view is requested by the character loader.
      return [...approved,...legacy].filter(a=>{
        if(seen.has(a.assetId))return false
        seen.add(a.assetId)
        return true
      })
    })()})
  }
  return cache.get(scope)!.promise
}

export async function resolvePublishedMeshyAsset(assetId:string,cityScope='global'){
  const assets=await loadPublishedMeshyManifest(cityScope)
  return assets.find(asset=>asset.assetId===assetId)||null
}
