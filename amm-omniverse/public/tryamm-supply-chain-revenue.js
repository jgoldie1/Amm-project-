(()=>{
  const VERSION='20260903-revenue-v1'
  const pricing={
    sellerPlans:{starter:{monthly:0},growth:{monthly:49},pro:{monthly:149}},
    supplierNetwork:{monthly:99},
    transactionOrchestrationPct:2.0,
    liveCommercePct:5.0,
    auctionSuccessPct:6.0,
    sourcingSuccessPct:1.5,
    fulfillmentServicePct:8.0,
    promotedCommercePct:10.0
  }
  const notes={
    transactionOrchestrationPct:'Illustrative TRYAMM platform fee on eligible transactions; payment processor/carrier/customs fees remain separate.',
    liveCommercePct:'Illustrative fee for sales originated through TRYAMM LIVE commerce.',
    auctionSuccessPct:'Illustrative success fee for auctions closed through the platform.',
    sourcingSuccessPct:'Illustrative fee on verified sourcing orders completed through TRYAMM.',
    fulfillmentServicePct:'Illustrative service margin on third-party fulfillment/logistics costs, not ownership of provider revenue.',
    promotedCommercePct:'Illustrative ad/promoted-placement spend retained by TRYAMM, subject to actual ad economics.'
  }
  const n=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0
  const pct=(base,rate)=>n(base)*(n(rate)/100)
  function model(input={}){
    const gmv=n(input.gmv),liveGmv=Math.min(gmv,n(input.liveGmv)),auctionGmv=Math.min(gmv,n(input.auctionGmv)),sourcedPo=n(input.sourcedPo),fulfillmentSpend=n(input.fulfillmentSpend),adSpend=n(input.adSpend),growthSellers=Math.floor(n(input.growthSellers)),proSellers=Math.floor(n(input.proSellers)),supplierMembers=Math.floor(n(input.supplierMembers))
    const baseTransaction=pct(Math.max(0,gmv-liveGmv-auctionGmv),pricing.transactionOrchestrationPct)
    const liveCommerce=pct(liveGmv,pricing.liveCommercePct)
    const auctions=pct(auctionGmv,pricing.auctionSuccessPct)
    const sourcing=pct(sourcedPo,pricing.sourcingSuccessPct)
    const fulfillment=pct(fulfillmentSpend,pricing.fulfillmentServicePct)
    const promotedCommerce=pct(adSpend,pricing.promotedCommercePct)
    const subscriptions=growthSellers*pricing.sellerPlans.growth.monthly+proSellers*pricing.sellerPlans.pro.monthly+supplierMembers*pricing.supplierNetwork.monthly
    const grossPlatformRevenue=baseTransaction+liveCommerce+auctions+sourcing+fulfillment+promotedCommerce+subscriptions
    return {inputs:{gmv,liveGmv,auctionGmv,sourcedPo,fulfillmentSpend,adSpend,growthSellers,proSellers,supplierMembers},revenue:{baseTransaction,liveCommerce,auctions,sourcing,fulfillment,promotedCommerce,subscriptions,grossPlatformRevenue},pricing,illustrative:true,excludes:['payment-processor-fees','carrier-costs','customs-and-duties','refunds-and-chargebacks','taxes','payroll','cloud-costs','partner-revenue-shares','insurance-or-finance-provider-costs']}
  }
  function annualize(monthly){const m=n(monthly);return {monthly:m,annual:m*12}}
  function milestonePlan(){return [
    {stage:'Wedge',goal:'25 paying sellers + 10 verified suppliers',focus:'Low-MOQ creator sourcing and LIVE/DTC fulfillment',proof:'first repeat sourcing-to-sale loop'},
    {stage:'Repeatability',goal:'100 paying sellers + $250k monthly GMV',focus:'supplier score, inventory sync, landed cost, auctions/live commerce',proof:'repeat orders and positive contribution margin'},
    {stage:'Network',goal:'500 paying sellers + multi-region supplier base',focus:'trade graph, virtual warehouse, routing, APIs',proof:'buyers and suppliers both return because network data improves outcomes'},
    {stage:'Platform',goal:'partner-connected logistics/payments/insurance/financing',focus:'embedded services and enterprise workflows',proof:'multiple revenue lines per transaction without owning every physical asset'}
  ]}
  window.TRYAMMSupplyChainRevenue={version:VERSION,pricing,notes,model,annualize,milestonePlan}
  window.dispatchEvent(new CustomEvent('tryamm:supply-chain-revenue-ready',{detail:{version:VERSION,pricing,illustrative:true,chargesEnabled:false}}))
})()
