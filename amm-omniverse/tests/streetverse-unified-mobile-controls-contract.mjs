import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const hook=read('../src/hooks/useStreetVerseMobileShellMounted.ts')
const mobile3d=read('../src/components/StreetVerseMobileWorld.tsx')
const community=read('../src/components/StreetVerseCommunityMobileWorld.tsx')
const hyde=read('../src/components/StreetVerseHydeParkMobileWorld.tsx')
const generic=read('../src/components/StreetVerseMobilePlayableWorld.tsx')

assert.match(hook,/data-streetverse-mobile-shell/,'shell detection must use the unified mobile-shell marker')
assert.match(hook,/MutationObserver/,'shell detection must notice the shell after mobile capability resolves')

for(const [name,source] of Object.entries({mobile3d,community,hyde,generic})){
 assert.match(source,/useStreetVerseMobileShellMounted/,`${name} must detect unified mobile controls`)
 assert.match(source,/!shellControls/,`${name} must retain its fallback pad only when the unified shell is absent`)
}

for(const [name,source] of Object.entries({mobile3d,community,hyde,generic})){
 assert.match(source,/tryamm:streetverse-vehicle-input/,`${name} must accept unified movement input`)
}

assert.match(community,/tryamm:streetverse-vehicle-interact/,'community safe world must accept unified ACTION vehicle interaction')
assert.match(hyde,/tryamm:streetverse-vehicle-interact/,'Hyde Park safe world must accept unified ACTION vehicle interaction')
assert.match(generic,/tryamm:streetverse-vehicle-interact/,'generic HTML city must keep unified ACTION vehicle interaction')

assert.match(community,/moveButton\('▲','up'\)/,'community safe world must retain standalone fallback controls')
assert.match(hyde,/control\('↑','up'\)/,'Hyde Park must retain standalone fallback controls')
assert.match(generic,/btn\('↑','up'\)/,'generic HTML city must retain standalone fallback controls')

console.log('StreetVerse unified mobile controls contract: PASS')
