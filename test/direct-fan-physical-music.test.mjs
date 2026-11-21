import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {PHYSICAL_RELEASE_FORMATS,FAN_MARKETING_STAGES,calculateDirectMusicMargin} from '../amm-omniverse/src/lib/music/directFanPhysicalMusic.mjs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('physical releases include vinyl CD and bundle with rights and production proof gates',()=>{
 assert.deepEqual(PHYSICAL_RELEASE_FORMATS.map(x=>x.id),['vinyl-12','cd','bundle'])
 assert.ok(PHYSICAL_RELEASE_FORMATS.slice(0,2).every(x=>x.requiredAssets.some(y=>/rights/i.test(y))))
 assert.ok(FAN_MARKETING_STAGES.some(x=>x.id==='audience'&&/consent/i.test(x.instruction)))
})
test('single-copy on-demand order models manufacturing, fees, royalties, packaging, shipping and refunds',()=>{
 const b=calculateDirectMusicMargin({units:1,pricePerUnit:30,manufacturingTotal:14,artworkTotal:0,packagingPerUnit:1,postagePerUnit:5,paymentFeePercent:3,paymentFeeFixed:.3,marketingTotal:0,royaltyPerUnit:2,refundReservePerUnit:1})
 assert.equal(b.gross,30)
 assert.equal(b.totalCost,24.2)
 assert.equal(b.netBeforeTax,5.8)
 assert.equal(b.breakEvenUnits,1)
})
test('negative costs and impossible quantities are rejected',()=>{
 const base={units:10,pricePerUnit:20,manufacturingTotal:100,artworkTotal:10,packagingPerUnit:1,postagePerUnit:1,paymentFeePercent:3,paymentFeeFixed:.3,marketingTotal:0,royaltyPerUnit:1,refundReservePerUnit:.5}
 assert.equal(calculateDirectMusicMargin({...base,units:0}),null)
 assert.equal(calculateDirectMusicMargin({...base,royaltyPerUnit:-1}),null)
 assert.equal(calculateDirectMusicMargin({...base,units:1.3}),null)
 assert.equal(calculateDirectMusicMargin({...base,paymentFeePercent:101}),null)
})
test('direct fan UI is integrated without accidental checkout, payment or automated fulfillment',()=>{
 const studio=read('amm-omniverse/src/components/Aniyah64TrackStudio.tsx')
 const ui=read('amm-omniverse/src/components/DirectFanPhysicalMusic.tsx')
 assert.match(studio,/mode==='physical'/)
 assert.match(studio,/DirectFanPhysicalMusic/)
 assert.match(ui,/Vinyl & CD on Demand/)
 assert.match(ui,/DRAFT_ONLY/)
 assert.match(ui,/pressAuthorized:false/)
 assert.match(ui,/chargeAuthorized:false/)
 assert.match(ui,/shipmentAuthorized:false/)
 assert.match(ui,/authorizedToPress|pressAuthorized:false/)
 assert.doesNotMatch(ui,/fetch\(|createPaymentIntent|submitOrder|placeOrder\(/)
 assert.match(ui,/aria-pressed/)
 assert.match(ui,/EXPORT PRIVATE RELEASE PLAN/)
})
