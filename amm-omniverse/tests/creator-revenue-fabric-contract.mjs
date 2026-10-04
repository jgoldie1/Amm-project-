import fs from 'node:fs'
const runtime=fs.readFileSync(new URL('../src/runtime/CreatorRevenueFabricRuntime.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const ledger=fs.readFileSync(new URL('../src/commerce/transactionOrchestrator.ts',import.meta.url),'utf8')
const passport=fs.readFileSync(new URL('../src/commerce/businessPassport.ts',import.meta.url),'utf8')

for(const x of [
  'tryamm.revenue.intent.v1','tryamm.revenue.bundle.v1',
  'product-sale','service-booking','event-ticket','subscription','verified-gift',
  'sponsored-mission','creator-affiliate','scout-referral','asset-license',
  'remix-license','virtual-rental','business-campaign','digital-twin-sponsorship',
  'tryamm:commerce-intent-request','tryamm:sponsored-mission-request',
  'tryamm:remix-license-request','tryamm:scene-to-sale-candidate',
  'requiresServerVerification:true','clientMayCreatePayableBalance:false',
  'attributionLocked:true','rewardAuthority:\'server-ledger\''
])if(!runtime.includes(x))throw new Error('Revenue Fabric missing '+x)

if(!main.includes('installCreatorRevenueFabricRuntime'))throw new Error('Revenue Fabric not installed')
for(const x of ['CREATOR_COMMISSION','SCOUT_COMMISSION','TRYAMM_REVENUE','server-authoritative persistence'])if(!ledger.includes(x))throw new Error('authoritative commerce ledger missing '+x)
if(!passport.includes('AUTHORITATIVE_PRICE_RESOLUTION'))throw new Error('Business Passport authoritative pricing gate missing')

console.log('Creator Revenue Fabric contract: PASS')
