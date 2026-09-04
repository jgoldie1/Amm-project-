(()=>{
  const VERSION='20260903-dealdesk-v1'
  const offers={
    foundingSeller:{
      name:'Founding Seller Pilot',
      setup:299,
      monthly:49,
      successPct:2.0,
      ideal:'Creator, microbrand, local business or first-time product seller',
      includes:['seller onboarding','one product launch plan','virtual inventory setup','LIVE/DTC sales lane','landed-cost model','30-day founder scorecard']
    },
    sourcingSprint:{
      name:'Low-MOQ Sourcing Sprint',
      setup:499,
      monthly:0,
      successPct:1.5,
      ideal:'Business that needs supplier options before buying inventory',
      includes:['NDA-gated sourcing brief','supplier comparison','MOQ/lead-time comparison','landed-cost scenarios','supplier risk score','handoff to purchase-order workflow']
    },
    launchFulfill:{
      name:'Launch + Fulfillment Pilot',
      setup:1500,
      monthly:149,
      successPct:2.0,
      ideal:'Brand ready to source, launch, sell and route orders through one operating layer',
      includes:['sourcing workflow','virtual warehouse','DTC fulfillment map','LIVE commerce setup','auction option','returns/reorder workflow','founder KPI review']
    },
    supplierFounding:{
      name:'Founding Supplier Network',
      setup:0,
      monthly:99,
      successPct:0,
      ideal:'Supplier, manufacturer, wholesaler or fulfillment provider seeking qualified TRYAMM demand',
      includes:['supplier profile','MOQ/capacity profile','buyer-match eligibility','compliance document checklist','quote-response workflow','supplier performance score']
    },
    enterprise:{
      name:'Enterprise Trade Desk',
      setup:5000,
      monthly:499,
      successPct:1.0,
      ideal:'Established merchant or organization needing custom sourcing, routing, compliance and marketplace orchestration',
      includes:['multi-user workspace','custom sourcing lanes','route resilience scenarios','compliance vault','virtual warehouse controls','executive reporting','provider integration plan']
    }
  }
  const n=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0
  function quote(offerId,input={}){
    const offer=offers[offerId];if(!offer)return {ok:false,reason:'unknown-offer'}
    const months=Math.max(1,Math.floor(n(input.months)||1)),eligibleVolume=n(input.eligibleVolume)
    const setup=n(offer.setup),subscription=n(offer.monthly)*months,successFee=eligibleVolume*(n(offer.successPct)/100),total=setup+subscription+successFee
    return {ok:true,offerId,offer,months,eligibleVolume,setup,subscription,successFee,total,illustrative:true,chargesEnabled:false,disclaimer:'Draft commercial quote only. Taxes, payment processing, shipping, customs, third-party provider fees and negotiated contract terms are excluded.'}
  }
  function firstCustomers(input={}){
    const customers=Math.max(0,Math.floor(n(input.customers))),setup=n(input.setup),monthly=n(input.monthly),months=Math.max(1,Math.floor(n(input.months)||1)),avgMonthlyGmv=n(input.avgMonthlyGmv),transactionPct=n(input.transactionPct)
    const setupRevenue=customers*setup,subscriptionRevenue=customers*monthly*months,transactionRevenue=customers*avgMonthlyGmv*months*(transactionPct/100)
    return {customers,months,setupRevenue,subscriptionRevenue,transactionRevenue,total:setupRevenue+subscriptionRevenue+transactionRevenue,illustrative:true,chargesEnabled:false}
  }
  function pipelineMath(input={}){
    const leads=Math.max(0,Math.floor(n(input.leads))),qualificationRate=Math.min(100,n(input.qualificationRate)),closeRate=Math.min(100,n(input.closeRate)),avgFirstYearValue=n(input.avgFirstYearValue)
    const qualified=Math.round(leads*(qualificationRate/100)),customers=Math.round(qualified*(closeRate/100)),bookedValue=customers*avgFirstYearValue
    return {leads,qualified,customers,bookedValue,qualificationRate,closeRate,avgFirstYearValue,illustrative:true}
  }
  const wedge=[
    'Start with creators and small businesses that need 25–500 units, not giant enterprise supply chains.',
    'Sell the outcome: “find a viable supplier + know your landed cost + launch without guessing,” not software seats.',
    'Require a verified sourcing brief before supplier introductions so suppliers are not flooded with weak leads.',
    'Turn every completed order into reusable supplier, lead-time, defect, route and demand intelligence.',
    'Use LIVE commerce and creator demand signals before large inventory commitments; preorders can validate demand when legally and operationally appropriate.',
    'Make the seller keep one TRYAMM product passport from sourcing through sale, delivery, return and reorder. That data continuity becomes the moat.'
  ]
  window.TRYAMMSupplyChainDealDesk={version:VERSION,offers,quote,firstCustomers,pipelineMath,wedge,chargesEnabled:false}
  window.dispatchEvent(new CustomEvent('tryamm:supply-chain-dealdesk-ready',{detail:{version:VERSION,offers:Object.keys(offers),chargesEnabled:false}}))
})()
