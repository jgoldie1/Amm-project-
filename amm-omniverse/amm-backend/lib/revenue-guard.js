const DEFAULT_CREATOR_BPS = Number(process.env.DEFAULT_CREATOR_BPS || 7000)
const MIN_PLATFORM_BPS = Number(process.env.MIN_PLATFORM_BPS || 1000)
const REFUND_RESERVE_BPS = Number(process.env.REFUND_RESERVE_BPS || 500)
const FRAUD_RESERVE_BPS = Number(process.env.FRAUD_RESERVE_BPS || 300)
const TAX_RESERVE_BPS = Number(process.env.TAX_RESERVE_BPS || 0)

function clampBps(v){ return Math.max(0, Math.min(10000, Number(v||0))) }

function calculateProtectedSplit({grossAmount, providerFee=0, appStoreFee=0, taxesCollected=0, creatorBps=DEFAULT_CREATOR_BPS, otherContractualBps=0}){
  const gross = Math.max(0, Number(grossAmount)||0)
  const externalCosts = Math.max(0, Number(providerFee)||0) + Math.max(0, Number(appStoreFee)||0) + Math.max(0, Number(taxesCollected)||0)
  const collectible = Math.max(0, gross - externalCosts)
  const refundReserve = collectible * clampBps(REFUND_RESERVE_BPS) / 10000
  const fraudReserve = collectible * clampBps(FRAUD_RESERVE_BPS) / 10000
  const taxReserve = collectible * clampBps(TAX_RESERVE_BPS) / 10000
  const distributable = Math.max(0, collectible - refundReserve - fraudReserve - taxReserve)
  const contractualBps = clampBps(creatorBps) + clampBps(otherContractualBps)
  if (contractualBps > 10000 - clampBps(MIN_PLATFORM_BPS)) throw new Error('Configured contractual shares violate platform minimum margin')
  const creator = distributable * clampBps(creatorBps) / 10000
  const otherContractual = distributable * clampBps(otherContractualBps) / 10000
  const platform = Math.max(0, distributable - creator - otherContractual)
  return {gross, externalCosts, collectible, refundReserve, fraudReserve, taxReserve, distributable, creator, otherContractual, platform}
}

const IMMEDIATE_EARNING_CHANNELS = [
  'live.creator_gifts',
  'live.tips',
  'marketplace.creator_sales',
  'marketplace.affiliate_commission',
  'hololive.host_commission',
  'starverse.paid_event_share',
  'workforce.completed_task',
  'creator.services',
]

const AVALANCHE_DRIP_POLICY = {
  network: 'Avalanche Fuji/Testnet or approved TRYAMM testnet L1',
  hasCashValue: false,
  purpose: ['developer onboarding','wallet testing','smart-contract testing','education','sandbox missions'],
  protections: ['rate-limit','captcha','one-wallet-window','abuse monitoring','dedicated faucet wallet','never use production treasury key'],
  warning: 'Testnet faucet tokens have no monetary value and are not user earnings.'
}

module.exports={calculateProtectedSplit,IMMEDIATE_EARNING_CHANNELS,AVALANCHE_DRIP_POLICY}
