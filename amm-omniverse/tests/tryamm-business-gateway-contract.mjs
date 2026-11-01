import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const main=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const gateway=readFileSync(new URL('../src/components/TryammPublicGateway.tsx',import.meta.url),'utf8')
for(const component of ['TryammPublicGateway','TryammSponsorFunding','TryammWhitePaper'])assert.ok(main.includes("lazy(()=>import('./components/"+component+"'))"),'Missing lazy import: '+component)
for(const route of ['/discover','/sponsors','/whitepaper'])assert.ok(main.includes("currentPath==='"+route+"'"),'Missing route: '+route)
assert.ok(main.includes("else if(isStreetVerse)routeContent"),'StreetVerse must remain intact')
assert.ok(gateway.includes('Website Preview')&&gateway.includes('$499'),'Business service offer must remain')
assert.ok(gateway.includes('Reduced motion'),'Carousel reduced-motion control must remain')
console.log('TRYAMM original business gateway source contract: PASS')
