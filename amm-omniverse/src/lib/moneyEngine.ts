export type MoneySide = 'debit' | 'credit'
export type EarningsState = 'pending_settlement' | 'cleared' | 'held' | 'payable' | 'paid' | 'reversed'

export type Split = {
  participantId?: string
  participantName: string
  role: string
  revenueLane: string
  shareBps: number
}

export type PostingInput = {
  accountId: string
  side: MoneySide
  amountMinor: number
}

export function assertBalanced(postings: PostingInput[]) {
  const total = postings.reduce((sum, p) => sum + (p.side === 'debit' ? p.amountMinor : -p.amountMinor), 0)
  if (total !== 0) throw new Error(`Unbalanced journal: ${total}`)
  if (postings.some(p => !Number.isInteger(p.amountMinor) || p.amountMinor <= 0)) throw new Error('Postings require positive integer minor units')
  return true
}

export function validateSplits(splits: Split[]) {
  const byLane = new Map<string, number>()
  for (const split of splits) {
    if (!Number.isInteger(split.shareBps) || split.shareBps < 0 || split.shareBps > 10000) throw new Error('Invalid share_bps')
    byLane.set(split.revenueLane, (byLane.get(split.revenueLane) ?? 0) + split.shareBps)
  }
  for (const [lane, total] of byLane) {
    if (total !== 10000) throw new Error(`Split lane ${lane} totals ${total} bps, expected 10000`)
  }
  return true
}

export function allocateByBps(amountMinor: number, splits: Split[]) {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) throw new Error('Amount must be integer minor units')
  validateSplits(splits)
  const raw = splits.map((s, i) => ({ i, split: s, exact: amountMinor * s.shareBps / 10000 }))
  const result = raw.map(x => ({ ...x.split, amountMinor: Math.floor(x.exact), remainder: x.exact - Math.floor(x.exact) }))
  let missing = amountMinor - result.reduce((sum, x) => sum + x.amountMinor, 0)
  const order = [...result.keys()].sort((a, b) => result[b].remainder - result[a].remainder)
  for (let n = 0; n < missing; n++) result[order[n % order.length]].amountMinor += 1
  return result.map(({ remainder, ...rest }) => rest)
}

export function designatedEventAllocation(definedNetMinor: number) {
  if (!Number.isInteger(definedNetMinor) || definedNetMinor < 0) throw new Error('definedNetMinor must be a non-negative integer')
  const kenoshaLegacy = Math.floor(definedNetMinor * 0.20)
  const ministry = Math.floor(definedNetMinor * 0.10)
  const remaining = definedNetMinor - kenoshaLegacy - ministry
  return { kenoshaLegacy, ministry, remaining }
}

export function isPayoutEligible(input: {
  state: EarningsState
  transfersEnabled: boolean
  payoutHold: boolean
  taxStatus: string
  amountMinor: number
}) {
  return input.state === 'payable' && input.transfersEnabled && !input.payoutHold && input.taxStatus !== 'blocked' && input.amountMinor > 0
}
