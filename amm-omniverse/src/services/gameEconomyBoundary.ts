export type GameRewardKind = 'xp' | 'game_credits' | 'cosmetic' | 'eligible_cash_reward'

export interface GameRewardIntent {
  intentId: string
  userId: string
  gameId: string
  missionId: string
  kind: GameRewardKind
  amount: number
  currency?: string
  serverEvidenceRef?: string
}

export interface RewardDecision {
  payable: boolean
  destination: 'game_state' | 'money_engine' | 'blocked'
  reason: string
}

export function evaluateGameReward(intent: GameRewardIntent): RewardDecision {
  if (!Number.isFinite(intent.amount) || intent.amount < 0) {
    return { payable: false, destination: 'blocked', reason: 'Invalid reward amount.' }
  }
  if (intent.kind === 'xp' || intent.kind === 'game_credits' || intent.kind === 'cosmetic') {
    return { payable: false, destination: 'game_state', reason: 'Gameplay rewards are non-withdrawable progression.' }
  }
  if (!intent.serverEvidenceRef) {
    return { payable: false, destination: 'blocked', reason: 'Real-value rewards require authoritative server evidence.' }
  }
  if (!intent.currency) {
    return { payable: false, destination: 'blocked', reason: 'Real-value rewards require a currency.' }
  }
  return { payable: true, destination: 'money_engine', reason: 'Eligible cash reward must continue through anti-cheat, eligibility, idempotency, Money Engine, ledger and internal-chain evidence.' }
}

export const GET_PAID_TO_PLAY_PIPELINE = [
  'server_game_result',
  'anti_cheat',
  'duplicate_check',
  'age_and_jurisdiction_eligibility',
  'security_and_sanctions_gate',
  'reward_intent',
  'money_engine',
  'double_entry_ledger',
  'internal_blockchain_receipt',
  'payable_earnings',
] as const

export const CLIENT_GAME_CASH_LABEL = 'Game Credits'
