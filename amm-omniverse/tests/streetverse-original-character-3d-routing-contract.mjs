import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const text=(path)=>readFileSync(new URL(path,import.meta.url),'utf8')
const world=text('../src/components/StreetVersePlayableWorld.tsx')
const mobile=text('../src/components/StreetVerseMobileWorld.tsx')
const switcher=text('../src/components/StreetVerseCharacterSwitchHUD.tsx')
const website=text('../public/greenville-university.html')
const guide=text('../public/greenville-campus-guide.js')
const progress=text('../public/greenville-campus-progress.js')
assert.match(world,/const character3D=params\.get\('graphics'\)==='character'/,'explicit character mode must be recognized')
assert.match(world,/if\(safe&&!forceFull3D&&!character3D\)return/,'character mode must reach GLTF scene even on conservative device')
assert.match(world,/<MobileRuntimeGuard/,'character mode keeps runtime crash recovery')
assert.match(mobile,/get\('graphics'\)==='character'\|\|mobileGpuBudget/,'character mode selects reduced GPU pixel budget')
assert.match(switcher,/const base='\/streetverse\?core=1&graphics=character'/,'switcher launches 3D character mode')
assert.match(switcher,/character=jacobie&world=greenville/,'Jacobie goes to Greenville')
assert.match(switcher,/character=lateasia/,'LaTeasia goes to real character mode')
for(const [name,source] of Object.entries({website,guide,progress})){
 assert.match(source,/graphics=character/,'campus '+name+' requests the original GLB view')
}
assert.match(mobile,/if\(!requestedRecoveredParam&&savedPlayable\?\.assetId/,'old stand-in cannot supersede selected character')
console.log('Original three-character 3D route contract PASS')
