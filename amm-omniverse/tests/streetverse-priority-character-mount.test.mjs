import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const code=readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
test('Jacobie and LaTeasia begin loading before optional native scenery',()=>{
 const priority=code.indexOf('if(eagerRecoveredId)void loadRecoveredPlayable(eagerRecoveredId)')
 const policy=code.indexOf("nativePlacementsForWorld(greenvilleBirthdayMode,entranceProps('greenville'),mobileNativePlacements)")
 const scenery=code.indexOf('void loadTryammNativeCircleParkLayer({placements:scopedNativePlacements})')
 assert.ok(priority>0,'priority loader exists')
 assert.ok(policy>priority&&scenery>policy,'priority loader starts before scoped scenery')
 assert.match(code,/scene\.add\(handle\.object\)/,'real GLB mounts in scene independently of delayed layer')
 assert.match(code,/priorityLoader:true/,'priority mount emits evidence')
 assert.match(code,/if\(recoveredPlayableHandle\?\.id===requestedRecoveredParam&&recoveredPlayableHandle\.object\.parent\)/,'later native layer preserves original player')
 assert.match(code,/if\(recoveredParam&&!eagerRecoveredId\)void activateRecoveredPlayable\(recoveredParam\)/,'avoid duplicate initial load')
 assert.match(code,/if\(nativeCancelled\)\{handle\?\.dispose\(\);return\}/,'late GLB is disposed after unmount')
})
