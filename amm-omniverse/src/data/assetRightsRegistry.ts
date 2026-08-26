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
