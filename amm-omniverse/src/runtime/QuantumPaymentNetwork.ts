export type PaymentRail = {
  key: string
  name: string
  currency: string
  status: 'live' | 'sandbox' | 'gated' | 'offline'
  feeBps: number
  fixedFeeMinor: number
  settlementSeconds: number
  regulated: boolean
}

export type PaymentIntent = {
  id: string
  payerDid: string
  payeeDid: string
  amountMinor: number
  currency: string
  purpose: string
  createdAt: number
  idempotencyKey: string
}

export type PaymentRoute = {
  rail: PaymentRail
  estimatedFeeMinor: number
  estimatedNetMinor: number
  score: number
}

const rails = new Map<string, PaymentRail>()
const seen = new Set<string>()

export function registerPaymentRail(rail: PaymentRail) {
  rails.set(rail.key, rail)
  return rail
}

export function createPaymentIntent(input: Omit<PaymentIntent, 'id' | 'createdAt'>) {
  if (input.amountMinor <= 0) throw new Error('Payment amount must be positive')
  if (!input.idempotencyKey.trim()) throw new Error('Idempotency key required')
  const id = `qpay_${Math.abs(hash(`${input.payerDid}:${input.payeeDid}:${input.idempotencyKey}`)).toString(36)}`
  return { ...input, id, createdAt: Date.now() }
}

export function routePayment(intent: PaymentIntent) {
  return [...rails.values()]
    .filter(r => r.currency === intent.currency && (r.status === 'live' || r.status === 'sandbox'))
    .map(rail => {
      const estimatedFeeMinor = Math.ceil(intent.amountMinor * rail.feeBps / 10_000) + rail.fixedFeeMinor
      return {
        rail,
        estimatedFeeMinor,
        estimatedNetMinor: Math.max(0, intent.amountMinor - estimatedFeeMinor),
        score: 1000 - estimatedFeeMinor - Math.round(rail.settlementSeconds / 60) - (rail.status === 'sandbox' ? 500 : 0),
      } satisfies PaymentRoute
    })
    .sort((a, b) => b.score - a.score)
}

export function authorizePayment(intent: PaymentIntent) {
  if (seen.has(intent.idempotencyKey)) throw new Error('Duplicate payment prevented')
  const route = routePayment(intent)[0]
  if (!route) throw new Error('No approved payment rail available')
  seen.add(intent.idempotencyKey)
  return { intent, route, authorizedAt: Date.now(), status: route.rail.status === 'live' ? 'authorized' : 'sandbox-authorized' as const }
}

function hash(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i++) h = Math.imul(31, h) + input.charCodeAt(i) | 0
  return h
}

registerPaymentRail({ key: 'internal-ledger', name: 'TRYAMM Internal Ledger', currency: 'USD', status: 'sandbox', feeBps: 0, fixedFeeMinor: 0, settlementSeconds: 1, regulated: false })
registerPaymentRail({ key: 'stripe', name: 'Stripe', currency: 'USD', status: 'sandbox', feeBps: 290, fixedFeeMinor: 30, settlementSeconds: 172800, regulated: true })
