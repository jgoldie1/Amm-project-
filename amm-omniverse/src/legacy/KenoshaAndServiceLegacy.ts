export const KENOSHA_LEGACY = {
  records: [
    { id:'kenosha-stubbs-legacy', title:"Kenosha Stubbs Legacy", type:'family-legacy', truthState:'family-memory' },
    { id:'kenosha-shelton-memorial', title:"Kenosha Shelton Memorial", type:'memorial', truthState:'family-memory' },
  ],
  uses: ['World Memory memorial chapter','Family Legacy Hub','Immersive memorial exhibit','Movie Box tribute project','All American University oral-history/legacy learning where appropriate'],
  guardrail:'Memorial and family-memory content must remain user/family-authored unless independently sourced; do not present personal memory as externally verified fact.',
} as const

export const PASTOR_KOFI_SERVICE_CONTRACT = {
  programName:'Pastor Kofi / Servants of Christ services',
  configuredShareBps:1000,
  configuredShareLabel:'10%',
  shareBasis:'eligible net program revenue only after the signed agreement defines what counts as revenue, refunds, taxes, processor fees and excluded transactions',
  activationGates:['identity/role verified','signed agreement on file','eligible service/product mapped','payment evidence','refund/chargeback window','server ledger approval','tax/reporting workflow'],
  prohibited:['client-side payout creation','automatic payment from page views','unclear gross-vs-net calculation','youth payout without guardian/legal controls'],
} as const

export const RACE_PODIUM_REWARD_CONTRACT = {
  places:[
    {place:1,label:'1st Place',rewardClass:'champion'},
    {place:2,label:'2nd Place',rewardClass:'runner-up'},
    {place:3,label:'3rd Place',rewardClass:'podium'},
  ],
  eligibleRewards:['Beans','Holo Credit promotional benefit where program terms allow','digital trophy/badge','World Memory record','store/venue perk','eligible adult cash prize only when separately funded, lawful and published before entry'],
  authority:'SERVER RESULT → ANTI-CHEAT/EVIDENCE → FINALIZED RACE → PODIUM → REWARD ELIGIBILITY → LEDGER/ENTITLEMENT → WORLD MEMORY',
  guardrails:['no client-authored winner state','ties follow published rules','cash prizes require separate contest/race terms and jurisdiction review','youth cash benefits route through guardian/legal controls'],
} as const
