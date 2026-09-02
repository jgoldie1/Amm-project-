import { routePaymentRails, type PaymentMethod, type PaymentRailId } from './paymentRails'

export type AniyahProvider = PaymentRailId
export type TransferStatus = 'draft' | 'quoted' | 'ready' | 'blocked' | 'submitted' | 'processing' | 'settled' | 'failed'

export type AniyahQuote = {
  id: string
  provider: AniyahProvider
  fallbackProviders: AniyahProvider[]
  sourceCurrency: string
  destinationCurrency: string
  sendAmount: number
  platformFee: number
  providerFeeEstimate: number
  fxRate: number
  recipientAmount: number
  status: TransferStatus
  mode: 'sandbox' | 'live-gated'
  reasons: string[]
}

const corridorMap: Record<string, AniyahProvider[]> = {
  'USD:USD': ['stripe','flutterwave','paystack'],
  'USD:NGN': ['flutterwave','paystack','fincra','kora','monnify','squad'],
  'USD:GHS': ['flutterwave','paystack','fincra','kora','tingg'],
  'USD:KES': ['mpesa','flutterwave','paystack','fincra','kora','tingg'],
  'USD:ZAR': ['paystack','flutterwave','fincra','kora','seerbit'],
  'NGN:NGN': ['paystack','monnify','squad','flutterwave','moniepoint','opay','paga','remita','fincra','kora','seerbit'],
  'GHS:GHS': ['paystack','flutterwave','tingg','fincra','kora','seerbit'],
  'KES:KES': ['mpesa','paystack','flutterwave','tingg','fincra','kora','seerbit'],
  'ZAR:ZAR': ['paystack','flutterwave','fincra','kora','seerbit'],
}

export function aniyahPlatformFee(amount:number){
  if(!Number.isFinite(amount) || amount <= 0) return 0
  return Math.min(5, Math.max(.5, Number((amount * .01).toFixed(2))))
}

export function getAniyahProviderCandidates(sourceCurrency:string,destinationCurrency:string,method?:PaymentMethod):AniyahProvider[]{
  const source = sourceCurrency.toUpperCase()
  const destination = destinationCurrency.toUpperCase()
  const key = `${source}:${destination}`
  const mapped = corridorMap[key]
  if(mapped){
    if(!method) return mapped
    const compatible = new Set(routePaymentRails({currency:destination,method}).map(rail=>rail.id))
    return mapped.filter(id=>compatible.has(id))
  }
  return routePaymentRails({currency:destination,method}).map(rail=>rail.id)
}

export function chooseAniyahProvider(sourceCurrency:string,destinationCurrency:string,method?:PaymentMethod):AniyahProvider{
  return getAniyahProviderCandidates(sourceCurrency,destinationCurrency,method)[0] ?? 'stripe'
}

export function buildAniyahQuote(input:{amount:number;sourceCurrency:string;destinationCurrency:string;fxRate?:number;providerFeeEstimate?:number;method?:PaymentMethod}):AniyahQuote{
  const amount = Number(input.amount)
  const sourceCurrency = input.sourceCurrency.toUpperCase()
  const destinationCurrency = input.destinationCurrency.toUpperCase()
  const candidates = getAniyahProviderCandidates(sourceCurrency,destinationCurrency,input.method)
  const provider = candidates[0] ?? 'stripe'
  const fxRate = Number.isFinite(input.fxRate) && Number(input.fxRate) > 0 ? Number(input.fxRate) : 1
  const platformFee = aniyahPlatformFee(amount)
  const providerFeeEstimate = Math.max(0, Number(input.providerFeeEstimate ?? 0))
  const net = Math.max(0, amount - platformFee - providerFeeEstimate)
  const recipientAmount = Number((net * fxRate).toFixed(2))
  const reasons:string[] = []
  if(amount <= 0) reasons.push('Enter a transfer amount greater than zero.')
  if(!corridorMap[`${sourceCurrency}:${destinationCurrency}`]) reasons.push('Corridor needs provider verification before live transfer.')
  if(!candidates.length) reasons.push('No adapter-ready provider supports the selected payment method and destination currency.')
  return {
    id: crypto.randomUUID(), provider, fallbackProviders:candidates.slice(1), sourceCurrency, destinationCurrency, sendAmount: amount,
    platformFee, providerFeeEstimate, fxRate, recipientAmount,
    status: reasons.length ? 'blocked' : 'quoted', mode:'sandbox', reasons,
  }
}

export function transferFingerprint(quote:AniyahQuote,recipient:string){
  return `${quote.id}:${quote.provider}:${quote.sourceCurrency}:${quote.destinationCurrency}:${quote.sendAmount.toFixed(2)}:${recipient.trim().toLowerCase()}`
}

export const ANIYAH_PRODUCTION_BOUNDARY = 'Real-money submission is disabled in the game client. A server-side provider adapter, verified KYC/KYB/AML/sanctions gates, provider credentials, signed webhook verification, idempotency, authoritative ledger settlement, reconciliation and explicit user confirmation are required before live transfer.'
