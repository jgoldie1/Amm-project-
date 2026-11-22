// Farm publication is deliberately fail-closed. This is a pure policy helper:
// backend persistence and signed approval verification must be added before any
// real farm is published. Never treat profile submissions as consent.
export type FarmEvidence = {
  farmId:string
  farmName:string
  city:string
  state:string
  products:string[]
  website:string | null
  consentGranted:boolean
  consentExpiresAt:string | null
  approvedAt:string | null
  approvedBy:string | null
  identityVerifiedAt:string | null
  rightsVerifiedAt:string | null
  withdrawnAt:string | null
  publicListingAllowed:boolean
  mediaPermission:boolean
  supplierPurchaseAgreement:boolean
  foodComplianceVerified:boolean
  fulfillmentVerified:boolean
}
export type FarmPublicProfile = Pick<FarmEvidence,'farmId'|'farmName'|'city'|'state'|'products'|'website'>
const isValidHttpUrl=(u:string|null)=>{if(!u)return false;try{return ['https:','http:'].includes(new URL(u).protocol)}catch{return false}}
export function canPublishFarm(f:FarmEvidence,now=new Date()):boolean{
  return Boolean(f.farmId&&f.farmName&&f.city&&f.state&&
    f.publicListingAllowed&&f.consentGranted&&f.approvedAt&&f.approvedBy&&
    f.identityVerifiedAt&&f.rightsVerifiedAt&&!f.withdrawnAt&&
    f.consentExpiresAt&&new Date(f.consentExpiresAt).getTime()>now.getTime()&&
    isValidHttpUrl(f.website))
}
export function publicFarm(f:FarmEvidence,now=new Date()):FarmPublicProfile|null{
  if(!canPublishFarm(f,now))return null
  return {farmId:f.farmId,farmName:f.farmName,city:f.city,state:f.state,
    products:f.products,website:f.website}
}
export function maySellFarmProducts(f:FarmEvidence,now=new Date()):boolean{
  return canPublishFarm(f,now)&&f.supplierPurchaseAgreement&&
    f.foodComplianceVerified&&f.fulfillmentVerified
}
export function mayUseFarmMedia(f:FarmEvidence,now=new Date()):boolean{
  return canPublishFarm(f,now)&&f.mediaPermission
}
