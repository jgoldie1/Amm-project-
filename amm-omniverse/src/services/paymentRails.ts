export type PaymentRailId =
  | 'stripe'
  | 'flutterwave'
  | 'paystack'
  | 'monnify'
  | 'moniepoint'
  | 'remita'
  | 'squad'
  | 'opay'
  | 'paga'
  | 'tingg'
  | 'fincra'
  | 'kora'
  | 'seerbit'
  | 'mpesa'

export type PaymentMethod =
  | 'card'
  | 'bank_transfer'
  | 'bank_account'
  | 'mobile_money'
  | 'ussd'
  | 'qr'
  | 'tap_pay'
  | 'wallet'
  | 'virtual_account'
  | 'payout'

export type PaymentRailStatus = 'adapter-ready' | 'configured' | 'disabled'

export type PaymentRailDefinition = {
  id: PaymentRailId
  name: string
  regions: string[]
  currencies: string[]
  methods: PaymentMethod[]
  envKeys: string[]
  priority: number
  status: PaymentRailStatus
  notes: string
}

const hasAnyEnv = (keys:string[]) => typeof import.meta !== 'undefined' && keys.some(key => Boolean((import.meta as any).env?.[key]))

const rail = (definition:Omit<PaymentRailDefinition,'status'>):PaymentRailDefinition => ({
  ...definition,
  status: hasAnyEnv(definition.envKeys) ? 'configured' : 'adapter-ready',
})

/**
 * Provider metadata only. No secret keys are bundled into the client and no
 * live payment request is made from this module. Server-side provider adapters
 * must verify credentials, KYC/KYB, sanctions/risk gates and signed webhooks.
 */
export const PAYMENT_RAILS: PaymentRailDefinition[] = [
  rail({id:'stripe',name:'Stripe',regions:['GLOBAL'],currencies:['USD','EUR','GBP','CAD','AUD'],methods:['card','bank_account','bank_transfer','tap_pay','payout'],envKeys:['VITE_STRIPE_PUBLISHABLE_KEY'],priority:10,notes:'Global commerce rail; secret-key operations remain server-side.'}),
  rail({id:'flutterwave',name:'Flutterwave',regions:['AFRICA','NG','GH','KE','UG','TZ','RW'],currencies:['NGN','GHS','KES','UGX','TZS','RWF','USD'],methods:['card','bank_transfer','mobile_money','ussd','qr','payout'],envKeys:['VITE_FLUTTERWAVE_PUBLIC_KEY'],priority:20,notes:'Pan-African collections and payouts; capabilities vary by market.'}),
  rail({id:'paystack',name:'Paystack',regions:['AFRICA','NG','GH','ZA','KE'],currencies:['NGN','GHS','ZAR','KES','USD'],methods:['card','bank_transfer','bank_account','mobile_money','ussd','qr','payout'],envKeys:['VITE_PAYSTACK_PUBLIC_KEY'],priority:15,notes:'Core West/East/Southern Africa commerce rail where supported.'}),
  rail({id:'monnify',name:'Monnify',regions:['NG'],currencies:['NGN'],methods:['bank_transfer','virtual_account','card','ussd','payout'],envKeys:['VITE_MONNIFY_API_KEY'],priority:30,notes:'Nigeria-focused collections, virtual accounts and transfers.'}),
  rail({id:'moniepoint',name:'Moniepoint',regions:['NG'],currencies:['NGN'],methods:['bank_transfer','card','wallet','payout'],envKeys:['VITE_MONIEPOINT_PUBLIC_KEY'],priority:35,notes:'Merchant/payment rail; activation requires an approved merchant account.'}),
  rail({id:'remita',name:'Remita',regions:['NG'],currencies:['NGN'],methods:['card','bank_transfer','bank_account','ussd','payout'],envKeys:['VITE_REMITA_MERCHANT_ID'],priority:40,notes:'Nigeria collections and business/government payment workflows.'}),
  rail({id:'squad',name:'Squad by GTCO',regions:['NG'],currencies:['NGN','USD'],methods:['card','bank_transfer','virtual_account','payout'],envKeys:['VITE_SQUAD_PUBLIC_KEY'],priority:32,notes:'Merchant collections and transfers; provider approval required.'}),
  rail({id:'opay',name:'OPay',regions:['NG'],currencies:['NGN'],methods:['wallet','bank_transfer','qr','payout'],envKeys:['VITE_OPAY_MERCHANT_ID'],priority:45,notes:'Wallet and merchant payment rail when commercial API access is approved.'}),
  rail({id:'paga',name:'Paga',regions:['NG'],currencies:['NGN'],methods:['wallet','bank_transfer','card','payout'],envKeys:['VITE_PAGA_PUBLIC_ID'],priority:45,notes:'Nigeria payments and payouts; commercial integration required.'}),
  rail({id:'tingg',name:'Cellulant Tingg',regions:['AFRICA'],currencies:['NGN','GHS','KES','UGX','TZS','ZMW','USD'],methods:['mobile_money','card','bank_transfer','payout'],envKeys:['VITE_TINGG_CLIENT_ID'],priority:50,notes:'Pan-African aggregator; exact markets/methods require account capabilities.'}),
  rail({id:'fincra',name:'Fincra',regions:['AFRICA'],currencies:['NGN','GHS','KES','ZAR','USD','EUR','GBP'],methods:['bank_transfer','virtual_account','payout'],envKeys:['VITE_FINCRA_PUBLIC_KEY'],priority:25,notes:'Collections, virtual accounts and cross-border payout infrastructure.'}),
  rail({id:'kora',name:'Kora',regions:['AFRICA'],currencies:['NGN','GHS','KES','ZAR','USD'],methods:['card','bank_transfer','mobile_money','payout'],envKeys:['VITE_KORA_PUBLIC_KEY'],priority:25,notes:'African collections and payouts; capabilities are merchant-specific.'}),
  rail({id:'seerbit',name:'SeerBit',regions:['AFRICA'],currencies:['NGN','GHS','KES','ZAR','USD'],methods:['card','bank_transfer','mobile_money','ussd','payout'],envKeys:['VITE_SEERBIT_PUBLIC_KEY'],priority:45,notes:'Pan-African merchant payment adapter target.'}),
  rail({id:'mpesa',name:'M-Pesa',regions:['KE','TZ','EAST_AFRICA'],currencies:['KES','TZS'],methods:['mobile_money','payout'],envKeys:['VITE_MPESA_CONSUMER_KEY'],priority:12,notes:'Direct M-Pesa adapter target where Safaricom/Vodacom API access is approved.'}),
]

export type PaymentRouteInput = {
  region?: string
  currency: string
  method?: PaymentMethod
  configuredOnly?: boolean
}

export function getPaymentRail(id:PaymentRailId){
  return PAYMENT_RAILS.find(item => item.id === id)
}

export function routePaymentRails(input:PaymentRouteInput):PaymentRailDefinition[]{
  const currency = input.currency.toUpperCase()
  const region = input.region?.toUpperCase()
  return PAYMENT_RAILS
    .filter(item => item.currencies.includes(currency) || item.currencies.includes('USD') && currency === 'USD')
    .filter(item => !region || item.regions.includes(region) || item.regions.includes('AFRICA') || item.regions.includes('GLOBAL'))
    .filter(item => !input.method || item.methods.includes(input.method))
    .filter(item => !input.configuredOnly || item.status === 'configured')
    .sort((a,b) => a.priority - b.priority)
}

export const PAYMENT_RAIL_PRODUCTION_BOUNDARY =
  'Adapter-ready does not mean live. Every rail remains disabled for real-money movement until server credentials, merchant approval, KYC/KYB, compliance controls, signed webhook verification, idempotency, reconciliation and settlement tests are complete.'
