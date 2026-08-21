export type PayoutLane='game-prize'|'sponsor-beneficiary'|'service-share'
export const VERIFIED_PAYOUT_ROUTER={
 lanes:{
  'game-prize':{sourceTable:'game_prize_payouts',basis:'final eligible prize result'},
  'sponsor-beneficiary':{sourceTable:'game_prize_allocations',basis:'eligible net sponsor-race revenue under approved agreement'},
  'service-share':{sourceTable:'service_share_payouts',basis:'verified eligible service revenue under active agreement'},
 },
 commonGates:['server-authoritative source','idempotency key','identity/recipient verification where required','age/guardian/trust controls when applicable','tax/reporting readiness when required','fraud/sanctions checks','refund/chargeback reserve','provider availability'],
 states:['pending','held','approved','submitted','paid','failed','reversed','cancelled'],
 providerContract:['create recipient/onboarding when required','submit payout with idempotency','store provider reference','consume provider webhook','settle only from verified provider event','support reversal/reconciliation'],
 accountingRule:'Keep winner prizes, sponsor-beneficiary allocations, and Pastor Kofi/Servants of Christ service shares in separate ledgers even when they use the same payment provider.',
 sandboxProofs:['$1 game-prize payout','small sponsor-beneficiary allocation','small 10% service-share payout','failed payout retry','refund/chargeback hold','provider reversal'],
} as const
