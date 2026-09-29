export type RevenueProductType='motion-pack'|'creator-license'|'business-experience'|'event-ticket'|'production-service'|'performance-booking'|'sponsored-mission'|'training'|'device-access'
export type RevenueIntent={id:string;type:RevenueProductType;sellerId:string;buyerId:string;amountMinor:number;currency:string;assetId?:string;experienceId?:string}
export function createRevenueIntent(input:RevenueIntent){
 if(!input.id||!input.sellerId||!input.buyerId)throw new Error('invalid-revenue-intent')
 if(!Number.isSafeInteger(input.amountMinor)||input.amountMinor<0)throw new Error('invalid-amount')
 if(!/^[A-Z]{3}$/.test(input.currency))throw new Error('invalid-currency')
 return {...input,status:'pending-server-verification' as const,clientMaySettle:false,ledgerWriteRequired:true}
}
export function revenueEntitlementKey(i:RevenueIntent){return [i.type,i.assetId??i.experienceId??i.id,i.buyerId].join(':')}
