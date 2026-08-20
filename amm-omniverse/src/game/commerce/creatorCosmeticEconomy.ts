export type CosmeticKind='mask'|'outfit'|'shoes'|'hair'|'vehicle_skin'|'holo_effect'|'emote'|'accessory'
export interface CosmeticOffer{ id:string; kind:CosmeticKind; name:string; priceCents:number; currency:'USD'; creatorId?:string; storefrontId?:string; platformBps:number; creatorBps:number; taxesBps?:number; cosmeticOnly:true; competitiveAdvantage:false; requiresRightsReview:boolean; active:boolean }
export interface CosmeticSale{ saleId:string; offerId:string; buyerId:string; providerReceiptId:string; grossCents:number; platformCents:number; creatorCents:number; taxCents:number; entitlementId:string; createdAt:string }
export const PRICE_GUARDRAILS={minCents:99,maxCents:50000,serverAuthoritative:true,clientCannotSetPrice:true} as const
export function validateOffer(o:CosmeticOffer){if(o.priceCents<PRICE_GUARDRAILS.minCents||o.priceCents>PRICE_GUARDRAILS.maxCents)throw new Error('price_out_of_range');if(o.platformBps+o.creatorBps+(o.taxesBps??0)>10000)throw new Error('invalid_split');return true}
export function splitSale(o:CosmeticOffer,grossCents:number){validateOffer(o);const platformCents=Math.floor(grossCents*o.platformBps/10000);const creatorCents=Math.floor(grossCents*o.creatorBps/10000);const taxCents=Math.floor(grossCents*(o.taxesBps??0)/10000);return{platformCents,creatorCents,taxCents,remainderCents:grossCents-platformCents-creatorCents-taxCents}}
export const EXAMPLE_OFFERS:CosmeticOffer[]=[
{id:'midnight-ski-10',kind:'mask',name:'Midnight Ski Mask',priceCents:1000,currency:'USD',platformBps:3000,creatorBps:7000,cosmeticOnly:true,competitiveAdvantage:false,requiresRightsReview:false,active:true},
{id:'judah-holo-mask-15',kind:'mask',name:'Judah Holo Mask',priceCents:1500,currency:'USD',platformBps:3000,creatorBps:7000,cosmeticOnly:true,competitiveAdvantage:false,requiresRightsReview:false,active:true},
{id:'creator-premium-fit-25',kind:'outfit',name:'Creator Premium Fit',priceCents:2500,currency:'USD',platformBps:2500,creatorBps:7500,cosmeticOnly:true,competitiveAdvantage:false,requiresRightsReview:true,active:true},
]
export const COMMERCE_RULES=['money_engine_receipt_required','entitlement_granted_server_side','refund_chargeback_can_revoke','no_pay_to_win','creator_payout_requires_verified_payee','tax_and_jurisdiction_rules_apply','licensed_likeness_or_brand_required','sale_is_not_withdrawable_game_reward'] as const
