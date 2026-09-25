import assert from 'node:assert/strict'
import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/commerce/transactionOrchestrator.ts',import.meta.url),'utf8')
for(const x of ['INVENTORY_RESERVED','PAYMENT_PENDING','PAYMENT_VERIFIED','FULFILLING','FULFILLED','MERCHANT_PROCEEDS','CREATOR_COMMISSION','SCOUT_COMMISSION','TRYAMM_REVENUE',"NonCashClass = 'XP' | 'HOLO_CREDITS'",'cashValueMinor: 0','Inventory reservation required before payment','Provider payment evidence does not reconcile to order','Verified provider payment required before fulfillment','Fulfilled order required before payable ledger creation','Money allocation must reconcile exactly to order total','Creator commission requires attributed creator','Scout commission requires attributed scout','reverseMoneyEvents','server-authoritative persistence']) assert.ok(s.includes(x),'Transaction authority missing: '+x)
assert.doesNotMatch(s,/HOLO_CREDITS[^\n]{0,120}(PAYABLE|amountMinor)/,'Holo Credits must not become payable money')
console.log('Commerce transaction / ledger separation contract: PASS')
