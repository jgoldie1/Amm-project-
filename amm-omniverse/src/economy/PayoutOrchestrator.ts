export type PayoutSource='game-prize'|'pastor-kofi-service-share'
export type PayoutState='pending'|'held'|'approved'|'submitted'|'paid'|'failed'|'reversed'|'cancelled'
export type PayoutRequest={id:string;source:PayoutSource;recipientRef:string;amountCents:number;currency:string;idempotencyKey:string;gateEvidence:Record<string,unknown>}
export type PayoutProviderResult={providerRef:string;state:Extract<PayoutState,'submitted'|'paid'|'failed'>;raw?:Record<string,unknown>}

export interface PayoutProvider{
  name:string
  submit(req:PayoutRequest):Promise<PayoutProviderResult>
  reverse?(providerRef:string,amountCents:number,currency:string):Promise<PayoutProviderResult>
}

export const REQUIRED_PAYOUT_GATES=['identity','eligibility','funding','fraud','tax-if-required','provider-ready'] as const

export function verifyPayoutGates(req:PayoutRequest){
  if(!req.id||!req.recipientRef||!req.idempotencyKey)throw new Error('missing payout identity')
  if(!Number.isInteger(req.amountCents)||req.amountCents<=0)throw new Error('invalid payout amount')
  for(const gate of REQUIRED_PAYOUT_GATES)if(req.gateEvidence[gate]!==true)throw new Error(`payout gate not green: ${gate}`)
}

export async function submitVerifiedPayout(provider:PayoutProvider,req:PayoutRequest){
  verifyPayoutGates(req)
  const result=await provider.submit(req)
  if(!result.providerRef)throw new Error('provider did not return a reference')
  return result
}

export function createSandboxPayoutProvider():PayoutProvider{
  return {
    name:'tryamm-sandbox-payout',
    async submit(req){return{providerRef:`sandbox_${req.idempotencyKey}`,state:'paid',raw:{sandbox:true,amountCents:req.amountCents,currency:req.currency}}},
    async reverse(providerRef,amountCents,currency){return{providerRef:`${providerRef}_reversal`,state:'paid',raw:{sandbox:true,reversal:true,amountCents,currency}}},
  }
}

export const PAYOUT_TRUTH='The orchestrator never determines who won, who is entitled to a 10% service share, or whether a payment is lawful. Those facts must already be finalized by the authoritative event/service ledger and compliance gates before provider submission.'
