import assert from 'node:assert/strict'
import fs from 'node:fs'
const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
const hub=fs.readFileSync(new URL('../src/components/StreetVerseFreePlayHub.tsx',import.meta.url),'utf8')
assert.match(app,/if \(open === 'free-play'\) setShowFreePlay\(true\)/)
assert.match(app,/showFreePlay && <StreetVerseFreePlayHub/)
assert.match(hub,/href:'\/streetverse'/)
assert.match(hub,/Creator Academy/)
assert.match(hub,/Creator Studio/)
assert.match(hub,/Business Marketplace/)
assert.match(hub,/minHeight:48/)
assert.match(hub,/cannot be cashed out/)
console.log('StreetVerse free play deep-link and one-handed creator entry contract PASS')
