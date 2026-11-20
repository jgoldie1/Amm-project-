import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const website=readFileSync(new URL('../public/greenville-university.html',import.meta.url),'utf8')
const guide=readFileSync(new URL('../public/greenville-campus-guide.js',import.meta.url),'utf8')
const progress=readFileSync(new URL('../public/greenville-campus-progress.js',import.meta.url),'utf8')
const shell=readFileSync(new URL('../src/components/StreetVersePlayableWorld.tsx',import.meta.url),'utf8')
for(const [name,source] of Object.entries({website,guide,progress})){
 assert.doesNotMatch(source,/graphics(?:=|%3D)3d/i,name+' must not force full 3D mode on constrained devices')
 assert.match(source,/\/streetverse\?core=1(?:&amp;|&)character=jacobie(?:&amp;|&)world=greenville/,name+' must preserve playable campus route')
}
assert.match(shell,/shouldUseStreetVerseSafeMode/,'preserve adaptive graphics safe mode')
assert.match(shell,/StreetVerseSafeWorld/,'safe fallback world remains available')
assert.match(shell,/forceFull3D/,'graphics override behavior still exists for explicit advanced opt-in')
console.log('Greenville crash mitigation contract PASS: adaptive device graphics preserved')
