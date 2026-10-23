/** Flagship owned business definition; draft catalog, not merchant activation. */
export const BJ_STUBBS_FLAGSHIP_BUSINESS={
 id:'bj-stubbs-newumerica',ownerCharacterId:'bj-stubbs',displayName:'BJ Stubbs — Newumerica Flagship',
 category:'digital-game-assets-and-mixed-reality',businessListTags:['streetverse','flagship','creator-commerce','digital-products','mixed-reality'],
 publicStorefront:'/bj-stubbs-store.html',inGameDiscovery:'/streetverse-living-district.html',
 marketplaceEngine:'assetMarketplaceEconomy',merchantStatus:'verification-required',
 listingState:'draft',checkoutState:'not-activated',
 collections:[
 {id:'omni-deck',name:'Omni Holographic Deck',type:'digital-deck',status:'preview',route:'/bj-stubbs-store.html#catalog'},
 {id:'omega-gifts',name:'Omega Holographic Gifts',type:'visual-effects',status:'preview',route:'/omega-celestial-gift-lab.html'},
 {id:'avatar-assets',name:'StreetVerse Character Assets',type:'3d-game-assets',status:'preview',route:'/bj-stubbs-store.html#game'},
 {id:'world-packs',name:'Creator World Packs',type:'environments',status:'preview',route:'/bj-stubbs-store.html#game'},
 {id:'music-packs',name:'Music and Broadcast Assets',type:'licensed-media',status:'preview',route:'/bj-stubbs-store.html#catalog'},
 {id:'arena-gear',name:'Virtual Arena Equipment',type:'fictional-equipment',status:'preview',route:'/bj-stubbs-store.html#catalog'},
 ],
 safeguards:{sellerVerification:true,rightsClearance:true,verifiedCheckout:true,entitlementsServerIssued:true,
 refundsAndDisputesRequired:true,creatorSplitsRequireContracts:true,noPhysicalWeapons:true,noFakeInventory:true},
} as const
