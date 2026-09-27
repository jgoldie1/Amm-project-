import fs from 'node:fs'
import assert from 'node:assert/strict'

const coordinator=fs.readFileSync(new URL('../src/navigation/RouteCoordinator.tsx',import.meta.url),'utf8')
const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')

assert.match(app,/__tryammNavigate\s*=\s*navigateTryAMM/,'App must own the canonical TRYAMM navigator')
assert.doesNotMatch(coordinator,/__tryammNavigate\s*=/,'RouteCoordinator must not overwrite the canonical navigator')
assert.match(coordinator,/hashchange/,'RouteCoordinator must keep consuming legacy hash changes')
assert.match(app,/route === '\/streetverse'.*window\.location\.href = route/s,'canonical StreetVerse navigation must use the real /streetverse route')

console.log('Canonical navigation owner contract: PASS')
