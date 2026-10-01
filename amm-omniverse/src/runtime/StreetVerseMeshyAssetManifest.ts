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

export function resetPublishedMeshyManifest(){
  cache.clear()
}

export async function loadPublishedMeshyManifest(cityScope='global'){
  const scope=String(cityScope||'global').trim()||'global'
  const cached=cache.get(scope)
  if(!cached||Date.now()-cached.at>CACHE_TTL_MS){
    cache.set(scope,{at:Date.now(),promise:(async()=>{
      try{
        const response=await fetch(`/api/meshy/asset-manifest?city=${encodeURIComponent(scope)}`,{cache:'no-store'})
        if(!response.ok)return[]
        const payload=await response.json()
        return Array.isArray(payload?.assets)?payload.assets.filter((a:PublishedMeshyAsset)=>a?.ready&&a?.assetId&&a?.url):[]
      }catch{return[]}
    })()})
  }
  return cache.get(scope)!.promise
}

export async function resolvePublishedMeshyAsset(assetId:string,cityScope='global'){
  const assets=await loadPublishedMeshyManifest(cityScope)
  return assets.find(asset=>asset.assetId===assetId)||null
}
