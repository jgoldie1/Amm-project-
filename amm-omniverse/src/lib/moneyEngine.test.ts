import { describe, expect, it } from 'vitest'
import { allocateByBps, assertBalanced, designatedEventAllocation, isPayoutEligible, validateSplits } from './moneyEngine'

describe('TRYAMM Money Engine', () => {
  it('requires balanced double-entry postings', () => {
    expect(assertBalanced([
      { accountId: 'cash', side: 'debit', amountMinor: 1000 },
      { accountId: 'creator', side: 'credit', amountMinor: 700 },
      { accountId: 'platform', side: 'credit', amountMinor: 300 },
    ])).toBe(true)
  })

  it('requires accepted split lanes to total 100%', () => {
    expect(validateSplits([
      { participantName: 'Artist', role: 'artist', revenueLane: 'master', shareBps: 7000 },
      { participantName: 'Producer', role: 'producer', revenueLane: 'master', shareBps: 3000 },
    ])).toBe(true)
  })

  it('allocates every cent with deterministic rounding', () => {
    const result = allocateByBps(1001, [
      { participantName: 'Artist', role: 'artist', revenueLane: 'master', shareBps: 5000 },
      { participantName: 'Producer', role: 'producer', revenueLane: 'master', shareBps: 3000 },
      { participantName: 'Writer', role: 'writer', revenueLane: 'master', shareBps: 2000 },
    ])
    expect(result.reduce((sum, row) => sum + row.amountMinor, 0)).toBe(1001)
  })

  it('keeps Kenosha and ministry allocations separate from the remaining event balance', () => {
    expect(designatedEventAllocation(10000)).toEqual({ kenoshaLegacy: 2000, ministry: 1000, remaining: 7000 })
  })

  it('blocks payout until all payout gates are green', () => {
    expect(isPayoutEligible({ state: 'payable', transfersEnabled: true, payoutHold: false, taxStatus: 'complete', amountMinor: 2500 })).toBe(true)
    expect(isPayoutEligible({ state: 'payable', transfersEnabled: false, payoutHold: false, taxStatus: 'complete', amountMinor: 2500 })).toBe(false)
  })
})
