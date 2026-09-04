(()=>{
  const VERSION='20260903-growth-v1'
  const offers={
    creatorLaunch:{name:'Creator Source Sprint',illustrativePrice:199,billing:'one-time',who:'creator/small brand',outcome:'supplier shortlist + MOQ comparison + landed-cost scenario + launch-ready fulfillment plan'},
    growthSeller:{name:'Growth Seller',illustrativePrice:49,billing:'monthly',who:'seller',outcome:'sourcing workspace + virtual inventory + live/auction commerce tools'},
    proSeller:{name:'Pro Seller',illustrativePrice:149,billing:'monthly',who:'growing seller',outcome:'advanced sourcing, inventory routing, analytics and priority workflow'},
    supplierNetwork:{name:'Supplier Network',illustrativePrice:99,billing:'monthly',who:'supplier',outcome:'buyer discovery + RFQ participation + compliance profile + lead workflow'},
    supplierPro:{name:'Supplier Pro',illustrativePrice:299,billing:'monthly',who:'high-volume supplier',outcome:'priority RFQs + catalog sync + performance analytics + buyer-room tools'},
    controlTower:{name:'Supply Chain Control Tower',illustrativePrice:999,billing:'monthly',who:'SMB/enterprise team',outcome:'multi-supplier landed cost, route resilience, virtual warehouse and exception management'},
    whiteLabel:{name:'White-label Supply OS',illustrativePrice:1499,billing:'monthly',who:'agency/community/enterprise',outcome:'branded sourcing + commerce + fulfillment control plane; implementation/provider fees separate'}
  }
  const moat={
    supplierGraph:'Which suppliers actually perform by product, MOQ, quality, geography and lead time.',
    landedCostGraph:'What products truly cost after freight, duty, brokerage, storage, pick/pack, payment and returns.',
    demandGraph:'Which products move by creator, LIVE show, geography, season and channel.',
    fulfillmentGraph:'Which warehouses/routes/carriers perform for each product and destination once real providers are connected.',
    trustGraph:'Verified documents, disputes, proof-of-delivery, defect history and compliance evidence.',
    creatorDistributionGraph:'Which creators and audiences convert which products, without selling personal conversation data.'
  }
  const firstRevenueSprint=[
    {days:'1–7',goal:'Get 5 real seller discovery calls',actions:['Pick one wedge: low-MOQ creator products','Collect desired product, target retail price, quantity, destination and deadline','Do not promise customs, shipping or financing that is not connected'],proof:'5 documented buyer needs'},
    {days:'8–14',goal:'Build a 10-supplier verified shortlist',actions:['Invite suppliers into NDA/RFQ workflow','Collect MOQ, sample cost, production lead time and required documents','Mark every unverified claim/provider as pending'],proof:'at least 3 comparable supplier quotes per active product'},
    {days:'15–30',goal:'Close first paid Source Sprint',actions:['Sell a fixed deliverable, not vague consulting','Use the landed-cost calculator and supplier score','Require explicit buyer approval before any purchase/order action'],proof:'one paid service and one completed sourcing package'},
    {days:'31–60',goal:'Convert services into recurring software',actions:['Move repeat sellers to Growth or Pro','Track inventory, reorder points and sales channel','Add LIVE/auction selling only when inventory and payments are verified'],proof:'10 paying recurring accounts or equivalent recurring revenue'},
    {days:'61–90',goal:'Create network effects',actions:['Measure supplier response time, quote acceptance, defect/late signals and repeat orders','Recruit suppliers where buyer demand is concentrated','Offer Control Tower/white-label only after workflow evidence exists'],proof:'repeat buyer + repeat supplier + second revenue line on same transaction'}
  ]
  const score=n=>Math.max(0,Math.min(100,Number(n)||0))
  function dominanceReadiness(input={}){
    const verifiedSuppliers=score(input.verifiedSuppliers),payingSellers=score(input.payingSellers),repeatOrderRate=score(input.repeatOrderRate),providerCoverage=score(input.providerCoverage),dataCompleteness=score(input.dataCompleteness),grossMarginQuality=score(input.grossMarginQuality)
    const overall=Math.round(verifiedSuppliers*.15+payingSellers*.20+repeatOrderRate*.25+providerCoverage*.10+dataCompleteness*.15+grossMarginQuality*.15)
    const stage=overall<25?'WEDGE':overall<50?'REPEATABILITY':overall<75?'NETWORK':'PLATFORM'
    return {overall,stage,components:{verifiedSuppliers,payingSellers,repeatOrderRate,providerCoverage,dataCompleteness,grossMarginQuality},note:'Readiness score only; not a valuation or market-share claim.'}
  }
  function firstCashScenario(input={}){
    const sourceSprints=Math.max(0,Number(input.sourceSprints)||0),growth=Math.max(0,Number(input.growthSellers)||0),pro=Math.max(0,Number(input.proSellers)||0),suppliers=Math.max(0,Number(input.supplierMembers)||0),supplierPro=Math.max(0,Number(input.supplierPro)||0),controlTowers=Math.max(0,Number(input.controlTowers)||0),whiteLabels=Math.max(0,Number(input.whiteLabels)||0)
    const revenue=sourceSprints*offers.creatorLaunch.illustrativePrice+growth*offers.growthSeller.illustrativePrice+pro*offers.proSeller.illustrativePrice+suppliers*offers.supplierNetwork.illustrativePrice+supplierPro*offers.supplierPro.illustrativePrice+controlTowers*offers.controlTower.illustrativePrice+whiteLabels*offers.whiteLabel.illustrativePrice
    return {monthlyEquivalent:revenue,illustrative:true,chargesEnabled:false,excludes:['taxes','refunds','processor-fees','sales-costs','support','cloud-costs','partner-shares','provider-costs']}
  }
  window.TRYAMMSupplyChainGrowth={version:VERSION,offers,moat,firstRevenueSprint,dominanceReadiness,firstCashScenario}
  window.dispatchEvent(new CustomEvent('tryamm:supply-chain-growth-ready',{detail:{version:VERSION,chargesEnabled:false,moat:Object.keys(moat),sprintStages:firstRevenueSprint.length}}))
})()
