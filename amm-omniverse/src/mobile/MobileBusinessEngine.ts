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
 'agency accounts','family teams','guardian-managed youth accounts','referral/growth codes','family savings goals','youth learning rewards',
] as const

export type AccountLane='adult'|'agency'|'family-manager'|'family-member'|'youth'
export type EarningStatus='pending'|'eligible'|'approved'|'payable'|'paid'|'reversed'

export const AGENCY_EARNING_PATH={
 purpose:'Allow approved agencies/dealers/creator teams to grow TRYAMM Mobile and All American Mobile through verified referrals, activations, storefront sales and service work.',
 roles:['agency owner','manager','approved sales agent','creator campaign lead','support/service representative'],
 earningEvents:[
  'verified qualifying mobile activation',
  'approved business-line signup',
  'eligible device/accessory sale',
  'approved creator/mobile campaign conversion',
  'eligible marketplace cross-sell',
  'authorized support/service work where program terms allow',
 ],
 controls:['KYC/business verification where required','signed agency/dealer terms','unique referral/agent code','server-side attribution','carrier/payment evidence','fraud/chargeback hold','commission ledger','tax reporting workflow'],
} as const

export const FAMILY_EARNING_PATH={
 purpose:'Let a household organize shared plans, referrals, family goals and eligible rewards without mixing every member into one unrestricted wallet.',
 roles:['family manager','adult member','youth member'],
 earningEvents:[
  'eligible family referral',
  'qualifying household mobile activation',
  'approved creator/content campaign by an eligible adult',
  'family rebate or loyalty credit',
  'eligible marketplace or service referral',
 ],
 allocation:['household bill credit','family savings goal','approved adult payout','guardian-managed youth benefit'],
 controls:['family manager permissions','per-member visibility','spending limits','no automatic sharing of private messages/content','server-side ledger attribution'],
} as const

export const YOUTH_ACCOUNT_RULES={
 lane:'guardian-managed',
 principles:[
  'Youth accounts require age-appropriate onboarding and guardian controls where required.',
  'No unrestricted adult-style cash-out, credit, investment, crypto, gambling, alcohol, adult marketplace or telecom-admin privileges.',
  'Any youth-earned value stays in a guardian-managed benefit/reward ledger until law, program terms, age and payment-provider rules permit a lawful payout or transfer.',
  'Guardian can approve allowed purchases, savings goals, educational rewards and creator activities.',
  'Private location, phone-number, billing and identity data must be minimized and access-controlled.',
  'Advertising and personalization must use the stricter child/teen policy applicable to the user and jurisdiction.',
 ],
 earningEvents:[
  'learning/skill achievements',
  'age-appropriate creator challenges',
  'family referral attribution where permitted',
  'approved youth sports/game achievements with non-cash or guardian-managed rewards',
  'family-business training tasks that are lawful and age-appropriate',
 ],
 disallowed:['unrestricted cash withdrawal','independent dealer/franchise contract','adult telecom account owner','commission plan requiring adult contracting','financial products not approved for minors'],
} as const

export const FAMILY_CODE_MODEL={
 adultCodes:'Adults/agencies may receive trackable growth/referral codes after eligibility checks.',
 youthCodes:'A youth code may attribute growth or community participation, but legal contracting, commissions and payouts route through the verified guardian/adult program owner unless an approved provider program lawfully supports otherwise.',
 splitRule:'Never let a client-side code alone change legal ownership, equity, commission splits or payable balances. Splits live in server-side approved program records.',
} as const

export type RebateStatus='pending'|'eligible'|'approved'|'paid'|'reversed'
export type RebateRule={id:string;label:string;trigger:string;reward:string;requiresEvidence:boolean}
export const REBATE_RULES:RebateRule[]=[
 {id:'streaming-bundle',label:'Streaming + Mobile Bundle Rebate',trigger:'eligible paid streaming membership plus qualifying activated mobile line',reward:'configured account credit/rebate',requiresEvidence:true},
 {id:'device-promo',label:'Eligible Device Rebate',trigger:'qualifying device purchase/activation and completed provider conditions',reward:'provider or TRYAMM promotional credit',requiresEvidence:true},
 {id:'franchise-referral',label:'Dealer/Franchise Activation Reward',trigger:'qualifying activation attributed to an approved dealer',reward:'commission/rebate according to signed program terms',requiresEvidence:true},
 {id:'family-loyalty',label:'Family Loyalty Credit',trigger:'qualifying household plan/retention event under published program terms',reward:'household bill credit or family goal allocation',requiresEvidence:true},
]
export const REBATE_TRUTH='No rebate is payable from a button click alone. Eligibility must be derived from verified payment, subscription, activation/provider evidence, program terms and any required waiting/return period.'

export const MONEY_SAFETY_PIPELINE='EVENT → ELIGIBILITY → ID/ROLE/AGE/GUARDIAN CHECK → PROVIDER/PAYMENT EVIDENCE → FRAUD/RETURN HOLD → LEDGER → APPROVAL → ADULT PAYOUT OR GUARDIAN-MANAGED YOUTH BENEFIT → TAX/REPORTING → REVERSAL IF REQUIRED'

export const FRANCHISE_ECONOMICS={
 revenue:['eligible plan margin/revenue share','device/accessory margin','approved activation commissions','business account sales','authorized service/support revenue','eligible marketplace cross-sell','agency/dealer program revenue'],
 costs:['wholesale/network charges','taxes/fees','payment processing','support','returns/fraud','device inventory','store/agent operations','marketing','insurance/compliance'],
 rule:'Do not publish franchise earnings claims or financial performance representations until reviewed for applicable franchise-disclosure and advertising requirements.',
} as const

export const STREAMING_REBATE_PATH='PAID STREAMING ACCOUNT → QUALIFYING MOBILE ACTIVATION → PROVIDER/PAYMENT EVIDENCE → REBATE ELIGIBILITY → HOLD/RETURN WINDOW → APPROVAL → ACCOUNT CREDIT/PAYOUT → LEDGER → REVERSAL IF REQUIRED'
