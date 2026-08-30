export type AniyahProvider = 'stripe' | 'flutterwave' | 'paystack'
export type TransferStatus = 'draft' | 'quoted' | 'ready' | 'blocked' | 'submitted' | 'processing' | 'settled' | 'failed'

export type AniyahQuote = {
  id: string
  provider: AniyahProvider
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
  'USD:USD': ['stripe','flutterwave'],
  'USD:NGN': ['flutterwave','paystack'],
  'USD:GHS': ['flutterwave','paystack'],
  'USD:KES': ['flutterwave'],
  'USD:ZAR': ['flutterwave'],
  'NGN:NGN': ['paystack','flutterwave'],
  'GHS:GHS': ['paystack','flutterwave'],
}

export function aniyahPlatformFee(amount:number){
  if(!Number.isFinite(amount) || amount <= 0) return 0
  return Math.min(5, Math.max(.5, Number((amount * .01).toFixed(2))))
}

export function chooseAniyahProvider(sourceCurrency:string,destinationCurrency:string):AniyahProvider{
  const key = `${sourceCurrency.toUpperCase()}:${destinationCurrency.toUpperCase()}`
  return corridorMap[key]?.[0] ?? 'stripe'
}

export function buildAniyahQuote(input:{amount:number;sourceCurrency:string;destinationCurrency:string;fxRate?:number;providerFeeEstimate?:number}):AniyahQuote{
  const amount = Number(input.amount)
  const sourceCurrency = input.sourceCurrency.toUpperCase()
  const destinationCurrency = input.destinationCurrency.toUpperCase()
  const provider = chooseAniyahProvider(sourceCurrency,destinationCurrency)
  const fxRate = Number.isFinite(input.fxRate) && Number(input.fxRate) > 0 ? Number(input.fxRate) : 1
  const platformFee = aniyahPlatformFee(amount)
  const providerFeeEstimate = Math.max(0, Number(input.providerFeeEstimate ?? 0))
  const net = Math.max(0, amount - platformFee - providerFeeEstimate)
  const recipientAmount = Number((net * fxRate).toFixed(2))
  const reasons:string[] = []
  if(amount <= 0) reasons.push('Enter a transfer amount greater than zero.')
  if(!corridorMap[`${sourceCurrency}:${destinationCurrency}`]) reasons.push('Corridor needs provider verification before live transfer.')
  return {
    id: crypto.randomUUID(), provider, sourceCurrency, destinationCurrency, sendAmount: amount,
    platformFee, providerFeeEstimate, fxRate, recipientAmount,
    status: reasons.length ? 'blocked' : 'quoted', mode:'sandbox', reasons,
  }
}

export function transferFingerprint(quote:AniyahQuote,recipient:string){
  return `${quote.id}:${quote.provider}:${quote.sourceCurrency}:${quote.destinationCurrency}:${quote.sendAmount.toFixed(2)}:${recipient.trim().toLowerCase()}`
}

export const ANIYAH_PRODUCTION_BOUNDARY = 'Real-money submission is disabled in the game client. A server-side provider adapter, verified KYC/AML/sanctions gates, provider credentials, webhook verification, authoritative ledger settlement and explicit user confirmation are required before live transfer.'
