(()=>{
  const VERSION='20260903-delivery-v1'
  const state={connections:{carriers:false,inventory:false,coldChain:false,addressValidation:false},promotions:{freeOvernightFunded:false},cutoffHourLocal:14}
  const n=v=>Number.isFinite(Number(v))?Number(v):0
  function evaluate(input={}){
    const now=input.now?new Date(input.now):new Date()
    const hour=Number.isFinite(Number(input.localHour))?Number(input.localHour):now.getHours()
    const orderTotal=n(input.orderTotal)
    const inventoryLocal=Boolean(input.inventoryLocal)
    const addressEligible=Boolean(input.addressEligible)
    const carrierAvailable=Boolean(input.carrierAvailable||state.connections.carriers)
    const coldRequired=Boolean(input.coldRequired)
    const coldReady=!coldRequired||Boolean(input.coldChainReady||state.connections.coldChain)
    const funded=Boolean(input.freeOvernightFunded||state.promotions.freeOvernightFunded)
    const beforeCutoff=hour<state.cutoffHourLocal
    const reasons=[]
    if(!inventoryLocal)reasons.push('eligible inventory is not positioned close enough for overnight service')
    if(!addressEligible)reasons.push('destination has not been verified inside the overnight service area')
    if(!carrierAvailable)reasons.push('overnight carrier/service connection is not verified')
    if(!coldReady)reasons.push('required cold-chain overnight handling is not verified')
    if(!beforeCutoff)reasons.push(`order missed the ${state.cutoffHourLocal}:00 local cutoff`)
    if(!funded)reasons.push('free-delivery subsidy/promotion is not funded')
    const overnightAvailable=inventoryLocal&&addressEligible&&carrierAvailable&&coldReady&&beforeCutoff
    const freeOvernight=overnightAvailable&&funded
    return {
      overnightAvailable,
      freeOvernight,
      orderTotal,
      options:[
        {id:'free-overnight',label:'FREE OVERNIGHT',price:0,eligible:freeOvernight,reason:freeOvernight?'Funded eligible overnight order.':reasons.join(' • ')},
        {id:'paid-overnight',label:'OVERNIGHT',price:null,eligible:overnightAvailable,reason:overnightAvailable?'Carrier rate required at checkout.':reasons.filter(r=>!r.includes('subsidy')).join(' • ')},
        {id:'pickup',label:'STORE / CURBSIDE PICKUP',price:0,eligible:Boolean(input.pickupAvailable),reason:Boolean(input.pickupAvailable)?'Pickup location available.':'No verified pickup location.'},
        {id:'same-day',label:'SAME-DAY',price:null,eligible:Boolean(input.sameDayAvailable),reason:Boolean(input.sameDayAvailable)?'Same-day provider available.':'Same-day provider not verified.'},
        {id:'standard',label:'STANDARD DELIVERY',price:null,eligible:true,reason:'Rate and ETA depend on verified carrier/service area.'}
      ],
      truthBoundary:'Free overnight is a funded promotion/merchant benefit, not an unlimited carrier promise. Checkout must confirm address, inventory, cutoff, carrier and cold-chain eligibility.'
    }
  }
  function configure(input={}){
    if(input.connections)state.connections={...state.connections,...input.connections}
    if(input.promotions)state.promotions={...state.promotions,...input.promotions}
    if(Number.isFinite(Number(input.cutoffHourLocal)))state.cutoffHourLocal=Math.max(0,Math.min(23,Number(input.cutoffHourLocal)))
    return snapshot()
  }
  const snapshot=()=>JSON.parse(JSON.stringify({version:VERSION,...state}))
  window.TRYAMMDeliveryOptions={version:VERSION,evaluate,configure,snapshot}
  window.addEventListener('tryamm:delivery-options-request',e=>window.dispatchEvent(new CustomEvent('tryamm:delivery-options-result',{detail:evaluate(e.detail||{})})))
  window.dispatchEvent(new CustomEvent('tryamm:delivery-options-ready',{detail:snapshot()}))
})()
