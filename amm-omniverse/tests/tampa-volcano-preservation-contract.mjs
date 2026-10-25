import fs from 'node:fs'
import assert from 'node:assert/strict'
const root = new URL('../src/', import.meta.url)
const entry = fs.readFileSync(new URL('main.tsx', root), 'utf8')
const scene = fs.readFileSync(new URL('components/TampaVolcanoSafeRoute.tsx', root), 'utf8')
const expected = [
  "currentPath==='/streetverse/tampa'",
  "currentPath==='/streetverse/volcano'",
  "lazy(()=>import('./components/TampaVolcanoSafeRoute'))",
]
for (const token of expected) assert.ok(entry.includes(token), 'Missing isolated beta entry: '+token)
assert.ok(entry.includes("const isStreetVerseSafe="), 'StreetVerse recovery route must remain intact')
assert.ok(entry.includes("const StreetVerseTwinWorld="), 'Existing twin world route must remain intact')
assert.ok(entry.includes("const StreetVerseGeoSpawnBridge="), 'Existing spawn bridge must remain intact')
assert.ok(entry.indexOf("if(currentPath==='/streetverse/tampa'") < entry.indexOf("else if(reelMatch)routeContent="), 'New route precedence must be explicit')
assert.match(scene, /getGamepads/, 'Gamepad support must stay optional')
assert.match(scene, /cancelAnimationFrame\(frame\)/, 'Gamepad loop must clean up on unmount')
assert.match(scene, /window\.removeEventListener\('keydown'/, 'Keyboard listeners must clean up')
assert.match(scene, /appointments — pending credential verification/, 'Do not promise regulated booking')
assert.match(scene, /No charges or reservations occur here/, 'Do not imply live checkout')
assert.doesNotMatch(scene, /fetch\(|localStorage\.|sessionStorage\.|WebSocket\(/, 'Beta scene must not touch network or player saves')
console.log('PASS Tampa and Volcano beta route preservation checks')
