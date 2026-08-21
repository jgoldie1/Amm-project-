export const MONEY_ENGINE_HANDOFF = {
  supportedSources:['game-prize','race-prize','service-share','creator-earnings','agency-commission'],
  states:['eligible','held','approved','submitted','paid','failed','reversed','cancelled'],
  requiredEnvelope:['sourceType','sourceId','payeeRef','amountCents','currency','idempotencyKey','gateEvidence'],
  gates:['identity-or-business-verification-when-required','age/guardian-eligibility','tax-information-when-required','fraud/sanctions-clear','source-funded','refund/chargeback-reserve-applied','provider-account-ready'],
  providerRules:['server-only credentials','idempotent submission','webhook settlement is authoritative','provider failure never marks paid','reversal references original payout'],
  sandboxProofs:{
    gamePrize:'SANDBOX $1 FUNDED PRIZE → SERVER RESULT → ELIGIBILITY → PAYOUT LEDGER → PROVIDER TEST PAYOUT → WEBHOOK SETTLED → REVERSAL TEST',
    pastorKofi:'SANDBOX $1 ELIGIBLE SERVICE → PAYMENT EVIDENCE → AGREEMENT BASIS → 10% SHARE → SERVICE LEDGER → PROVIDER TEST PAYOUT → WEBHOOK SETTLED → REVERSAL TEST'
  }
} as const
