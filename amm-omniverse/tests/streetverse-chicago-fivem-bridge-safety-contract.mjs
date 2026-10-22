import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const plan = readFileSync(new URL('../docs/streetverse-chicago-fivem-bridge-regression-plan.md', import.meta.url), 'utf8')
for (const requirement of [
  'browser Three.js/React',
  'FiveM-specific',
  'disabled-by-default flag',
  'authenticated ingestion',
  'rate-limit and deduplicate',
  'unique claim transaction',
  'existing payment verification',
  'WebGL context-loss recovery',
  'owner approval',
]) assert.ok(plan.includes(requirement), 'Missing StreetVerse Chicago integration safety requirement: '+requirement)
assert.match(plan, /cannot be loaded into the existing browser game/)
assert.match(plan, /not proof of a working launch/)
console.log('StreetVerse Chicago FiveM bridge safety plan contract passed')
