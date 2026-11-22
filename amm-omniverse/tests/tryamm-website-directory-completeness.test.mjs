import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = path => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8')
test('First 30 campaign preserves overflow websites instead of truncating', () => {
 const source = read('data/TRYAMMFirst30WebsiteLaunch.ts')
 assert.doesNotMatch(source, /\.slice\(0,\s*30\)/)
 for (const id of ['sculptifyltd', 'la-taeasia-beautyverse', 'stubbs-mobility360', 'omnicare360'])
   assert.ok(source.includes(id), id)
})
test('Public directory includes both family profiles and additional website previews', () => {
 const source = read('components/FamilyBusinessDirectory.tsx')
 for (const marker of ['FAMILY_BUSINESS_REGISTRY.map', 'additionalSites.map', 'TRYAMM_FIRST_30_WEBSITES', 'lateasia-beauty-house.html'])
   assert.ok(source.includes(marker), marker)
})
test('Kevon and security business profiles are retained', () => {
 const source = read('data/familyBusinessRegistry.ts')
 for (const id of ['alton-kevon-stubbs', 'al-ai-security'])
   assert.ok(source.includes(id), id)
})

test('Master inventory references recovered standalone sites without calling them live', () => {
 const source = read('data/tryammWebsiteMasterRegistry.ts')
 for (const name of ['sculptify-ltd','alton-kevon-stubbs','alton-security','stubbs-mobility','raymond-jarreau','lateasia-beauty-house','jacobie-visions'])
   assert.ok(source.includes(name), name)
 assert.doesNotMatch(source, /status:\s*'live'/)
 const directory = read('components/FamilyBusinessDirectory.tsx')
 assert.ok(directory.includes('TRYAMM_WEBSITE_MASTER_REGISTRY.map'))
})
