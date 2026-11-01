import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const main=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const whitepaper=readFileSync(new URL('../src/components/TryammWhitePaper.tsx',import.meta.url),'utf8')
const gateway=readFileSync(new URL('../src/components/TryammPublicGateway.tsx',import.meta.url),'utf8')
for(const component of ['TryammPublicGateway','TryammSponsorFunding','TryammWhitePaper'])assert.ok(main.includes("lazy(()=>import('./components/"+component+"'))"),'Missing lazy import: '+component)
for(const route of ['/discover','/sponsors','/whitepaper'])assert.ok(main.includes("currentPath==='"+route+"'"),'Missing route: '+route)
assert.ok(main.includes("else if(isStreetVerse)routeContent"),'StreetVerse must remain intact')
assert.ok(gateway.includes('Website Preview')&&gateway.includes('$499'),'Business service offer must remain')
assert.ok(gateway.includes('Reduced motion'),'Carousel reduced-motion control must remain')
assert.ok(gateway.includes('Platform White Paper'),'Permanent business navigation must expose the white paper')
for(const topic of ['StreetVerse and living worlds','Three-layer internal chain architecture','Accessibility and Stubbs Mobility','Permanent business website and packages','Security, infrastructure and regression policy'])assert.ok(whitepaper.includes(topic),'White paper missing '+topic)
console.log('TRYAMM original business gateway and white paper source contract: PASS')
