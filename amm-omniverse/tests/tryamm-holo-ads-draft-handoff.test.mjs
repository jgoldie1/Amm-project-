import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {prepareHoloAdDraft,HOLO_AD_PRODUCTS} from '../src/runtime/HoloAdsRevenueRuntime.ts'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')

assert.ok(HOLO_AD_PRODUCTS.some(p=>p.id==='xr'))
assert.equal(prepareHoloAdDraft({productId:'unknown'}),null,'unknown ad products rejected')
const draft=prepareHoloAdDraft({
 productId:'xr',market:'Chicago',objective:'product-discovery',
 advertiserName:'Riverdale <Records>',productName:'Album <Launch>',
 surfaces:['holo-reel','streetverse-world','streetverse-world','omnibox-story','invalid']
})
assert.ok(draft)
assert.equal(draft.product.id,'xr')
assert.equal(draft.advertiserName,'Riverdale Records')
assert.equal(draft.productName,'Album Launch')
assert.deepEqual(draft.surfaces,['holo-reel','streetverse-world','omnibox-story'])
assert.equal(draft.status,'draft')
assert.equal(draft.rightsStatus,'review-required')
assert.equal(draft.billable,false)
assert.equal(draft.serverVerified,false)
assert.equal(draft.persisted,false)
assert.equal(draft.published,false)
assert.ok(draft.disclosure.includes('ADVERTISEMENT'))
const malformed=prepareHoloAdDraft({productId:'boost',surfaces:['a','b','c'],advertiserName:'A'.repeat(200)})
assert.ok(malformed)
assert.equal(malformed.advertiserName.length,90)
assert.deepEqual(malformed.surfaces,[])
const builder=read('src/components/TryammPlacementBriefBuilder.tsx')
const ads=read('src/runtime/HoloAdsRevenueRuntime.ts')
assert.ok(builder.includes('advertiserName:brief.brand'))
assert.ok(builder.includes('productName:brief.product'))
assert.ok(builder.includes('surfaces:brief.surfaces'))
assert.ok(ads.includes('tryamm:holo-ads-campaign-rejected'))
assert.ok(ads.includes('tryamm:holo-ads-campaign-draft'))
assert.ok(!ads.includes('chargeCustomer(')&&!ads.includes('billImpression('))
console.log('TRYAMM Holo Ads draft preserves rights-gated product and placement details PASS')
