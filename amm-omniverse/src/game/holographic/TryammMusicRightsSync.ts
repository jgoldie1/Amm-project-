export type MusicRightsRevenue=
 |'master-stream'|'download-sale'|'sync-license'|'master-use'|'composition-license'
 |'performance-royalty'|'mechanical-royalty'|'neighboring-rights'|'ugc-license'
 |'brand-placement'|'soundtrack'|'sample-clearance'|'catalog-license'

export type ScreenPlacement=
 |'film'|'tv'|'streaming-series'|'advertisement'|'trailer'|'game'
 |'streetverse'|'reel'|'podcast'|'live-event'|'business-twin'

export interface MusicRightsAsset{
 trackId:string; title:string
 masterOwnerIds:string[]; compositionOwnerIds:string[]
 publisherIds?:string[]; performingRightsOrgRefs?:string[]
 territories:string[]; validFrom?:string; validUntil?:string
 explicitContent?:boolean
}

export interface SyncOpportunity{
 id:string; placement:ScreenPlacement; projectId:string
 trackId:string; territory:string; term:string
 feeMinor?:number; currency?:string
 status:'request'|'rights-check'|'quoted'|'approved'|'licensed'|'rejected'
}

export const MUSIC_RIGHTS_REVENUE:MusicRightsRevenue[]=[
 'master-stream','download-sale','sync-license','master-use','composition-license',
 'performance-royalty','mechanical-royalty','neighboring-rights','ugc-license',
 'brand-placement','soundtrack','sample-clearance','catalog-license'
]

export const SYNC_PLACEMENTS:ScreenPlacement[]=[
 'film','tv','streaming-series','advertisement','trailer','game',
 'streetverse','reel','podcast','live-event','business-twin'
]

export const MUSIC_RIGHTS_FLOW=[
 'artist/rights holder registers track and ownership metadata',
 'TRYAMM stores rights reference without assuming ownership',
 'film/show/ad/game/creator requests placement',
 'Rights Router checks master + composition permissions, territory and term',
 'rights holders receive/approve commercial terms when required',
 'verified license/payment event is recorded',
 'eligible media receives a license/entitlement reference',
 'usage is reported to royalty ledger',
 'declared rights/platform/agent allocations become payable after verification',
] as const

export const MUSIC_RIGHTS_RULES={
 noSyncWithoutMasterAndCompositionClearance:true,
 noAssumedOwnershipFromUpload:true,
 samplesRequireClearance:true,
 thirdPartyBeatsRequireRights:true,
 territoryAndTermRequired:true,
 usageReportingRequired:true,
 cueSheetOrEquivalentMetadataPlanned:true,
 contractCanOverrideDefaultSplit:true,
 rightsHolderApprovalRequiredWhenContractRequires:true,
 refundsOrLicenseCancellationCanReverseEligibleLedgerEntries:true,
 serverAuthoritativeSettlement:true,
} as const
