/** A provider passport is evidence, not a public credential or identity claim.
 * Only trusted server records may be evaluated for production dispatch/payment.
 * Client-supplied objects and demos must never authorize a real transaction. */
export type PassportRole='company'|'driver'|'courier'|'farm'|'advertiser'|'merchant'|'service-provider'
export type PassportService='advertising'|'rideshare'|'delivery'|'freight'|'drone'|'farm-discovery'|'commerce'|'gallery'
export type PassportCredential={kind:string;issuer:string;reference:string;verifiedAt:string;expiresAt:string|null;revokedAt:string|null}
export type HoloServicePassport={
 id:string;displayName:string;roles:PassportRole[];serviceScopes:PassportService[];
 operationalRegions:string[];consentGranted:boolean;consentDocumentRef:string|null;
 status:'draft'|'under-review'|'approved'|'suspended'|'revoked';
 approvedAt:string|null;approvedBy:string|null;expiresAt:string|null;
 providerAuthority:string|null;providerReference:string|null;
 credentials:PassportCredential[];rightsApproved:boolean;
 privateContact?:Record<string,unknown>;privateNotes?:string;
}
export type PublicPassport={id:string;displayName:string;roles:PassportRole[];serviceScopes:PassportService[];operationalRegions:string[]}
export function evaluatePassport(p:HoloServicePassport,service:PassportService,region:string,now=new Date()){
 const checks:Record<string,boolean>={
  status:p.status==='approved',identity:!!p.id&&!!p.displayName&&!!p.approvedBy&&!!p.approvedAt,
  consent:p.consentGranted&&!!p.consentDocumentRef,
  current:!!p.expiresAt&&Number.isFinite(Date.parse(p.expiresAt))&&Date.parse(p.expiresAt)>now.getTime(),
  scope:p.serviceScopes.includes(service),region:!!region.trim()&&p.operationalRegions.includes(region),
  authority:!!p.providerAuthority?.trim()&&!!p.providerReference?.trim(),
  credentials:p.credentials.length>0&&p.credentials.every(c=>!!c.kind&&!!c.issuer&&!!c.reference&&
   Number.isFinite(Date.parse(c.verifiedAt))&&Date.parse(c.verifiedAt)<=now.getTime()&&
   !c.revokedAt&&!!c.expiresAt&&Number.isFinite(Date.parse(c.expiresAt))&&Date.parse(c.expiresAt)>now.getTime()),
  rights:service==='gallery'||service==='advertising'?p.rightsApproved:true
 }
 const missing=Object.entries(checks).filter(([,valid])=>!valid).map(([name])=>name)
 return {approved:missing.length===0,missing}
}
export function publicPassport(p:HoloServicePassport,service:PassportService,region:string,now=new Date()):PublicPassport|null{
 if(!evaluatePassport(p,service,region,now).approved)return null
 return {id:p.id,displayName:p.displayName,roles:[...p.roles],serviceScopes:[...p.serviceScopes],operationalRegions:[...p.operationalRegions]}
}
/** Explicit action authorization. An approved passport is necessary but insufficient:
 * a provider-signed operation, permission and customer authorization are still needed. */
export function authorizeHoloAction(p:HoloServicePassport,service:PassportService,region:string,operation:{
 authenticatedProvider:boolean;customerAuthorized:boolean;policyChecksPassed:boolean;
 providerActionReference:string|null;simulation:boolean
},now=new Date()){
 return evaluatePassport(p,service,region,now).approved&&
  operation.authenticatedProvider&&operation.customerAuthorized&&
  operation.policyChecksPassed&&!operation.simulation&&
  !!operation.providerActionReference?.trim()
}
