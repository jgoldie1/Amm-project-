export type PaymentRailId =
  | 'stripe' | 'flutterwave' | 'paystack' | 'monnify' | 'moniepoint'
  | 'remita' | 'squad-gtco' | 'opay' | 'paga' | 'cellulant-tingg'
  | 'fincra' | 'kora' | 'seerbit' | 'mpesa'

export type PaymentRailState = 'disabled' | 'sandbox' | 'review' | 'live'
export type EarningSource =
  | 'marketplace' | 'asset-sale' | 'creator-royalty' | 'live-gift' | 'live-ticket'
  | 'subscription' | 'reel-commerce' | 'advertising' | 'affiliate' | 'music-royalty'
  | 'sponsored-mission' | 'tournament' | 'business-scout' | 'referral'
  | 'restaurant' | 'delivery' | 'rideshare' | 'work' | 'education' | 'digital-service'

export type WalletKind = 'holo-credits' | 'omni-cash'
export type MoneyEventState = 'created' | 'provider-pending' | 'verified' | 'held' | 'settled' | 'reversed' | 'failed'

export interface PaymentRail {
  id: PaymentRailId
  state: PaymentRailState
  regions: string[]
  supportsCollection: boolean
  supportsPayout: boolean
  supportsMobileMoney: boolean
  credentialsConfigured: boolean
  signedWebhookVerified: boolean
  reconciliationVerified: boolean
}

export interface UniversalMoneyEvent {
  id: string
  source: EarningSource
  provider: PaymentRailId
  externalReference?: string
  userId: string
  wallet: WalletKind
  amountMinor: number
  currency: string
  state: MoneyEventState
  idempotencyKey: string
  createdAt: string
  verifiedAt?: string
}

export const PAYMENT_RAILS: PaymentRailId[] = [
  'stripe','flutterwave','paystack','monnify','moniepoint','remita','squad-gtco',
  'opay','paga','cellulant-tingg','fincra','kora','seerbit','mpesa'
]

export const UNIVERSAL_MONEY_LIFECYCLE = [
  'EARN','VERIFY_EVENT','CREATE_TRANSACTION','CALCULATE_SPLIT','APPLY_HOLD_OR_RESERVE',
  'WRITE_LEDGER','WRITE_AUDIT_PROOF','MAKE_ELIGIBLE_BALANCE_AVAILABLE',
  'ROUTE_PAYOUT','SETTLE_PROVIDER','RECONCILE'
] as const

export function canActivateRail(rail: PaymentRail): boolean {
  return rail.state === 'live' &&
    rail.credentialsConfigured &&
    rail.signedWebhookVerified &&
    rail.reconciliationVerified
}

export function isWithdrawableWallet(wallet: WalletKind): boolean {
  return wallet === 'omni-cash'
}

export function canSettleMoneyEvent(event: UniversalMoneyEvent, rail: PaymentRail): boolean {
  return event.provider === rail.id &&
    event.wallet === 'omni-cash' &&
    event.state === 'verified' &&
    event.amountMinor > 0 &&
    Boolean(event.currency) &&
    canActivateRail(rail)
}

// Holo Credits are non-withdrawable platform utility value. Never promise or implement an
// automatic fixed Holo-Credits-to-cash conversion. Eligible real-money earnings use Omni Cash.
//
// All provider callbacks must be verified server-side and processed idempotently. A client may
// request checkout but may never mint balances, entitlements, rewards, payouts or settlement.
//
// Payment rails are adapters, not separate ledgers. The verified double-entry ledger remains
// authoritative. Audit/blockchain proofs must not contain raw card, bank, identity or secret data.
//
// Release 1: prove Stripe end-to-end first. Other rails remain disabled/sandbox/review until
// credentials, geography, KYC/KYB/AML, signed webhooks, payout capability and reconciliation pass.
