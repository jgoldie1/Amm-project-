import fs from 'node:fs'
const prices=fs.readFileSync(new URL('../src/data/ElSaturnLaunchPriceBook.ts',import.meta.url),'utf8')
const catalog=fs.readFileSync(new URL('../src/data/ElSaturnBusinessRevenueCatalog.ts',import.meta.url),'utf8')
const family=fs.readFileSync(new URL('../src/data/familyBusinessRegistry.ts',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/ElSaturnBusinessRevenueCenter.tsx',import.meta.url),'utf8')
for(const x of ['AI Business OS','Business Server Package','AI Workforce + Contact Center','Logistics + Fleet OS','Omnichannel Commerce Network','El Saturn Fintech Orchestration','Creator Revenue Network','Robotic Fabrication Cell Services','12D Fabrication Service','Distributed Print Swarm Network','Holo Services Suite'])if(!prices.includes(x))throw new Error('Missing priced platform offer '+x)
for(const x of ['starter','pro','commerce','managed','monthlyLeaseUsd','setupUsd','buyoutUsd'])if(!prices.includes(x))throw new Error('Missing Business-in-a-Box pricing field '+x)
if(!catalog.includes('pricing:priceFor(product.id)'))throw new Error('Catalog pricing not attached')
for(const x of ['BUSINESS_COMPLETION_STAGES','recommendedBusinessPackage','businessCompletionPlan','readyToSellPackage:true'])if(!family.includes(x))throw new Error('Business completion model missing '+x)
const registryCount=(family.match(/status:'registry'/g)||[]).length+(family.match(/status:'site-ready'/g)||[]).length+(family.match(/status:'domain-pending'/g)||[]).length+(family.match(/status:'live'/g)||[]).length
if(registryCount!==26)throw new Error('Expected 26 registered business profiles; found '+registryCount)
for(const x of ['LEASE / SUBSCRIPTION','Business-in-a-Box lease / buyout'])if(!ui.includes(x))throw new Error('Revenue UI missing '+x)
console.log('Business completion + pricing contract: PASS')