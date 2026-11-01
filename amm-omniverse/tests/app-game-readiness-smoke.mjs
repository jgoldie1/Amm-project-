import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const main = read('../src/main.tsx')
const world = read('../src/components/StreetVerseSafeWorld.tsx')
assert.ok(main.includes("currentPath.startsWith('/streetverse')"))
assert.ok(world.includes('CircleParkHolographicWorld'))
console.log('App and StreetVerse source routes PASS')
