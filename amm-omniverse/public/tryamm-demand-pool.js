(()=>{
  const VERSION='20260903-demand-v1'
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n))
  const num=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0
  function createPool(input={}){
    const targetUnits=Math.max(1,Math.floor(num(input.targetUnits)||100))
    const committedUnits=Math.min(targetUnits,Math.floor(num(input.committedUnits)||0))
    const unitPrice=num(input.unitPrice)||20
    const targetUnitPrice=num(input.targetUnitPrice)||Math.max(0,unitPrice*.85)
    const creators=Math.max(0,Math.floor(num(input.creators)||0))
    const buyers=Math.max(0,Math.floor(num(input.buyers)||0))
    const progress=clamp((committedUnits/targetUnits)*100,0,100)
    const unlocked=committedUnits>=targetUnits
    return {
      id:String(input.id||('POOL-'+Date.now())),
      product:String(input.product||'Creator Product'),
      targetUnits,committedUnits,remainingUnits:Math.max(0,targetUnits-committedUnits),progress,
      creators,buyers,unitPrice,targetUnitPrice,
      grossDemandValue:committedUnits*unitPrice,
      targetFactoryValue:targetUnits*targetUnitPrice,
      unlocked,
      status:unlocked?'ready-for-verified-supplier-award':'collecting-demand',
      moneyCaptured:false,
      note:'Planning/orchestration only. Payment authorization, escrow, refunds and supplier award require verified server-side commerce and provider connections.'
    }
  }
  function reverseRfq(input={}){
    const requirement={
      units:Math.max(1,Math.floor(num(input.units)||100)),
      maxUnitPrice:num(input.maxUnitPrice)||20,
      maxLeadDays:Math.max(1,Math.floor(num(input.maxLeadDays)||30)),
      minQuality:clamp(num(input.minQuality)||75,0,100),
      complianceRequired:input.complianceRequired!==false
    }
    const bids=Array.isArray(input.bids)?input.bids:[]
    const scored=bids.map((bid,i)=>{
      const unitPrice=num(bid.unitPrice),leadDays=Math.max(1,Math.floor(num(bid.leadDays)||999)),quality=clamp(num(bid.quality)||0,0,100),compliance=Boolean(bid.compliance),moq=Math.max(1,Math.floor(num(bid.moq)||requirement.units))
      const eligible=unitPrice<=requirement.maxUnitPrice&&leadDays<=requirement.maxLeadDays&&quality>=requirement.minQuality&&(!requirement.complianceRequired||compliance)&&moq<=requirement.units
      const priceScore=requirement.maxUnitPrice?clamp((1-unitPrice/requirement.maxUnitPrice)*100+50,0,100):50
      const leadScore=clamp((1-leadDays/requirement.maxLeadDays)*100+50,0,100)
      const score=Math.round(priceScore*.35+leadScore*.20+quality*.30+(compliance?100:0)*.15)
      return {id:String(bid.id||('BID-'+(i+1))),supplier:String(bid.supplier||('Supplier '+(i+1))),unitPrice,leadDays,quality,compliance,moq,eligible,score}
    }).sort((a,b)=>(b.eligible-a.eligible)||(b.score-a.score))
    return {requirement,bids:scored,recommended:scored.find(b=>b.eligible)||null,advisoryOnly:true,awardAutomatic:false}
  }
  function creatorCoalition(input={}){
    const creators=Math.max(1,Math.floor(num(input.creators)||1)),audience=Math.floor(num(input.totalAudience)||0),conversionRate=clamp(num(input.conversionRate)||2,0,100),avgUnits=Math.max(1,num(input.avgUnitsPerBuyer)||1)
    const estimatedBuyers=Math.round(audience*(conversionRate/100)),estimatedUnits=Math.round(estimatedBuyers*avgUnits)
    return {creators,totalAudience:audience,conversionRate,estimatedBuyers,estimatedUnits,forecastOnly:true}
  }
  function preorderGate(input={}){
    const pool=createPool(input)
    const minPercent=clamp(num(input.minPercentToLaunch)||80,1,100)
    const thresholdReached=pool.progress>=minPercent
    return {...pool,minPercentToLaunch:minPercent,thresholdReached,productionReleaseAllowed:false,reason:thresholdReached?'Demand threshold met; verified payment/supplier/compliance gates still required.':'Demand threshold not met.'}
  }
  window.TRYAMMDemandPool={version:VERSION,createPool,reverseRfq,creatorCoalition,preorderGate}
  window.dispatchEvent(new CustomEvent('tryamm:demand-pool-ready',{detail:{version:VERSION,features:['group-buy','creator-coalition','preorder-threshold','reverse-rfq','supplier-bid-score'],moneyCaptured:false,awardAutomatic:false}}))
})()
