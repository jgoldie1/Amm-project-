import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/commerce/transactionOrchestrator.ts',import.meta.url),'utf8')
for(const x of ['INVENTORY_RESERVED','PAYMENT_PENDING','PAYMENT_VERIFIED','FULFILLING','FULFILLED','MERCHANT_PROCEEDS','CREATOR_COMMISSION','SCOUT_COMMISSION','TRYAMM_REVENUE',"NonCashClass = 'XP' | 'HOLO_CREDITS'",'cashValueMinor: 0','Provider payment evidence does not reconcile to order','Money allocation must reconcile exactly to order total','Creator commission requires attributed creator','Scout commission requires attributed scout','reverseMoneyEvents','Real-money payable ledgers require reconciled provider payment evidence']){
 if(!s.includes(x)) throw new Error('Transaction contract missing: '+x)
}
if(/HOLO_CREDITS[^\n]{0,100}(PAYABLE|amountMinor)/.test(s)) throw new Error('Holo Credits must not become payable money')
console.log('Commerce transaction / ledger separation contract: PASS')
