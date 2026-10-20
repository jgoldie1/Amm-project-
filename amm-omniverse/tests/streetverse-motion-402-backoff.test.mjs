import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const src=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyCharacterRuntime.ts',import.meta.url),'utf8')
test('StreetVerse shares in-flight character-motion requests and backs off blocked storage',()=>{
 assert.match(src,/const companionCache=new Map<string,MotionEntry>/)
 assert.match(src,/if\(previous&&previous\.expiresAt>Date\.now\(\)\)return previous\.promise/)
 assert.match(src,/COMPANION_FAIL_TTL_MS=15\*60_000/)
 assert.match(src,/entry\.expiresAt=Date\.now\(\)\+COMPANION_FAIL_TTL_MS/)
 assert.ok((src.match(/loadSharedMotionClips\(url\)/g)||[]).length>=2)
 assert.doesNotMatch(src,/requestedCompanions\.delete\(motion\)/)
 assert.match(src,/tryamm:streetverse-motion-unavailable/)
})
