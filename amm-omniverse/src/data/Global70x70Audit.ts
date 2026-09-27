export const GLOBAL_70X70_AUDIT_DIMENSIONS=[
 'identity-auth','passport-profile','city-routing','state-region-routing','country-routing','continent-routing','global-routing',
 'geospatial-sources','rights-provenance','terrain-water','roads-walkability','transit','traffic','vehicles',
 'buildings-lod','landmarks','vegetation','weather','day-night','population-npcs','animals-ecology',
 'missions','jobs','business-passports','qr-scout','marketplace','delivery','creator-economy',
 'holo-ads','sponsorships','subscriptions','ppv-ticketing','gifts','music-rights','sync-licensing',
 'tryamm-tv','all-american-network','isaiah-ai-tv','streetverse-radio','local-news','national-news','global-news',
 'holo-live-pk','reels-replay','rights-router','checkout','webhook-verification','entitlements','ledger',
 'splits-royalties','refunds-reversals','analytics','conversion-followup','localization','translation',
 'one-hand-accessibility','voice-accessibility','captions','reduced-motion','mobile-performance','pwa',
 'android-release','ios-release','security','privacy-retention','moderation-minors','observability',
 'ci-certification','deployment-verification','release-promotion','disaster-recovery',
] as const

export const GLOBAL_70X70_REGIONS=[
 'Chicago','Illinois','United States','Lagos','Abuja','Nigeria','Accra','Ghana','Nairobi','Kenya',
 'Johannesburg','Cape Town','South Africa','Addis Ababa','Ethiopia','New York','Los Angeles','Canada','Caribbean','Mexico',
 'Brazil','Latin America','London','United Kingdom','Paris','France','Germany','Spain','Italy','Europe',
 'Dubai','United Arab Emirates','Middle East','India','Japan','South Korea','Southeast Asia','Australia','Asia-Pacific','Africa',
 'North America','South America','West Africa','East Africa','Southern Africa','Central Africa','North Africa','Caribbean Region','European Union','Gulf Region',
 'Global Creator Network','Global Business Network','Global Media Network','Global Music Network','Global Sports Network','Global Faith Network','Global Education Network','Global Jobs Network','Global Marketplace','Global Delivery Network',
 'Global Holo Ads','Global Rights Network','Global Payment Fabric','Global Ledger','Global Accessibility','Global Localization','Global Weather','Global News','Global Release System','Global Certification',
] as const

export const GLOBAL_70X70_CHECK_COUNT=GLOBAL_70X70_AUDIT_DIMENSIONS.length*GLOBAL_70X70_REGIONS.length

export interface GlobalAuditFinding{region:string;dimension:string;status:'implemented'|'partial'|'planned'|'blocked'|'not-applicable';evidence?:string;blocker?:string}

export function createGlobal70x70AuditMatrix():GlobalAuditFinding[]{
 return GLOBAL_70X70_REGIONS.flatMap(region=>GLOBAL_70X70_AUDIT_DIMENSIONS.map(dimension=>({
  region,dimension,status:'planned' as const,
 })))
}

export const GLOBAL_70X70_RULES={
 expectedDimensions:70,
 expectedRegions:70,
 expectedChecks:4900,
 failClosedWhenEvidenceMissing:true,
 noLiveStatusFromRegistryAlone:true,
 certificationRequiresEvidence:true,
 securityPrivacyRightsAndPaymentsCannotBeWaived:true,
} as const


export const GLOBAL_70X70_CRITICAL_GATES=[
 'identity-auth','city-routing','geospatial-sources','rights-provenance','missions','business-passports',
 'holo-ads','music-rights','tryamm-tv','local-news','holo-live-pk','checkout','webhook-verification',
 'entitlements','ledger','localization','one-hand-accessibility','mobile-performance','android-release',
 'ios-release','security','privacy-retention','moderation-minors','observability','ci-certification',
 'deployment-verification','disaster-recovery',
] as const

export function auditMatrixIntegrity(){
 const matrix=createGlobal70x70AuditMatrix()
 const keys=new Set(matrix.map(x=>`${x.region}::${x.dimension}`))
 const dimensionsUnique=new Set(GLOBAL_70X70_AUDIT_DIMENSIONS).size===GLOBAL_70X70_AUDIT_DIMENSIONS.length
 const regionsUnique=new Set(GLOBAL_70X70_REGIONS).size===GLOBAL_70X70_REGIONS.length
 return{
  dimensions:GLOBAL_70X70_AUDIT_DIMENSIONS.length,
  regions:GLOBAL_70X70_REGIONS.length,
  checks:matrix.length,
  uniqueChecks:keys.size,
  dimensionsUnique,regionsUnique,
  valid:GLOBAL_70X70_AUDIT_DIMENSIONS.length===70&&GLOBAL_70X70_REGIONS.length===70&&matrix.length===4900&&keys.size===4900&&dimensionsUnique&&regionsUnique,
 }
}

export function summarizeGlobal70x70(findings:GlobalAuditFinding[]){
 const counts={implemented:0,partial:0,planned:0,blocked:0,'not-applicable':0}
 for(const f of findings)counts[f.status]++
 const missingEvidence=findings.filter(f=>(f.status==='implemented'||f.status==='partial')&&!f.evidence)
 const criticalBlocked=findings.filter(f=>f.status==='blocked'&&(GLOBAL_70X70_CRITICAL_GATES as readonly string[]).includes(f.dimension))
 return{total:findings.length,counts,missingEvidence,criticalBlocked,canCertify:findings.length===4900&&missingEvidence.length===0&&criticalBlocked.length===0}
}
