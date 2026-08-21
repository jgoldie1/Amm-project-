export const OMNICARE_360 = {
  name:'OmniCare 360',
  purpose:'TRYAMM care-navigation and benefits/service coordination layer.',
  ready:['care-navigation UI','provider/service directory adapters','appointment/support intake','benefit-resource education','accessibility preferences','consent/audit trail','AI call-center routing'],
  regulatedGates:['do not diagnose or prescribe','licensed clinical care requires licensed provider integration','insurance enrollment/advice requires authorized/licensed workflows where applicable','HIPAA/privacy/security review before protected-health-information workflows','emergency routing must hand off to local emergency services/provider instructions'],
  pathway:'USER NEED → CONSENT → TRIAGE CATEGORY → NON-CLINICAL NAVIGATION OR LICENSED PROVIDER HANDOFF → FOLLOW-UP → WORLD/LIFE MEMORY WITH MINIMUM NECESSARY DATA',
} as const

export const OMNICASH = {
  name:'OmniCash',
  purpose:'Financial operating layer for balances, bills, rewards, eligible payouts and marketplace/business money flows.',
  lanes:['household budget','business ledger','creator earnings','agency commissions','game/race prizes','ministry/service shares','rebates','mobile bill credits','marketplace settlement'],
  rules:['no browser-side balance minting','real money requires verified payment/payout provider','separate Holo Credits/Beans from fiat balances','KYC/tax/provider gates where required','chargeback/refund/reversal support','youth money guardian-controlled'],
  pathway:'ELIGIBLE EVENT → EVIDENCE → MONEY ENGINE → LEDGER → FRAUD/COMPLIANCE → PROVIDER → SETTLEMENT/REVERSAL → REPORTING',
} as const

export const WFH_AI_CALL_CENTER = {
  name:'TRYAMM Work-From-Home Center',
  jobs:['customer support','sales/lead qualification','appointment setting','marketplace support','mobile support','creator/agency support','University enrollment support','OmniCare navigation support','ministry/community service support'],
  workerTools:['secure agent login','availability/status','queue routing','script/knowledge cards','AI copilot','translation','accessibility','call/chat/email workspace','QA/coaching','time/shift records','earnings eligibility','supervisor escalation'],
  antiLoop:['repeat-intent detector','repeat-answer detector','tool-failure counter','frustration detector','silence timeout','max unresolved turns','change-strategy action','human transfer','callback','text/chat fallback','previous menu','start over','end interaction'],
  doNotCall:['consent/source tracking','internal suppression list','federal/state DNC workflow where applicable','time-zone calling windows','opt-out immediately honored','campaign audit log'],
  truth:'Telephony, STT/TTS, real phone numbers and outbound calling remain provider-credential and compliance gated.',
} as const

export const SERVANTS_OF_CHRIST_MINISTRIES = {
  name:'Servants of Christ Ministries',
  purpose:'Faith/community service lane connected to TRYAMM without mixing ministry accounting into game currency.',
  modules:['service requests','community outreach','events','volunteer coordination','media/streaming','education','care-navigation referrals','ministry storefront where appropriate','verified service revenue-share ledger'],
  pastorKofiShare:{bps:1000,basis:'eligible net ministry/service revenue only under executed agreement',requires:['agreement','eligible-revenue definition','payment evidence','refund/chargeback reserve','ledger approval','tax/reporting review']},
  accountingRule:'Ministry/service share, game prizes, Holo Credits, Beans and creator earnings remain separate ledgers.',
} as const

export const LIFE_ECONOMY_LOOP = 'LIVE A LIFE → GET A JOB → WORK/LEARN → SHOP → START A BUSINESS → SOURCE PRODUCTS → HIRE PEOPLE → SERVE CUSTOMERS → MAKE OR LOSE MONEY → ACCESS CARE/FINANCIAL SUPPORT → GIVE/SERVE COMMUNITY → EXPAND → WORLD CHANGES → RETURN → BUILD LEGACY'
