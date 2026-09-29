export type NetworkLayer='holo-fon'|'tryamm-internet'|'edge-services'|'identity'|'internal-ledger'|'media'|'commerce'|'worlds'
export type LedgerAsset='usd-receivable'|'creator-payable'|'business-payable'|'platform-revenue'|'reward-points'|'entitlement'

export interface HoloFonSession{
 id:string; userId:string; deviceId:string; authenticated:boolean
 capabilities:('voice'|'sms'|'video'|'tv'|'radio'|'reels'|'worlds'|'commerce'|'agent')[]
}

export interface InternalLedgerEntry{
 id:string; accountId:string; asset:LedgerAsset; amountMinor:number
 currency?:string; sourceEventId:string; status:'pending'|'verified'|'reversed'
 createdAt:string
}

export const TRYAMM_DIGITAL_INFRASTRUCTURE={
 holoFon:{
  role:'user-facing communications and service shell',
  connects:['identity','voice/video','SMS adapters','TRYAMM TV','StreetVerse Radio','StreetVerse Global','Holo LIVE','Reels','personal agents','commerce'],
 },
 tryammInternet:{
  role:'TRYAMM-owned application network and service fabric over existing internet/mobile infrastructure',
  components:['service gateway','content delivery adapters','real-time communications','media delivery','city/world APIs','business services','agent routing','edge cache'],
  note:'This does not claim ownership of physical ISP last-mile infrastructure or spectrum.',
 },
 internalBlockchain:{
  role:'tamper-evident internal transaction and rights ledger',
  records:['verified commerce events','creator/business allocations','entitlements','rights references','royalty obligations','ad settlement references','reversals'],
  settlement:'External money still settles through regulated payment/banking providers; the internal ledger is not itself a bank.',
 },
} as const

export const INFRASTRUCTURE_FLOW=[
 'Holo FON authenticates user/device',
 'TRYAMM service fabric routes approved request',
 'StreetVerse / media / commerce service performs action',
 'payment provider verifies external money event when money is involved',
 'internal ledger records authoritative transaction, entitlement and allocations',
 'rights router records eligible distribution and royalty references',
 'TRYAMM TV / Radio / Reels / Worlds distribute eligible content or service',
 'analytics records minimized verified outcomes',
] as const

export const INFRASTRUCTURE_RULES={
 noClaimOfOwningPublicInternet:true,
 noClaimOfCarrierOrSpectrumRightsWithoutAuthorization:true,
 noClaimInternalLedgerIsLegalTenderOrBank:true,
 externalPaymentsUseAuthorizedProviders:true,
 serverAuthoritativeLedger:true,
 appendOnlyAuditWithExplicitReversals:true,
 noClientMintingOfCashValue:true,
 noGuaranteedInvestmentReturns:true,
 rightsConsentAndPrivacyRequired:true,
 dataMinimizationAndRetentionPolicyRequired:true,
 encryptionInTransitAndAtRest:true,
 accessibilityAcrossHoloFonServices:true,
} as const
