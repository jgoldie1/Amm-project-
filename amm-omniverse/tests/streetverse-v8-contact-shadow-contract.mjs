import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source = readFileSync(new URL('../src/runtime/StreetVerseGroundContactShadow.ts', import.meta.url), 'utf8')
assert.match(source, /createGroundContactShadow/)
assert.match(source, /CanvasTexture/)
assert.match(source, /depthWrite:\s*false/)
assert.match(source, /geometry\.dispose\(\)/)
assert.match(source, /material\.dispose\(\)/)
assert.match(source, /texture\.dispose\(\)/)
assert.doesNotMatch(source, /shadowMap\.enabled\s*=\s*true/)
console.log('StreetVerse V8 contact-shadow source contract passed')
