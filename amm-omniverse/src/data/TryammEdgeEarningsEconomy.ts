export type EdgeEarningTier='pocket'|'workstation'|'managed-edge'|'cloud-partner'

export const TRYAMM_EDGE_EARNINGS_ECONOMY={
  product:'TRYAMM Global Edge Grid Earnings',
  state:'BUILDING',
  truthBoundary:'Earnings require real customer demand, verified completed work and production-certified metering. Installing the app alone does not create income.',
  defaultSplitBps:{nodeOwner:7000,tryammPlatform:2000,networkReserve:1000},
  tiers:{
    pocket:{jobs:['cache-sync','world-state-sync','offline-reconcile','telemetry-aggregate','light-ai','media-thumbnail'],expectedRelativeValue:'LOWER',reason:'battery/background/thermal and store-policy limits make phones best for small edge jobs'},
    workstation:{jobs:['light-ai','media-thumbnail','asset-optimize','batch-processing','regional-cache'],expectedRelativeValue:'MEDIUM-HIGH',reason:'more CPU/GPU/RAM and longer availability'},
    'managed-edge':{jobs:['AI inference','media pipelines','asset optimization','regional cache','business workloads','approved relays'],expectedRelativeValue:'HIGH',reason:'AI Cafe / Business Server nodes can provide managed availability and stronger isolation'},
    'cloud-partner':{jobs:['authoritative workloads','large inference','rendering','global control-plane'],expectedRelativeValue:'VARIABLE',reason:'used as resilient backstop and heavy-compute tier'},
  },
  payoutRules:[
    'server-authoritative verified job receipt required',
    'no payment for failed/rejected/duplicate jobs',
    'risk/fraud review may hold settlement',
    'refund/reversal path must reverse related earnings',
    'tax/KYC/payout-provider requirements apply before cash withdrawal where legally required',
    'no cryptocurrency mining required for consumer participation',
    'VPN/private-relay traffic is not sold or monetized as user browsing data',
  ] as const,
  appStoreSafety:['opt-in contribution','visible disable control','battery-aware scheduling','no hidden background mining','no deceptive battery/network use'] as const,
} as const

export function splitEdgeRevenue(grossCents:number,split=TRYAMM_EDGE_EARNINGS_ECONOMY.defaultSplitBps){
  const gross=Math.max(0,Math.round(grossCents))
  const owner=Math.floor(gross*split.nodeOwner/10000)
  const platform=Math.floor(gross*split.tryammPlatform/10000)
  const reserve=gross-owner-platform
  return{grossCents:gross,nodeOwnerCents:owner,tryammPlatformCents:platform,networkReserveCents:reserve}
}