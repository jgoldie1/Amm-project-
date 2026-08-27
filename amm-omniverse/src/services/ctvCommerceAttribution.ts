import { createPaymentIntent, type PaymentIntent } from '../runtime/WalletPaymentNetwork'

export type AttributionEventType='impression'|'qr_scan'|'click'|'product_view'|'checkout'|'purchase'
export type AttributionEvent={id:string;campaignId:string;provider:string;type:AttributionEventType;uraDid?:string;sessionId:string;orderId?:string;valueMinor?:number;currency:'USD';occurredAt:number}
export type CommerceAttribution={campaignId:string;provider:string;sessionId:string;orderId:string;grossMinor:number;platformMinor:number;merchantMinor:number;currency:'USD';touches:AttributionEvent[];paymentIntent:PaymentIntent}

const events:AttributionEvent[]=[]
const settlements=new Map<string,CommerceAttribution>()
const id=(p:string)=>`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`

export function recordCTVAttribution(input:Omit<AttributionEvent,'id'|'occurredAt'>){
 const event:AttributionEvent={...input,id:id('attr'),occurredAt:Date.now()};events.push(event);return event
}
export function getCampaignAttribution(campaignId:string){return events.filter(e=>e.campaignId===campaignId).sort((a,b)=>a.occurredAt-b.occurredAt)}
export function getSessionAttribution(sessionId:string){return events.filter(e=>e.sessionId===sessionId).sort((a,b)=>a.occurredAt-b.occurredAt)}

export function attributeVerifiedOrder(input:{campaignId:string;provider:string;sessionId:string;orderId:string;grossMinor:number;platformBps?:number;merchantAccount:string;uraDid?:string}){
 if(input.grossMinor<=0)throw new Error('Verified order total must be positive')
 const existing=settlements.get(input.orderId);if(existing)return existing
 const platformBps=Math.max(0,Math.min(10000,input.platformBps??1000))
 const platformMinor=Math.floor(input.grossMinor*platformBps/10000),merchantMinor=input.grossMinor-platformMinor
 recordCTVAttribution({campaignId:input.campaignId,provider:input.provider,type:'purchase',uraDid:input.uraDid,sessionId:input.sessionId,orderId:input.orderId,valueMinor:input.grossMinor,currency:'USD'})
 const paymentIntent=createPaymentIntent({amountMinor:input.grossMinor,currency:'USD',purpose:`ctv-commerce:${input.orderId}`,merchantAccount:input.merchantAccount,idempotencyKey:`ctv:${input.orderId}`})
 const result:CommerceAttribution={campaignId:input.campaignId,provider:input.provider,sessionId:input.sessionId,orderId:input.orderId,grossMinor:input.grossMinor,platformMinor,merchantMinor,currency:'USD',touches:getSessionAttribution(input.sessionId),paymentIntent}
 settlements.set(input.orderId,result);return result
}

export function getCTVRevenueSummary(campaignId?:string){
 const rows=[...settlements.values()].filter(x=>!campaignId||x.campaignId===campaignId)
 return {orders:rows.length,grossMinor:rows.reduce((n,x)=>n+x.grossMinor,0),platformMinor:rows.reduce((n,x)=>n+x.platformMinor,0),merchantMinor:rows.reduce((n,x)=>n+x.merchantMinor,0),currency:'USD' as const}
}
