import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {SUGGESTED_DISTRIBUTION_FEE_PERCENT,PHYSICAL_DISTRIBUTION_POLICY,quoteDistributionFee,INDEPENDENT_CHART_CATEGORIES,CHART_GOVERNANCE,aggregateIndependentMusicCharts} from '../amm-omniverse/src/lib/music/independentDistributionCharts.mjs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('transparent suggested physical release fee excludes tax and shipping and avoids double platform fee',()=>{
 assert.equal(SUGGESTED_DISTRIBUTION_FEE_PERCENT,7)
 assert.equal(PHYSICAL_DISTRIBUTION_POLICY.noDoubleFee,true)
 const quote=quoteDistributionFee({itemSubtotal:40,feePercent:7})
 assert.equal(quote.distributionFee,2.8)
 assert.equal(quote.artistMerchantItemProceedsBeforeOtherCosts,37.2)
 assert.equal(quoteDistributionFee({itemSubtotal:40,feePercent:7,alreadyPlatformCharged:true}).distributionFee,0)
 assert.equal(quoteDistributionFee({itemSubtotal:40,refundedSubtotal:40}).distributionFee,0)
 assert.equal(quoteDistributionFee({itemSubtotal:40,feePercent:50}),null)
})
test('independent chart excludes refunds, duplicate orders, fraud and unverified activity',()=>{
 const start=100,end=200
 const valid=(overrides={})=>({saleId:'001',artistId:'artist-A',trackId:'song-A',timestamp:130,status:'delivered',paymentVerified:true,fulfillmentVerified:true,rightsApproved:true,artistOptIn:true,suspicious:false,...overrides})
 const rows=[
  valid(),
  valid(), // duplicate
  valid({saleId:'002'}),
  valid({saleId:'003',status:'refunded'}),
  valid({saleId:'003',status:'delivered'}), // reversed order
  valid({saleId:'004',suspicious:true}),
  valid({saleId:'005',paymentVerified:false}),
  valid({saleId:'006',artistOptIn:false}),
  valid({saleId:'007',timestamp:400}),
  valid({saleId:'008',trackId:'song-B',timestamp:140})
 ]
 const totals=aggregateIndependentMusicCharts(rows,{start,end})
 assert.deepEqual(totals.map(r=>[r.trackId,r.verifiedUnits]),[['song-A',2],['song-B',1]])
})
test('charts are independent and no paid advertisement influences rank',()=>{
 assert.equal(INDEPENDENT_CHART_CATEGORIES.length,4)
 assert.match(CHART_GOVERNANCE.separation,/must not influence/)
 assert.match(CHART_GOVERNANCE.status,/not yet implemented/)
})
test('Aniyah physical distribution is proposal only and merchant checkout remains blocked',()=>{
 const s=read('amm-omniverse/src/components/DirectFanPhysicalMusic.tsx')
 assert.match(s,/quoteDistributionFee/)
 assert.match(s,/Existing TRYAMM platform share already applies/)
 assert.match(s,/chartsNotVerified:true/)
 assert.match(s,/PLANNED • NO VERIFIED RANKINGS YET/)
 assert.match(s,/pressAuthorized:false,chargeAuthorized:false/)
 assert.doesNotMatch(s,/createPaymentIntent|processPayment|submitOrder\(/)
})
