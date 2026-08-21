export type MobileBrandId='tryamm-mobile'|'all-american-mobile'
export const MOBILE_BRANDS={
 'tryamm-mobile':{name:'TRYAMM Mobile',position:'Digital-first wireless for TRYAMM creators, families, gamers and global communities'},
 'all-american-mobile':{name:'All American Mobile',position:'Consumer, business, franchise and community wireless brand connected to All American Marketplace'},
} as const

export const BUILD_YOUR_OWN_MOBILE_PATH=[
 'Choose brand and target markets',
 'Apply to approved MVNO/wholesale or managed wireless platform',
 'Complete business, credit, compliance and commercial review',
 'Negotiate plans, coverage, roaming, support, device and economics terms',
 'Receive sandbox carrier APIs and SIM/eSIM provisioning credentials',
 'Connect TRYAMM subscriber, device, billing, porting and support adapters',
 'Complete E911/911, number-porting, tax, privacy, consumer-protection and required telecom controls with providers/counsel',
 'Run employee/internal pilot',
 'Run limited customer beta with verified coverage/device disclosures',
 'Enable franchise/dealer activations only after carrier approval',
 'Launch production talk/text/data',
 'Add approved NTN/private-network/HoloFon capabilities as separate verified products',
] as const

export const MOBILE_PRODUCT_MODULES=[
 'personal plans','family plans','creator plans','business lines','tablet/watch/hotspot','international/roaming','diaspora plans',
 'device/eSIM compatibility checker','number port/activation handoff','subscriber billing','commission ledger','dealer onboarding','support center','HoloFon waitlist',
] as const

export type RebateStatus='pending'|'eligible'|'approved'|'paid'|'reversed'
export type RebateRule={id:string;label:string;trigger:string;reward:string;requiresEvidence:boolean}
export const REBATE_RULES:RebateRule[]=[
 {id:'streaming-bundle',label:'Streaming + Mobile Bundle Rebate',trigger:'eligible paid streaming membership plus qualifying activated mobile line',reward:'configured account credit/rebate',requiresEvidence:true},
 {id:'device-promo',label:'Eligible Device Rebate',trigger:'qualifying device purchase/activation and completed provider conditions',reward:'provider or TRYAMM promotional credit',requiresEvidence:true},
 {id:'franchise-referral',label:'Dealer/Franchise Activation Reward',trigger:'qualifying activation attributed to an approved dealer',reward:'commission/rebate according to signed program terms',requiresEvidence:true},
]
export const REBATE_TRUTH='No rebate is payable from a button click alone. Eligibility must be derived from verified payment, subscription, activation/provider evidence, program terms and any required waiting/return period.'

export const FRANCHISE_ECONOMICS={
 revenue:['eligible plan margin/revenue share','device/accessory margin','approved activation commissions','business account sales','authorized service/support revenue','eligible marketplace cross-sell'],
 costs:['wholesale/network charges','taxes/fees','payment processing','support','returns/fraud','device inventory','store/agent operations','marketing','insurance/compliance'],
 rule:'Do not publish franchise earnings claims or financial performance representations until reviewed for applicable franchise-disclosure and advertising requirements.',
} as const

export const STREAMING_REBATE_PATH='PAID STREAMING ACCOUNT → QUALIFYING MOBILE ACTIVATION → PROVIDER/PAYMENT EVIDENCE → REBATE ELIGIBILITY → HOLD/RETURN WINDOW → APPROVAL → ACCOUNT CREDIT/PAYOUT → LEDGER → REVERSAL IF REQUIRED'
