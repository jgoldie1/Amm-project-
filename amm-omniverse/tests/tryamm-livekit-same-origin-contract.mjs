import assert from 'node:assert/strict'
import fs from 'node:fs'
const get=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const service=get('src/services/live.ts')
const pkg=JSON.parse(get('package.json'))
assert(service.includes('VITE_LIVE_API_URL'))
assert(!service.includes('import.meta.env.VITE_API_URL'))
assert(service.includes('LIVE_API_URL}${path}'))
assert(service.includes('LIVE_API_URL}/api/live/status'))
assert(service.includes('content-type'))
assert(service.includes('invalid status'))
assert(pkg.scripts.build.includes('tryamm-livekit-same-origin-contract.mjs'))
console.log('TRYAMM LIVE SAME ORIGIN PASS: no legacy VITE_API_URL token/status mismatch')
