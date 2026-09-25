import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const community=read('../src/components/StreetVerseCommunityMobileWorld.tsx')
const bridge=read('../src/components/StreetVerseReelEventBridge.tsx')

assert.match(community,/SAVE \/ SHARE/,'community Reel Studio must expose Save / Share')
assert.match(community,/navigator\.share/,'community Reel Studio must use the native share sheet when available')
assert.match(community,/navigator\.canShare/,'community Reel Studio must verify file sharing capability')
assert.match(community,/URL\.createObjectURL\(file\)/,'community Reel Studio must provide a download fallback')
assert.match(community,/tryamm:streetverse-reel-save-share-complete/,'Save / Share must emit certification evidence')
assert.match(bridge,/detail\.source==='streetverse-community-mobile'/,'global Reel bridge must ignore the community-owned Reel Studio event')
assert.match(bridge,/setOpen\(true\)/,'global Reel bridge must remain available for non-community Reel events')

console.log('StreetVerse mobile Reel last-mile contract: PASS')
