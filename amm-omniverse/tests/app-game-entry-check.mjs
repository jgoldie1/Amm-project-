import assert from 'node:assert/strict'
import fs from 'node:fs'
const main = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
const safe = fs.readFileSync(new URL('../src/components/StreetVerseSafeWorld.tsx', import.meta.url), 'utf8')
assert.ok(main.includes("currentPath.startsWith('/streetverse')"))
assert.ok(main.includes('StreetVerseGeoSpawnBridge'))
assert.ok(safe.includes('CircleParkHolographicWorld'))
assert.ok(safe.includes('StreetVerseMobilePlayableWorld'))
console.log('App and StreetVerse entry wiring: PASS')
