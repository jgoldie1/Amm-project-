export type GateState='missing'|'coded'|'smoke-locked'|'ci-green'|'sandbox-proven'|'production-proven'
export type SubsystemState={id:string;state:GateState;next:string;proofRefs:string[]}

export const CONVERGENCE_GOVERNOR={
  principle:'Never rebuild a subsystem merely because the user says continue. Advance the existing subsystem to its next unmet proof gate.',
  stateOrder:['missing','coded','smoke-locked','ci-green','sandbox-proven','production-proven'] as GateState[],
  rules:[
    'If subsystem is coded, do not create a duplicate contract; add or run its smoke proof.',
    'If smoke-locked, do not add parallel architecture; run/fix CI, security and convergence.',
    'If CI-green, advance to Quantum Sandbox provider/money/rights/device proof.',
    'If sandbox-proven, advance to production migration/configuration and real-account proof.',
    'If production-proven, mark locked and route continue to the next incomplete subsystem.',
    'A new feature request may extend a locked subsystem, but must reuse its canonical ledger, identity, rights and World Memory contracts.',
    'Only one canonical implementation per capability; duplicate migrations/services/UI paths are defects and must be consolidated.',
  ],
  lockedDomains:['identity','World Memory','Holo Credits','Beans','creator earnings','agency commissions','race/game prizes','service shares','sample rights','Movie Box','HoloArena'],
} as const

export const QUANTUM_SANDBOX_GATES={
  money:['$1 test funding','ledger entry','provider submission','settlement','refund/reversal','idempotency retry','fraud hold'],
  prizes:['fund event','server result','anti-cheat','podium finalization','winner payout','20% beneficiary allocation','reversal'],
  serviceShares:['eligible service revenue','10% calculation','ledger allocation','provider payout','refund/reversal'],
  musicRights:['sample submit','fingerprint result','possible match','review','clearance','blocked release','cleared release'],
  holoCredits:['purchase verification','grant','spend','entitlement','restore','refund','guardian limit','fraud hold'],
  movieBox:['record','save','reopen','Lottie 2.0','rights gate','export','failed-render recovery'],
  holoArena:['booking','check-in','calibration','session','operator pause/abort','World Memory','highlight','checkout'],
} as const

export const NEXT_GATE_MATRIX:SubsystemState[]=[
 {id:'four-games',state:'smoke-locked',next:'CI/security/convergence then real gameplay E2E',proofRefs:['holoarena-smoke']},
 {id:'race-game-prizes',state:'coded',next:'smoke lock then $1 Quantum Sandbox payout/reversal',proofRefs:['game_prize_payouts']},
 {id:'beneficiary-20pct',state:'coded',next:'sandbox sponsor revenue allocation proof',proofRefs:['game_prize_allocations']},
 {id:'pastor-kofi-10pct',state:'coded',next:'sandbox eligible-service revenue allocation and payout proof',proofRefs:['service-share-contract']},
 {id:'holo-credits',state:'coded',next:'receipt/payment verification sandbox',proofRefs:['holo_credit_ledger']},
 {id:'sample-rights',state:'coded',next:'fingerprint provider adapter + reviewer sandbox',proofRefs:['music_sample_submissions']},
 {id:'movie-box',state:'coded',next:'record/save/reopen/export E2E',proofRefs:['MOVIE_BOX_CONTRACT']},
 {id:'holoarena',state:'smoke-locked',next:'CI then hardware/venue sandbox proof',proofRefs:['holoarena-smoke']},
]

export function nextUnmetGate(id:string){const row=NEXT_GATE_MATRIX.find(x=>x.id===id);return row?row.next:'audit canonical subsystem before adding code'}
