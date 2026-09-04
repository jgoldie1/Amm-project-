(()=>{
  const VERSION='20260903-store-router-v1'
  const stores={
    allAmericanMarketplace:{name:'All American Marketplace / All American Store',path:'/',status:'platform-core',categories:['made-in-america','general','creator','home','fashion','electronics'],requirements:['verified seller','sellable inventory'],note:'Made in America claims stay gated until origin evidence is verified.'},
    yahavahGrocery:{name:'YAHAVAH Grocery',path:'/yahavah-grocery',status:'verified-current-ui',categories:['grocery','pantry','frozen','beverage','household','fresh'],requirements:['verified supplier','lot/expiry when applicable','cold-chain when applicable']},
    allAmericanBeauty:{name:'All American Beauty / African American Beauty Supply',path:'/beauty-supply',status:'verified-current-ui',categories:['beauty','hair','wigs','braiding','lashes','makeup','skincare','nails','barber','salon'],requirements:['verified wholesaler','authenticity','MAP when applicable']},
    supplyPlug:{name:'Supply Plug Global',path:'/supply-plug',status:'verified-current-ui',categories:['wholesale','business-in-a-box','sourcing'],requirements:['supplier verification','MOQ','landed cost']},
    holoFon:{name:'Holo Fon / TRYAMM Telecom',path:'/',status:'recovered-provider-gated',categories:['telecom','phone','esim','accessories','connectivity'],requirements:['device/catalog verification','carrier/provider connection where required']},
    holoShop:{name:'Holo Shop',path:'/',status:'recovered-integration',categories:['fashion','hair','beauty','gear','creator-merch'],requirements:['sellable inventory','rights/authenticity']},
    gasCharge:{name:'All American Gas & Charge',path:'/',status:'recovered-integration',categories:['automotive','ev','charging','travel-retail'],requirements:['provider/site approval for regulated or physical services']},
    localStores:{name:'Local Bodega / Mom-and-Pop Network',path:'/business',status:'recovered-network',categories:['convenience','local','grocery','household'],requirements:['merchant verification','local inventory']},
    creatorStores:{name:'Creator Storefronts',path:'/',status:'platform-core',categories:['creator','merch','digital','fashion','beauty'],requirements:['creator/seller verification','rights','sellable inventory']}
  }
  const normal=v=>String(v||'').trim().toLowerCase()
  function routeProduct(product={}){
    const category=normal(product.category),tags=(Array.isArray(product.tags)?product.tags:[]).map(normal)
    const madeInAmericaRequested=Boolean(product.madeInAmerica||tags.includes('made-in-america')||tags.includes('made in america'))
    const madeInAmericaVerified=Boolean(product.madeInAmericaVerified)
    const matches=[]
    for(const [id,store] of Object.entries(stores)){
      const hit=store.categories.some(c=>category.includes(c)||tags.some(t=>t.includes(c)||c.includes(t)))
      if(hit)matches.push({id,...store,eligible:true,hold:false,reasons:[]})
    }
    if(madeInAmericaRequested){
      const existing=matches.find(x=>x.id==='allAmericanMarketplace')
      const target=existing||{id:'allAmericanMarketplace',...stores.allAmericanMarketplace,eligible:true,hold:false,reasons:[]}
      if(!existing)matches.unshift(target)
      if(!madeInAmericaVerified){target.hold=true;target.reasons.push('Made in America origin verification required before publishing that claim.')}
    }
    if(['telecom','phone','esim','connectivity'].some(x=>category.includes(x)||tags.includes(x))){
      const tel=matches.find(x=>x.id==='holoFon');if(tel){tel.hold=true;tel.reasons.push('Carrier/device/provider connection must be verified before representing service as active.')}
    }
    if(!matches.length)matches.push({id:'allAmericanMarketplace',...stores.allAmericanMarketplace,eligible:true,hold:false,reasons:['General marketplace route; category review required.']})
    return {product:{name:String(product.name||'Untitled product'),sku:String(product.sku||''),category,tags,madeInAmericaRequested,madeInAmericaVerified},routes:matches,inventorySource:'TRYAMM Virtual Warehouse',truthBoundary:'Routing does not create inventory, approve a supplier, connect a carrier, or verify a product claim.'}
  }
  const flow=['VERIFIED SUPPLIER','NDA / NNN SOURCING','SUPPLY PLUG GLOBAL','SKU + PRODUCT PASSPORT','LANDED COST','VIRTUAL WAREHOUSE','STORE ROUTER','ORDER RESERVATION','VERIFIED PAYMENT','FULFILLMENT','DELIVERY / PICKUP','PROOF','INVENTORY DECREMENT','DEMAND TWIN REORDER']
  window.TRYAMMStoreRouter={version:VERSION,stores,flow,routeProduct,snapshot:()=>({version:VERSION,stores:JSON.parse(JSON.stringify(stores)),flow:[...flow]})}
  window.dispatchEvent(new CustomEvent('tryamm:store-router-ready',{detail:{version:VERSION,stores:Object.keys(stores),flow}}))
})()
