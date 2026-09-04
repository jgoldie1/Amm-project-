(()=>{
  const VERSION='20260903-delivery-v3'
  const state={
    connections:{carriers:false,inventory:false,coldChain:false,addressValidation:false},
    promotions:{freeOvernightFunded:false,memberFreeOvernight:false},
    pricing:{overnightBase:14.99,coldChainSurcharge:5.99,handlingFee:2.5,platformMargin:2.5,freeOvernightOrderMinimum:125},
    cutoffHourLocal:14
  }
  const n=v=>Number.isFinite(Number(v))?Number(v):0
  const round=v=>Math.round((n(v)+Number.EPSILON)*100)/100
  function evaluate(input={}){
    const now=input.now?new Date(input.now):new Date()
    const hour=Number.isFinite(Number(input.localHour))?Number(input.localHour):now.getHours()
    const orderTotal=n(input.orderTotal)
    const inventoryLocal=Boolean(input.inventoryLocal)
    const addressEligible=Boolean(input.addressEligible)
    const carrierAvailable=Boolean(input.carrierAvailable||state.connections.carriers)
    const coldRequired=Boolean(input.coldRequired)
    const coldPack=coldRequired&&window.TRYAMMColdPack?.quote?window.TRYAMMColdPack.quote({category:input.coldCategory||input.category||'meat',profile:input.coldPackProfile,deepFrozen:Boolean(input.deepFrozen),temperatureMonitor:Boolean(input.temperatureMonitor),approvedPackaging:Boolean(input.approvedPackaging),coldStorage:Boolean(input.coldStorage||input.coldChainReady||state.connections.coldChain),dryIceCarrierApproval:Boolean(input.dryIceCarrierApproval)}):null
    const coldPackReady=!coldRequired||Boolean(coldPack?.ready||input.coldPackReady)
    const coldReady=!coldRequired||Boolean(input.coldChainReady||state.connections.coldChain)
    const funded=Boolean(input.freeOvernightFunded||state.promotions.freeOvernightFunded)
    const memberFree=Boolean(input.memberFreeOvernight||state.promotions.memberFreeOvernight)
    const beforeCutoff=hour<state.cutoffHourLocal
    const carrierCost=n(input.carrierCost)
    const base=n(input.overnightBase||state.pricing.overnightBase)
    const coldFee=coldRequired?n(input.coldChainSurcharge||state.pricing.coldChainSurcharge):0
    const coldPackFee=coldRequired?n(input.coldPackFee||(coldPack?.pricing?.total||0)):0
    const handling=n(input.handlingFee||state.pricing.handlingFee)
    const margin=n(input.platformMargin||state.pricing.platformMargin)
    const quotedCarrier=carrierCost>0?carrierCost:base
    const paidOvernightFee=round(Math.max(base,quotedCarrier)+coldFee+coldPackFee+handling+margin)
    const minimum=n(input.freeOvernightOrderMinimum||state.pricing.freeOvernightOrderMinimum)
    const promoEligible=orderTotal>=minimum||memberFree
    const reasons=[]
    if(!inventoryLocal)reasons.push('eligible inventory is not positioned close enough for overnight service')
    if(!addressEligible)reasons.push('destination has not been verified inside the overnight service area')
    if(!carrierAvailable)reasons.push('overnight carrier/service connection is not verified')
    if(!coldReady)reasons.push('required cold-chain overnight handling is not verified')
    if(!coldPackReady)reasons.push(`cold-pack fulfillment is not ready${coldPack?.reasons?.length?`: ${coldPack.reasons.join(', ')}`:''}`)
    if(!beforeCutoff)reasons.push(`order missed the ${state.cutoffHourLocal}:00 local cutoff`)
    const overnightAvailable=inventoryLocal&&addressEligible&&carrierAvailable&&coldReady&&coldPackReady&&beforeCutoff
    const freeOvernight=overnightAvailable&&promoEligible&&(funded||memberFree)
    if(!promoEligible)reasons.push(`free overnight requires a qualifying order of at least $${minimum.toFixed(2)} or an eligible membership benefit`)
    if(!(funded||memberFree))reasons.push('free-delivery subsidy or membership benefit is not funded')
    return {
      overnightAvailable,
      freeOvernight,
      orderTotal,
      coldPack,
      pricing:{paidOvernightFee,base,coldFee,coldPackFee,handling,margin,carrierCost:quotedCarrier,freeOvernightOrderMinimum:minimum},
      options:[
        {id:'paid-overnight',label:'OVERNIGHT DELIVERY',price:paidOvernightFee,eligible:overnightAvailable,reason:overnightAvailable?`Estimated overnight fee $${paidOvernightFee.toFixed(2)}${coldPackFee?` including $${coldPackFee.toFixed(2)} cold-pack fulfillment`:''} before final carrier confirmation.`:reasons.filter(r=>!r.includes('free overnight')&&!r.includes('subsidy')).join(' • ')},
        {id:'free-overnight',label:'FREE OVERNIGHT PROMO',price:0,eligible:freeOvernight,reason:freeOvernight?'Funded qualifying overnight benefit.':reasons.join(' • ')},
        {id:'pickup',label:'STORE / CURBSIDE PICKUP',price:0,eligible:Boolean(input.pickupAvailable),reason:Boolean(input.pickupAvailable)?'Pickup location available.':'No verified pickup location.'},
        {id:'same-day',label:'SAME-DAY',price:null,eligible:Boolean(input.sameDayAvailable),reason:Boolean(input.sameDayAvailable)?'Same-day provider available.':'Same-day provider not verified.'},
        {id:'standard',label:'STANDARD DELIVERY',price:null,eligible:true,reason:'Rate and ETA depend on verified carrier/service area.'}
      ],
      truthBoundary:'Overnight and cold-pack fees are configurable estimates until packaging, carrier rates, cold-chain evidence and address eligibility are verified. Free overnight remains an optional funded promotion or membership benefit.'
    }
  }
  function configure(input={}){
    if(input.connections)state.connections={...state.connections,...input.connections}
    if(input.promotions)state.promotions={...state.promotions,...input.promotions}
    if(input.pricing)state.pricing={...state.pricing,...Object.fromEntries(Object.entries(input.pricing).map(([k,v])=>[k,n(v)]))}
    if(Number.isFinite(Number(input.cutoffHourLocal)))state.cutoffHourLocal=Math.max(0,Math.min(23,Number(input.cutoffHourLocal)))
    return snapshot()
  }
  const snapshot=()=>JSON.parse(JSON.stringify({version:VERSION,...state}))
  window.TRYAMMDeliveryOptions={version:VERSION,evaluate,configure,snapshot}
  window.addEventListener('tryamm:delivery-options-request',e=>window.dispatchEvent(new CustomEvent('tryamm:delivery-options-result',{detail:evaluate(e.detail||{})})))
  window.dispatchEvent(new CustomEvent('tryamm:delivery-options-ready',{detail:snapshot()}))
})()
