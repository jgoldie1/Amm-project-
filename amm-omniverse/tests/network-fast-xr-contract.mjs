import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here=path.dirname(fileURLToPath(import.meta.url))
const root=path.resolve(here,'..')
const tv=fs.readFileSync(path.join(root,'src/components/OTTIsaiahTV.tsx'),'utf8')
const runtime=fs.readFileSync(path.join(root,'src/data/networkRuntime.ts'),'utf8')

const required=[
  'Servants of Christ TV',
  'All American Network TV',
  'Isaiah AI TV',
  'FREE TV + FAST FOUNDATION',
  'All American News Desk',
  'All American Marketplace LIVE',
  'AR / VR / MIXED REALITY',
  'SEND TO STREETVERSE',
  'EVENT GENESIS',
  '$11.25/year founder pricing marker preserved',
]
for(const token of required){if(!tv.includes(token)) throw new Error(`Network TV contract missing: ${token}`)}
for(const token of ['newsProvenance','adapter-gated','EVENT_OUTPUTS','unmapped-founder-marker']){if(!runtime.includes(token)) throw new Error(`Network runtime contract missing: ${token}`)}
if(/product:\s*['"][^'"]+['"]/.test(runtime)) throw new Error('Founder $11.25 marker must remain unmapped until product is confirmed')
console.log('network FAST/XR contract: OK')
