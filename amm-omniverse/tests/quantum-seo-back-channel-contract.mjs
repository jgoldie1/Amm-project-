import fs from 'node:fs'
const seo=fs.readFileSync(new URL('../src/services/quantumSeo.ts',import.meta.url),'utf8')
const back=fs.readFileSync(new URL('../src/services/backChannel.ts',import.meta.url),'utf8')
const run=fs.readFileSync(new URL('../src/runtime/QuantumGrowthEngine.ts',import.meta.url),'utf8')
for(const x of ['whiteHatOnly:true','noFakeReviews:true','structuredData:true','StreetVerse business location'])if(!seo.includes(x))throw new Error('Quantum SEO missing '+x)
for(const x of ['permissionBased:true','consentRequiredForMarketing:true','noPurchasedSpamLists:true','OPT-OUT / PREFERENCE CENTER'])if(!back.includes(x))throw new Error('Back Channel missing '+x)
for(const x of ['quantumSeo:true','backChannel:true'])if(!run.includes(x))throw new Error('Growth runtime missing '+x)
console.log('Quantum SEO + Back Channel contract: PASS')