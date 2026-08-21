export type QuotaLane='creator'|'host'|'family'|'agency'
export type QuotaStatus='not-started'|'building'|'on-track'|'met'|'verified'

export const QUOTA_COACH={
 purpose:'Help eligible creators, hosts, families and agencies understand progress toward published program goals without pressuring users to spend, gift, or make misleading earnings claims.',
 inputs:['eligible verified live minutes','eligible content sessions','verified audience/community activity','qualified program events','policy standing','approved referral/activation events'],
 outputs:['progress meter','remaining eligible activity','next allowed action','deadline/time-zone','policy warning','accessibility reminder','coach recommendation'],
 guardrails:[
  'No pay-to-hit-quota requirement.',
  'Do not count self-gifting, circular transactions, fraud, bots or prohibited incentivized activity.',
  'Do not promise income or a rebate before server-side verification.',
  'Youth quotas must be age-appropriate, guardian-managed where required, and must not require spending or unrestricted cash activity.',
  'Rest, accessibility and safety override streak/quota mechanics.',
 ],
} as const

export const BEAN_PACKAGE_CATALOG=[
 {id:'bean-starter',name:'Bean Starter',audience:'new eligible creator/host',benefits:['quota coach','creator analytics','training missions','one campaign workspace'],moneyRule:'No cash value by default; any redeemable value requires separate published terms and verified ledger.'},
 {id:'bean-builder',name:'Bean Builder',audience:'growing creator/family team',benefits:['advanced quota coach','family/team goals','campaign analytics','replay/movie promotion tools'],moneyRule:'Benefits and promotional credits are program-defined; never imply guaranteed earnings.'},
 {id:'bean-pro',name:'Bean Pro',audience:'approved agency/creator business',benefits:['agency dashboard','team quota rollup','campaign attribution','eligible rebate/commission tracking','priority business support'],moneyRule:'Payable commissions/rebates require adult/business eligibility, evidence, holds, ledger approval and tax workflow.'},
] as const

export const CREATOR_REBATE_PROGRAM={
 name:'TRYAMM Creator Growth Rebate',
 principle:'Reward verified productive participation and platform growth more transparently than opaque quota systems while avoiding pay-to-win or guaranteed-income claims.',
 eligibleEvents:[
  'published creator/host milestone under current program terms',
  'verified agency/team milestone',
  'eligible subscription or mobile bundle milestone',
  'approved marketplace/creator campaign conversion',
  'eligible family/community growth milestone',
 ],
 rewardTypes:['account credit','promotional Bean benefit','eligible adult creator payout','agency commission','family bill credit','guardian-managed youth benefit'],
 verification:'EVENT → QUOTA COACH → ELIGIBILITY → ANTI-FRAUD → PAYMENT/ACTIVITY EVIDENCE → HOLD → LEDGER → APPROVAL → REWARD → TAX/REPORTING → REVERSAL IF REQUIRED',
} as const

export const BEAN_TRUTH={
 virtualUnit:'Beans are a TRYAMM-branded rewards/gifting/program unit only when the applicable product terms define them that way.',
 cash:'Never display Beans as cash, deposits, wages, investments, guaranteed earnings or withdrawable money unless a specific lawful redemption program and payment-provider ledger has verified that status.',
 minors:'Youth accounts cannot receive unrestricted cash-out from Beans; eligible youth benefits route through guardian-managed controls and applicable law/provider rules.',
}

export const QUOTA_TO_LEGACY_PATH='CREATE → GO LIVE / PUBLISH → BUILD REAL AUDIENCE → QUOTA COACH → VERIFIED MILESTONE → REBATE/BEAN BENEFIT → CREATOR TOOLS → MOVIE/REEL → MARKETPLACE → MOBILE → FAMILY/AGENCY GROWTH → WORLD MEMORY / LEGACY'
