(()=>{
  const VERSION='20260903-local-food-v1'
  const discovery={
    eatwild:{label:'Eatwild',role:'farm/ranch discovery',scope:'state-by-state pasture-raised meat, eggs and dairy directory',connection:'directory-only',truth:'A directory listing is not TRYAMM supplier approval or owned inventory.'},
    localFarm:{label:'Local Farms & Ranches',role:'direct sourcing',scope:'beef, poultry, pork, lamb/goat, eggs, dairy, produce, honey',connection:'provider-by-provider'},
    csa:{label:'CSA / Farm Box',role:'local produce and food bundles',scope:'seasonal produce, eggs, dairy and farm goods',connection:'provider-by-provider'},
    farmersMarket:{label:'Farmers Markets',role:'local merchant discovery',scope:'produce, meat, eggs, dairy, pantry and artisan foods',connection:'merchant-by-merchant'},
    regionalDistributor:{label:'Regional Food Distributor',role:'scaled local/regional supply',scope:'grocery, refrigerated, frozen and fresh',connection:'provider-by-provider'}
  }
  const categories={
    beef:{label:'Local Beef',perishable:true,inspectionGate:true,coldChain:true},
    poultry:{label:'Chicken / Poultry',perishable:true,inspectionGate:true,coldChain:true},
    pork:{label:'Local Pork',perishable:true,inspectionGate:true,coldChain:true},
    lambGoat:{label:'Lamb / Goat',perishable:true,inspectionGate:true,coldChain:true},
    eggs:{label:'Eggs',perishable:true,inspectionGate:false,coldChain:true},
    dairy:{label:'Dairy',perishable:true,inspectionGate:false,coldChain:true},
    produce:{label:'Fresh Produce / CSA',perishable:true,inspectionGate:false,coldChain:true},
    honey:{label:'Honey / Local Pantry',perishable:false,inspectionGate:false,coldChain:false},
    grains:{label:'U.S.-grown Grains / Pantry',perishable:false,inspectionGate:false,coldChain:false},
    seafood:{label:'U.S. Seafood',perishable:true,inspectionGate:true,coldChain:true}
  }
  function makeSupplierCandidate(input={}){
    return {id:String(input.id||('FARM-'+Date.now())),name:String(input.name||'Unverified supplier'),state:String(input.state||''),discoverySource:String(input.discoverySource||'local'),categories:Array.isArray(input.categories)?input.categories:[],supplierVerified:Boolean(input.supplierVerified),originVerified:Boolean(input.originVerified),inspectionVerified:Boolean(input.inspectionVerified),coldChainVerified:Boolean(input.coldChainVerified),inventoryVerified:Boolean(input.inventoryVerified),status:'candidate'}
  }
  function evaluate(candidate={}){
    const reasons=[]
    if(!candidate.supplierVerified)reasons.push('supplier/farm verification missing')
    if(!candidate.originVerified)reasons.push('U.S. origin evidence missing')
    const needsInspection=(candidate.categories||[]).some(c=>['beef','poultry','pork','lambGoat','seafood'].includes(c))
    const needsCold=(candidate.categories||[]).some(c=>categories[c]?.coldChain)
    if(needsInspection&&!candidate.inspectionVerified)reasons.push('applicable inspection/processing evidence missing')
    if(needsCold&&!candidate.coldChainVerified)reasons.push('cold-chain/storage evidence missing')
    if(!candidate.inventoryVerified)reasons.push('sellable inventory not verified')
    return {approved:reasons.length===0,hold:reasons.length>0,reasons,stores:['YAHAVAH Grocery','All American Marketplace','Local Bodega / Mom-and-Pop Network'],fulfillment:'Virtual Warehouse → verified cold-chain/local fulfillment → delivery/pickup'}
  }
  const state={version:VERSION,discovery,categories,connections:{eatwildApi:false,farmAccounts:false,processors:false,coldChain:false,inventorySync:false,payments:false}}
  window.TRYAMMLocalFoodNetwork={version:VERSION,snapshot:()=>JSON.parse(JSON.stringify(state)),makeSupplierCandidate,evaluate,categories,discovery}
  window.addEventListener('tryamm:local-food-source-request',e=>window.dispatchEvent(new CustomEvent('tryamm:local-food-source-options',{detail:{...(e.detail||{}),version:VERSION,discovery,categories,truthBoundary:'Discovery sources are not connected inventory. Each supplier, product, origin, inspection/processing and cold-chain requirement must be verified before sale.'}})))
  window.dispatchEvent(new CustomEvent('tryamm:local-food-network-ready',{detail:{version:VERSION,discovery:Object.keys(discovery),categories:Object.keys(categories),connections:{...state.connections}}}))
})()
