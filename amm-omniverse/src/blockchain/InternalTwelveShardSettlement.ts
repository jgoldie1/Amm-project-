export const INTERNAL_CHAIN_MODE = {
  name: 'TRYAMM Internal Settlement Chain',
  layer: 'L2-standalone-private',
  shards: 12,
  publicTokenTrading: false,
  fiatCustody: false,
  purpose: 'Record finalized platform economic events, provenance, rewards, rights, splits and World Memory proofs until a future public-network launch is legally and operationally ready.',
} as const

export type InternalEventClass =
  | 'creator-earning'
  | 'game-prize'
  | 'sponsor-beneficiary-allocation'
  | 'service-share'
  | 'holo-credit-ledger-proof'
  | 'sample-rights-proof'
  | 'movie-provenance'
  | 'world-memory-proof'
  | 'agency-commission'
  | 'marketplace-settlement-proof'

export const SHARD_MAP: Record<number, InternalEventClass[]> = {
  0:['creator-earning'],
  1:['game-prize'],
  2:['sponsor-beneficiary-allocation'],
  3:['service-share'],
  4:['holo-credit-ledger-proof'],
  5:['sample-rights-proof'],
  6:['movie-provenance'],
  7:['world-memory-proof'],
  8:['agency-commission'],
  9:['marketplace-settlement-proof'],
  10:['creator-earning','agency-commission'],
  11:['game-prize','service-share','marketplace-settlement-proof'],
}

export const INTERNAL_SETTLEMENT_PIPELINE = [
  'SOURCE SYSTEM FINALIZES EVENT',
  'AUTHORIZATION + ELIGIBILITY CHECK',
  'MONEY ENGINE / RIGHTS ENGINE / GAME AUTHORITY VERIFIES',
  'CANONICAL EVENT HASH',
  'ROUTE TO ONE OF 12 SHARDS',
  'WRITE APPEND-ONLY INTERNAL RECORD',
  'ANCHOR CROSS-SHARD CHECKPOINT',
  'EXTERNAL PAYMENT PROVIDER SETTLES FIAT WHEN APPLICABLE',
  'WRITE SETTLEMENT/REVERSAL PROOF BACK TO INTERNAL CHAIN',
  'EXPOSE READ-ONLY RECEIPT TO USER',
] as const

export const PUBLIC_LAUNCH_GATES = [
  'production migrations applied and reconciled',
  'real payout/payment credentials verified',
  'identity/tax onboarding operational',
  'independent security audit',
  'load/finality/recovery testing across all 12 shards',
  'key-management and validator governance approved',
  'legal/regulatory review of any public token or transferable asset',
  'treasury/accounting treatment approved',
  'incident response and rollback/fork policy tested',
  'public-network funding and operating runway secured',
] as const

export const USER_EXPERIENCE = {
  teach: 'Show plain-language receipts explaining why a reward, split, rights clearance or payout exists.',
  grow: 'Use verified history for creator tiers, reputation, agency performance, learning credentials and World Memory.',
  sustain: 'Keep platform economics auditable before public-chain costs and token complexity are introduced.',
  truth: 'Internal-chain records prove TRYAMM state transitions; they do not themselves mean fiat has been paid or that a public crypto asset exists.',
} as const
