'use strict'

const DEFAULT_GUARDRAILS = Object.freeze({
  minPlatformMarginPct: 15,
  refundReservePct: 5,
  fraudReservePct: 3,
  taxReservePct: 10,
  maxReferralSharePct: 20,
  maxCampaignBudgetCents: 500000,
  payoutHoldHours: 72,
})

const EARNING_TYPES = Object.freeze({
  VERIFIED_REFERRAL: 'verified_referral',
  AFFILIATE_SALE: 'affiliate_sale',
  APPROVED_MICROTASK: 'approved_microtask',
  CREATOR_ACTIVITY: 'creator_activity',
  LIVE_GIFT_SHARE: 'live_gift_share',
  HOLOLIVE_HOST_COMMISSION: 'hololive_host_commission',
  MARKETPLACE_SALE: 'marketplace_sale',
  WORKFORCE_TASK: 'workforce_task',
  BUG_BOUNTY: 'bug_bounty',
  EDUCATION_BOUNTY: 'education_bounty',
})

function money(cents) { return Math.max(0, Math.round(Number(cents) || 0)) }
function pct(cents, percentage) { return money(cents * (Number(percentage || 0) / 100)) }

function buildFundedCampaign(input = {}, guardrails = DEFAULT_GUARDRAILS) {
  const budgetCents = money(input.budgetCents)
  const rewardCents = money(input.rewardCents)
  if (!input.sponsorId) throw new Error('sponsorId is required')
  if (!Object.values(EARNING_TYPES).includes(input.earningType)) throw new Error('Unsupported earning type')
  if (budgetCents <= 0 || rewardCents <= 0) throw new Error('Campaign budget and reward must be positive')
  if (budgetCents > guardrails.maxCampaignBudgetCents) throw new Error('Campaign exceeds configured budget guardrail')
  if (rewardCents > budgetCents) throw new Error('Reward cannot exceed funded campaign budget')
  return {
    sponsorId: input.sponsorId,
    earningType: input.earningType,
    budgetCents,
    rewardCents,
    maxCompletions: Math.floor(budgetCents / rewardCents),
    status: 'funded_pending_verification',
    requiresVerification: true,
    payoutHoldHours: guardrails.payoutHoldHours,
  }
}

function settleEarning(input = {}, guardrails = DEFAULT_GUARDRAILS) {
  const grossCents = money(input.grossCents)
  const providerFeeCents = money(input.providerFeeCents)
  const taxesCollectedCents = money(input.taxesCollectedCents)
  const refundReserveCents = pct(grossCents, input.refundReservePct ?? guardrails.refundReservePct)
  const fraudReserveCents = pct(grossCents, input.fraudReservePct ?? guardrails.fraudReservePct)
  const taxReserveCents = pct(grossCents, input.taxReservePct ?? guardrails.taxReservePct)
  const distributableCents = money(grossCents - providerFeeCents - taxesCollectedCents - refundReserveCents - fraudReserveCents - taxReserveCents)
  const platformFloorCents = pct(distributableCents, input.minPlatformMarginPct ?? guardrails.minPlatformMarginPct)
  const requestedWorkerPayoutCents = money(input.requestedWorkerPayoutCents)
  const maxSafePayoutCents = money(distributableCents - platformFloorCents)
  const workerPayoutCents = Math.min(requestedWorkerPayoutCents, maxSafePayoutCents)
  const platformMarginCents = money(distributableCents - workerPayoutCents)
  return {
    grossCents, providerFeeCents, taxesCollectedCents, refundReserveCents, fraudReserveCents, taxReserveCents,
    distributableCents, workerPayoutCents, platformMarginCents, maxSafePayoutCents,
    payoutReducedForSafety: workerPayoutCents < requestedWorkerPayoutCents,
    safeToSpendCents: platformMarginCents,
  }
}

function starterMissionBundle() {
  return [
    { earningType: EARNING_TYPES.VERIFIED_REFERRAL, rewardCents: 200, label: 'Eligible verified referral', fundedOnly: true },
    { earningType: EARNING_TYPES.AFFILIATE_SALE, rewardCents: 500, label: 'Qualified affiliate sale', fundedOnly: true },
    { earningType: EARNING_TYPES.APPROVED_MICROTASK, rewardCents: 800, label: 'Approved microtask', fundedOnly: true },
    { earningType: EARNING_TYPES.CREATOR_ACTIVITY, rewardCents: 500, label: 'Qualified creator campaign activity', fundedOnly: true },
  ]
}

module.exports = { DEFAULT_GUARDRAILS, EARNING_TYPES, buildFundedCampaign, settleEarning, starterMissionBundle }
