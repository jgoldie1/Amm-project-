export type LedgerBucket='platform_revenue'|'creator_payable'|'collaborator_payable'|'restricted_fund'|'customer_liability'|'refund_reserve'|'provider_payable'|'tax_payable'|'hologpt_credit_liability';
export type LedgerEntry={accountId:string;bucket:LedgerBucket;debitMinor:number;creditMinor:number;currency:string};
export type Journal={id:string;occurredAt:string;description:string;correlationId:string;entries:LedgerEntry[];status:'draft'|'posted'|'reversed'};

export function validateJournal(journal:Journal){
  const byCurrency=new Map<string,{debit:number;credit:number}>();
  for(const e of journal.entries){const v=byCurrency.get(e.currency)??{debit:0,credit:0};v.debit+=e.debitMinor;v.credit+=e.creditMinor;byCurrency.set(e.currency,v);}
  const errors=[...byCurrency.entries()].filter(([,v])=>v.debit!==v.credit).map(([currency,v])=>`${currency} debits ${v.debit} != credits ${v.credit}`);
  return {valid:errors.length===0,errors};
}

export type AiWallet={accountId:string;aiActions:number;holoGptCredits:number;updatedAt:string};
export type AiUsage={id:string;accountId:string;actionType:string;aiActions:number;holoGptCredits:number;occurredAt:string;correlationId:string};
export function consumeAi(wallet:AiWallet,usage:AiUsage){if(usage.aiActions>wallet.aiActions||usage.holoGptCredits>wallet.holoGptCredits)throw new Error('Insufficient AI allowance.');return {...wallet,aiActions:wallet.aiActions-usage.aiActions,holoGptCredits:wallet.holoGptCredits-usage.holoGptCredits,updatedAt:new Date().toISOString()};}

export type GiftKind='ai_actions'|'hologpt_credits'|'creator_gift';
export type Gift={id:string;fromAccountId:string;toAccountId:string;kind:GiftKind;quantity:number;currency?:string;amountMinor?:number;status:'prepared'|'pending_approval'|'completed'|'reversed';createdAt:string;correlationId:string};
export function validateGift(gift:Gift){if(gift.quantity<=0)return {valid:false,reason:'Gift quantity must be positive.'};if(gift.kind==='creator_gift'&&(!gift.currency||!gift.amountMinor||gift.amountMinor<=0))return {valid:false,reason:'Paid creator gift requires a positive monetary amount.'};return {valid:true,reason:'Gift is structurally valid.'};}

export type PayoutState='pending'|'review_hold'|'approved'|'submitted'|'paid'|'failed'|'reversed';
export type Payout={id:string;payeeAccountId:string;amountMinor:number;currency:string;state:PayoutState;reason?:string;providerReference?:string;correlationId:string;updatedAt:string};
const allowed:PayoutState[]=['pending','review_hold','approved','submitted','paid','failed','reversed'];
export function transitionPayout(p:Payout,next:PayoutState){const rules:Record<PayoutState,PayoutState[]>={pending:['review_hold','approved','failed'],review_hold:['approved','failed'],approved:['submitted','review_hold','failed'],submitted:['paid','failed'],paid:['reversed'],failed:['pending'],reversed:[]};if(!allowed.includes(next)||!rules[p.state].includes(next))throw new Error(`Invalid payout transition ${p.state} -> ${next}`);return {...p,state:next,updatedAt:new Date().toISOString()};}

export type IdempotencyRecord={key:string;operation:string;resultId:string;createdAt:string};
export function assertIdempotent(records:IdempotencyRecord[],key:string,operation:string){return records.find(r=>r.key===key&&r.operation===operation)??null;}

// Sandbox only: real money/payouts remain behind feature gates and licensed provider integrations.
