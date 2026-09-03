(()=>{
  const VERSION='20260903-supply-v1'
  const RECOVERED=['qvc-hsn-live-selling','shopify-product-builder','global-trade','vendor-creator-stores','seller-payouts','live-shopping','affiliate-commerce','delivery-tracking','proof-of-delivery','marketplace-fulfillment']
  const LANES={
    ndaSourcing:{label:'NDA Sourcing Rooms',status:'software-ready',description:'Gate supplier briefs, samples, pricing, drawings and negotiations behind explicit confidentiality/permission records.'},
    quantumSourcing:{label:'Quantum Sourcing',status:'decision-layer',description:'Multi-supplier scoring for cost, MOQ, lead time, quality, geography, resilience and verified compliance. No claim of quantum-computer execution without a connected backend.'},
    quantumPallet:{label:'Quantum Pallet / Package Tracking',status:'software-ready',description:'Track shipment units through supplier, consolidation, freight, customs, warehouse, fulfillment and delivery events with provenance and chain of custody.'},
    lawfulTariff:{label:'Lawful Tariff Optimizer',status:'software-ready',description:'Compare landed-cost scenarios using classification, declared origin, trade agreements, bonded/FTZ options and drawback where legally applicable. Never misdeclare value, origin or classification.'},
    lowMoq:{label:'Low-MOQ Sourcing',status:'software-ready',description:'Match small sellers and creators to suppliers able to support samples, micro-runs, shared production and staged reorder quantities.'},
    dtc:{label:'Direct-to-Consumer Routing',status:'software-ready',description:'Supplier or warehouse to customer routing with marketplace order status, delivery events and returns.'},
    virtualWarehouse:{label:'Virtual Warehouse',status:'software-ready',description:'One inventory view across supplier stock, in-transit stock, owned warehouses, third-party fulfillment and reserved marketplace units.'},
    holoFridge:{label:'Holo Fridge / Cold-Chain Warehouse',status:'software-ready',description:'Cold-chain inventory lane for temperature-sensitive goods with condition events, expiry/lot metadata and fulfillment holds when data is missing.'},
    fulfillment:{label:'Warehouse Fulfillment',status:'software-ready',description:'Receiving, put-away, pick, pack, label, dispatch, proof of delivery and reverse-logistics events.'},
    liveCommerce:{label:'QVC / HSN-style Live Commerce',status:'recovered-ui',description:'Live shopping, flash-sale, countdown and purchase-alert experience already documented in the platform inventory; external broadcast/merchant connections remain provider-gated.'},
    shopify:{label:'Shopify Commerce Adapter',status:'recovered-builder',description:'Product/listing builder is documented as built; external Shopify account/API sync is treated as disconnected until credentials and provider verification exist.'},
    auctions:{label:'eBay-style Marketplace Bidding',status:'software-ready',description:'Auction/bidding lane for original TRYAMM marketplace listings with reserve, bid history, anti-shill controls and server-authoritative close/settlement.'}
  }
  const SUGGESTIONS={
    digitalPassport:'Digital Product Passport: origin, materials, lot/batch, supplier attestations, custody and recall linkage.',
    landedCost:'Landed Cost Engine: goods + freight + duties + brokerage + storage + payment + pick/pack + returns + margin floor.',
    supplierRisk:'Supplier Reliability Score: defect rate, late rate, document completeness, disputes, concentration and geopolitical/logistics exposure.',
    demandTwin:'Demand Twin: forecast by marketplace, LIVE event, creator campaign, geography and season before committing inventory.',
    splitOrder:'Smart Split Orders: divide one PO across suppliers/routes when it lowers risk without silently changing customer promises.',
    routeResilience:'Route Resilience: compare ocean, air, rail and truck alternatives and flag single-port/single-carrier dependencies.',
    coldChain:'Cold-Chain Exception Engine: quarantine virtual inventory when temperature/condition evidence is missing or outside configured limits.',
    reverseLogistics:'Reverse Logistics: returns, repair, refurbish, resale, recycle and supplier chargeback workflows.',
    complianceVault:'Compliance Vault: licenses, certificates, test reports, insurance and supplier documents with expiry alerts.',
    liveInventory:'LIVE-to-Inventory Reservation: hold units during live selling/auction windows so overselling does not occur.',
    supplierFinance:'Supplier Finance Readiness: invoice/PO evidence and settlement status for approved financing partners; no automatic lending claims.',
    missionLayer:'StreetVerse Supply Missions: ports, warehouses, stores and creator shops can visualize simulated supply events without pretending game events are real shipments.'
  }
  const state={version:VERSION,lastUpdated:new Date().toISOString(),lanes:LANES,recovered:RECOVERED,suggestions:SUGGESTIONS,connections:{shopify:false,externalMarketplaces:false,carriers:false,customs:false,warehouses:false,paymentRails:false}}
  const safeNum=n=>Number.isFinite(Number(n))?Number(n):0
  function landedCost(input={}){
    const goods=safeNum(input.goods),freight=safeNum(input.freight),duties=safeNum(input.duties),brokerage=safeNum(input.brokerage),storage=safeNum(input.storage),pickPack=safeNum(input.pickPack),payment=safeNum(input.payment),returnsReserve=safeNum(input.returnsReserve),other=safeNum(input.other)
    const total=goods+freight+duties+brokerage+storage+pickPack+payment+returnsReserve+other
    return {goods,freight,duties,brokerage,storage,pickPack,payment,returnsReserve,other,total,verified:false,note:'Scenario calculation only until rates/documents/providers are verified.'}
  }
  function scoreSupplier(input={}){
    const cost=Math.max(0,Math.min(100,safeNum(input.costScore)||50)),quality=Math.max(0,Math.min(100,safeNum(input.qualityScore)||50)),delivery=Math.max(0,Math.min(100,safeNum(input.deliveryScore)||50)),compliance=Math.max(0,Math.min(100,safeNum(input.complianceScore)||50)),resilience=Math.max(0,Math.min(100,safeNum(input.resilienceScore)||50)),moq=Math.max(0,Math.min(100,safeNum(input.moqScore)||50))
    const score=Math.round(cost*.20+quality*.25+delivery*.20+compliance*.20+resilience*.10+moq*.05)
    return {score,components:{cost,quality,delivery,compliance,resilience,moq},decision:'advisory-only'}
  }
  function tariffScenario(input={}){
    const declaredValue=safeNum(input.declaredValue),dutyRate=Math.max(0,safeNum(input.dutyRate)),fees=Math.max(0,safeNum(input.fees)),eligibleRelief=Math.max(0,safeNum(input.eligibleRelief))
    const baseDuty=declaredValue*(dutyRate/100),estimatedDuty=Math.max(0,baseDuty-eligibleRelief),totalBorderCost=estimatedDuty+fees
    return {declaredValue,dutyRate,baseDuty,eligibleRelief,estimatedDuty,fees,totalBorderCost,compliance:'Use verified classification, value, origin and legally applicable programs only.'}
  }
  function registerConnection(name,connected,meta={}){
    if(!(name in state.connections))return {ok:false,reason:'unknown-connection'}
    state.connections[name]=Boolean(connected)
    window.dispatchEvent(new CustomEvent('tryamm:supply-chain-connection',{detail:{name,connected:Boolean(connected),meta,version:VERSION}}))
    return {ok:true,name,connected:Boolean(connected)}
  }
  window.TRYAMMGlobalSupplyChain={
    version:VERSION,
    snapshot:()=>JSON.parse(JSON.stringify(state)),
    landedCost,
    scoreSupplier,
    tariffScenario,
    registerConnection,
    createTrackingUnit:(input={})=>({id:String(input.id||('UNIT-'+Date.now())),type:String(input.type||'package'),sku:String(input.sku||''),lot:String(input.lot||''),status:'created',events:[],verified:false}),
    addTrackingEvent:(unit,event={})=>{if(!unit||!Array.isArray(unit.events))return null;const next={at:event.at||new Date().toISOString(),type:String(event.type||'status'),location:String(event.location||''),condition:String(event.condition||''),source:String(event.source||'unverified')};unit.events.push(next);unit.status=next.type;return unit},
    lanes:LANES,
    suggestions:SUGGESTIONS
  }
  window.dispatchEvent(new CustomEvent('tryamm:global-supply-chain-ready',{detail:{version:VERSION,lanes:Object.keys(LANES),recovered:RECOVERED,connections:{...state.connections},truthBoundary:'Software orchestration is present; external carriers, customs, warehouses, marketplaces and payment rails require verified provider connections.'}}))
})()
