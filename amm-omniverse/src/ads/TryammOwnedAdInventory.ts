export type TryammAdSurface='billboard'|'digital-billboard'|'holographic-billboard'|'storefront'|'vehicle'|'arena'|'holo-drama'|'ar-placement'|'sponsored-mission'
export type TryammAdInventory={id:string;worldId:string;communityArea?:string;surface:TryammAdSurface;owner:'TRYAMM';revenueOwner:'TRYAMM';publisherShareBps:10000;thirdPartyRevenueShareBps:0;status:'AVAILABLE'|'RESERVED'|'ACTIVE'|'PAUSED';placement:{anchorId:string;format:string;maxSeconds?:number};policy:{ageLane:'general'|'adult';regions?:string[];restrictedCategories:string[]}}

export const TRYAMM_OWNED_INVENTORY_DEFAULTS={
 owner:'TRYAMM' as const,
 revenueOwner:'TRYAMM' as const,
 publisherShareBps:10000 as const,
 thirdPartyRevenueShareBps:0 as const,
 restrictedCategories:['illegal-products','weapons','tobacco','controlled-substances','adult-sexual-content','deceptive-finance']
}

export function createTryammOwnedAdInventory(input:Omit<TryammAdInventory,'owner'|'revenueOwner'|'publisherShareBps'|'thirdPartyRevenueShareBps'>):TryammAdInventory{
 return {...input,...TRYAMM_OWNED_INVENTORY_DEFAULTS}
}
