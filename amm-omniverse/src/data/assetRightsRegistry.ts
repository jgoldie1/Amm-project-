export type AssetRightsStatus='ORIGINAL'|'LICENSED'|'PUBLIC_DOMAIN'|'PENDING_REVIEW'|'REJECTED'
export type AssetRightsCategory='character'|'likeness'|'vehicle'|'building'|'landmark'|'business'|'trademark'|'music'|'audio'|'animation'|'texture'|'model'|'environment'|'other'

export type AssetRightsRecord={
  assetId:string
  category:AssetRightsCategory
  status:AssetRightsStatus
  source:string
  creatorOrLicensor?:string
  licenseName?:string
  licenseReference?:string
  proofReference?:string
  territory?:string
  commercialUse:boolean
  derivativeUse:boolean
  likenessConsent?:boolean
  trademarkClearance?:boolean
  musicSyncClearance?:boolean
  expiresAt?:string
  reviewedBy?:string
  reviewedAt?:string
  notes?:string
}

const records=new Map<string,AssetRightsRecord>()

export function registerAssetRights(record:AssetRightsRecord){records.set(record.assetId,record);return record}
export function getAssetRights(assetId:string){return records.get(assetId)}

const pending=(assetId:string,category:AssetRightsCategory,source:string):AssetRightsRecord=>({
  assetId,category,status:'PENDING_REVIEW',source,commercialUse:false,derivativeUse:false,
  notes:'Existing repository asset path registered for provenance review. No ownership or third-party rights are implied by this record.'
})

;[
  pending('player-default','character','/assets/streetverse/characters/player-default.glb'),
  pending('npc-citizen-a','character','/assets/streetverse/npcs/citizen-a.glb'),
  pending('car-sedan-a','vehicle','/assets/streetverse/vehicles/sedan-a.glb'),
  pending('building-records','building','/assets/streetverse/buildings/soul-records.glb'),
  pending('building-club','building','/assets/streetverse/buildings/night-club.glb'),
  pending('building-restaurant','building','/assets/streetverse/buildings/restaurant.glb'),
  pending('dog-a','model','/assets/streetverse/animals/dog-a.glb'),
  pending('bird-a','model','/assets/streetverse/animals/bird-a.glb'),
  pending('city-ambience','audio','/assets/streetverse/audio/city-ambience.mp3'),
  pending('reward-coin-gold','model','/assets/streetverse/recovered/props/coin-gold.glb'),
  pending('mission-crate','model','/assets/streetverse/recovered/props/crate.glb'),
  pending('mission-key','model','/assets/streetverse/recovered/props/key.glb'),
  pending('mission-chest','model','/assets/streetverse/recovered/props/chest.glb'),
  pending('mission-finish-flag','model','/assets/streetverse/recovered/props/finish-flag.glb'),
  pending('city-tree','environment','/assets/streetverse/recovered/environment/tree.glb'),
  pending('city-tree-pine','environment','/assets/streetverse/recovered/environment/tree-pine.glb'),
  pending('city-rocks','environment','/assets/streetverse/recovered/environment/rocks.glb'),
  pending('city-flowers','environment','/assets/streetverse/recovered/environment/flowers.glb'),
  pending('city-grass','environment','/assets/streetverse/recovered/environment/grass.glb')
].forEach(registerAssetRights)

export function evaluateProductionClearance(assetId:string,now=new Date()){
  const r=records.get(assetId)
  if(!r)return {allowed:false,reasons:['NO_PROVENANCE_RECORD']}
  const reasons:string[]=[]
  if(!['ORIGINAL','LICENSED','PUBLIC_DOMAIN'].includes(r.status))reasons.push(`STATUS_${r.status}`)
  if(!r.commercialUse)reasons.push('NO_COMMERCIAL_USE_RIGHT')
  if(!r.derivativeUse)reasons.push('NO_DERIVATIVE_USE_RIGHT')
  if(r.expiresAt&&new Date(r.expiresAt)<=now)reasons.push('RIGHTS_EXPIRED')
  if(r.category==='likeness'&&r.likenessConsent!==true)reasons.push('LIKENESS_CONSENT_REQUIRED')
  if((r.category==='business'||r.category==='trademark')&&r.trademarkClearance!==true)reasons.push('TRADEMARK_CLEARANCE_REQUIRED')
  if(r.category==='music'&&r.musicSyncClearance!==true)reasons.push('MUSIC_SYNC_CLEARANCE_REQUIRED')
  if(r.status==='LICENSED'&&!r.proofReference)reasons.push('LICENSE_PROOF_REQUIRED')
  return {allowed:reasons.length===0,reasons,record:r}
}

export function assertProductionClearance(assetId:string){
  const result=evaluateProductionClearance(assetId)
  if(!result.allowed)throw new Error(`Asset ${assetId} blocked by rights gate: ${result.reasons.join(', ')}`)
  return result.record!
}

export function listRightsRecords(){return [...records.values()]}
