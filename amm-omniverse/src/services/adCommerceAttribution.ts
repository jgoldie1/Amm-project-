import { routeCTVCampaign, type CTVCampaign, type CTVPlacement } from './ctvProvider'

export type AttributionEventType='impression'|'scan'|'click'|'visit'|'add-to-cart'|'purchase'|'refund'
export type AttributionEvent={id:string;campaignId:string;type:AttributionEventType;occurredAt:number;uraSubject?:string;sessionId?:string;orderId?:string;amountMinor?:number;currency?:'USD'}
export type CommerceSettlement={campaignId:string;orderId:string;grossMinor:number;currency:'USD';status:'pending-verification'|'verified'|'settled'|'reversed';attributionModel:'last-qualified-touch';source:'ctv';provider:string}

const events:AttributionEvent[]=[]
const settlements=new Map<string,CommerceSettlement>()

export async function launchAttributedCTV(campaign:CTVCampaign):Promise<CTVPlacement>{
  return routeCTVCampaign(campaign)
}

export function recordAttributionEvent(event:AttributionEvent){events.push(event);return event}
export function listCampaignAttribution(campaignId:string){return events.filter(e=>e.campaignId===campaignId).sort((a,b)=>a.occurredAt-b.occurredAt)}

export function createCommerceSettlement(input:{campaignId:string;orderId:string;grossMinor:number;provider:string;currency?:'USD'}){
  if(settlements.has(input.orderId))return settlements.get(input.orderId)!
  const purchase=events.find(e=>e.campaignId===input.campaignId&&e.orderId===input.orderId&&e.type==='purchase')
  const settlement:CommerceSettlement={campaignId:input.campaignId,orderId:input.orderId,grossMinor:input.grossMinor,currency:input.currency??'USD',status:purchase?'pending-verification':'pending-verification',attributionModel:'last-qualified-touch',source:'ctv',provider:input.provider}
  settlements.set(input.orderId,settlement);return settlement
}

export function verifyCommerceSettlement(orderId:string,verified:boolean){
  const current=settlements.get(orderId);if(!current)throw new Error('Settlement not found')
  const next={...current,status:(verified?'verified':'reversed') as CommerceSettlement['status']};settlements.set(orderId,next);return next
}
export function markCommerceSettled(orderId:string){
  const current=settlements.get(orderId);if(!current||current.status!=='verified')throw new Error('Verified settlement required')
  const next={...current,status:'settled' as const};settlements.set(orderId,next);return next
}

export const holoAdsCommerce={launchAttributedCTV,recordAttributionEvent,listCampaignAttribution,createCommerceSettlement,verifyCommerceSettlement,markCommerceSettled}
