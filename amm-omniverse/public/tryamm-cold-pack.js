(()=>{
  const VERSION='20260903-cold-pack-v1'
  const profiles={
    chilled:{id:'chilled',label:'Chilled Cold Pack',target:'refrigerated',packaging:['insulated shipper','sealed food-safe inner packaging','frozen gel packs','tamper-evident seal'],defaultFee:6.99,requiresDryIce:false},
    frozen:{id:'frozen',label:'Frozen Meat Pack',target:'frozen',packaging:['insulated shipper','sealed food-safe inner packaging','frozen coolant packs','tamper-evident seal'],defaultFee:9.99,requiresDryIce:false},
    deepFrozen:{id:'deep-frozen',label:'Deep-Frozen / Dry-Ice Lane',target:'deep-frozen',packaging:['approved insulated shipper','sealed food-safe inner packaging','provider-approved dry-ice packout','required carrier markings/documentation','tamper-evident seal'],defaultFee:14.99,requiresDryIce:true}
  }
  const state={connections:{approvedPackaging:false,coldStorage:false,temperatureMonitoring:false,dryIceCarrierApproval:false},pricing:{chilled:6.99,frozen:9.99,deepFrozen:14.99,tempMonitor:1.99,packingLabor:2.5,platformMargin:1.5}}
  const n=v=>Number.isFinite(Number(v))?Number(v):0
  const round=v=>Math.round((n(v)+Number.EPSILON)*100)/100
  function selectProfile(input={}){
    const category=String(input.category||'').toLowerCase()
    const requested=String(input.profile||'').toLowerCase()
    if(requested&&profiles[requested])return requested
    if(['beef','poultry','chicken','pork','lamb','goat','seafood','meat'].some(x=>category.includes(x)))return input.deepFrozen?'deepFrozen':'frozen'
    if(['dairy','eggs','produce','fresh','refrigerated'].some(x=>category.includes(x)))return 'chilled'
    return 'chilled'
  }
  function quote(input={}){
    const profileId=selectProfile(input),profile=profiles[profileId]
    const packBase=n(input.packagingFee||state.pricing[profileId]||profile.defaultFee)
    const tempMonitor=Boolean(input.temperatureMonitor)?n(input.tempMonitorFee||state.pricing.tempMonitor):0
    const labor=n(input.packingLabor||state.pricing.packingLabor)
    const margin=n(input.platformMargin||state.pricing.platformMargin)
    const total=round(packBase+tempMonitor+labor+margin)
    const approvedPackaging=Boolean(input.approvedPackaging||state.connections.approvedPackaging)
    const coldStorage=Boolean(input.coldStorage||state.connections.coldStorage)
    const dryIceReady=!profile.requiresDryIce||Boolean(input.dryIceCarrierApproval||state.connections.dryIceCarrierApproval)
    const reasons=[]
    if(!approvedPackaging)reasons.push('approved insulated food-shipping packaging not verified')
    if(!coldStorage)reasons.push('cold-storage handoff not verified')
    if(!dryIceReady)reasons.push('dry-ice carrier/handling approval not verified')
    const ready=approvedPackaging&&coldStorage&&dryIceReady
    return {ready,profile:{...profile},pricing:{packBase,tempMonitor,labor,margin,total},reasons,requirements:['food-safe sealed inner packaging','insulated outer shipper','coolant matched to product profile','tamper-evident closeout','pack timestamp','lot/SKU traceability','carrier handoff proof',...(input.temperatureMonitor?['temperature indicator / logger record']:[])],truthBoundary:'Cold-pack software can price and verify fulfillment evidence, but physical packaging, coolant quantities, carrier acceptance and food-safety procedures must follow the approved packout and provider rules.'}
  }
  function createPackout(input={}){
    const q=quote(input)
    return {id:String(input.id||('COLD-'+Date.now())),sku:String(input.sku||''),lot:String(input.lot||''),profile:q.profile.id,status:q.ready?'ready-to-pack':'hold',quote:q,events:[{at:new Date().toISOString(),type:'packout-created'}],verified:false}
  }
  function addEvent(packout,event={}){
    if(!packout||!Array.isArray(packout.events))return null
    const next={at:event.at||new Date().toISOString(),type:String(event.type||'status'),temperature:event.temperature??null,proof:String(event.proof||''),source:String(event.source||'unverified')}
    packout.events.push(next);packout.status=next.type
    if(next.type==='carrier-handoff-verified')packout.verified=true
    return packout
  }
  function configure(input={}){
    if(input.connections)state.connections={...state.connections,...input.connections}
    if(input.pricing)state.pricing={...state.pricing,...Object.fromEntries(Object.entries(input.pricing).map(([k,v])=>[k,n(v)]))}
    return snapshot()
  }
  const snapshot=()=>JSON.parse(JSON.stringify({version:VERSION,profiles,state}))
  window.TRYAMMColdPack={version:VERSION,profiles,quote,createPackout,addEvent,configure,snapshot}
  window.dispatchEvent(new CustomEvent('tryamm:cold-pack-ready',{detail:{version:VERSION,profiles:Object.keys(profiles),connections:{...state.connections},pricing:{...state.pricing}}}))
})()
