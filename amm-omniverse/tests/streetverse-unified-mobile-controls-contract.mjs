import fs from 'node:fs'
import assert from 'node:assert/strict'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const mobile3d=read('../src/components/StreetVerseMobileWorld.tsx')
const community=read('../src/components/StreetVerseCommunityMobileWorld.tsx')
const hyde=read('../src/components/StreetVerseHydeParkMobileWorld.tsx')
const generic=read('../src/components/StreetVerseMobilePlayableWorld.tsx')
const bridge=read('../src/components/StreetVerseGeoSpawnBridge.tsx')
const vercel=JSON.parse(read('../vercel.json'))
const repair=read('../scripts/repair-streetverse-entry.mjs')

assert.match(mobile3d,/StreetVerse analog joystick/,'mobile 3D world must expose the direct analog joystick')
assert.match(mobile3d,/analogInput\.current/,'mobile 3D world must feed analog input directly into its render loop')
assert.doesNotMatch(mobile3d,/StreetVerse legacy movement controls/,'mobile 3D world must not overlay the retired arrow pad')
for(const [name,source] of Object.entries({community,hyde,generic})){
  assert.doesNotMatch(source,/useStreetVerseMobileShellMounted/,name+' must not depend on the retired arrow shell')
  assert.doesNotMatch(source,/shellControls/,name+' must not conditionally restore retired controls')
  assert.doesNotMatch(source,/[↑↓←→▲▼◀▶]/,name+' must not render a four-arrow movement pad')
}
assert.doesNotMatch(bridge,/StreetVerseMobileGameShell/,'GeoSpawnBridge must never mount the retired arrow shell')
assert.equal(vercel.routes.filter(route=>route.src==='/streetverse'||route.src==='/streetverse/').length,0,'canonical StreetVerse must fall through to the playable app')
assert.doesNotMatch(repair,/const mobileImport=/,'build repair must not inject the legacy mobile playable world')
console.log('StreetVerse unified mobile controls contract: PASS (canonical playable route + direct analog control + no legacy arrow restoration)')
