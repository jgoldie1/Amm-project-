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
