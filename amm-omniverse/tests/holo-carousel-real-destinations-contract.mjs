import fs from 'node:fs'
import assert from 'node:assert/strict'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const bridge=read('../src/components/LivingWorldsBridge.tsx')
const direct=read('../src/components/HoloDirectLaunchBridge.tsx')
const release=read('../src/components/ReleaseChangesPanel.tsx')
const launcher=read('../src/components/HoloExperienceLauncher.tsx')
const media=read('../src/components/MediaStudioLauncher.tsx')

assert.match(bridge,/MediaStudioLauncher/,'LivingWorldsBridge must mount the real Media Studio')
assert.match(bridge,/ReleaseChangesPanel launcher=\{false\}/,'Release Center must be mounted without another floating launcher')
assert.match(bridge,/tryamm:creator-commerce-open/,'Creator Commerce must have a mounted shell listener')

assert.match(media,/tryamm:media-studio-open/,'Media Studio must own the media-studio event')
assert.match(media,/__showMediaStudio/,'Media Studio must own the global media launcher')
assert.doesNotMatch(direct,/addEventListener\('tryamm:media-studio-open'/,'HoloDirectLaunchBridge must not hijack Media Studio events')
assert.doesNotMatch(direct,/__showMediaStudio=openMediaStudio/,'HoloDirectLaunchBridge must not overwrite the real media launcher')

assert.match(release,/tryamm:release-center-open/,'Release Center must listen to carousel release events')
assert.match(release,/__showReleaseCenter/,'Release Center must expose a direct launcher')

assert.match(launcher,/panel==='CHARACTERS'.*streetverse\/meet-the-stubbs/s,'Characters panel must open a real StreetVerse character destination')
assert.match(launcher,/panel==='CREATOR_COMMERCE'.*\/marketplace/s,'Creator Commerce must open Marketplace')
assert.match(launcher,/panel==='WORLD_DATA'.*__showSparrowMap/s,'World Data must open Sparrow Map')
assert.match(launcher,/panel==='RELEASE_CENTER'.*tryamm:release-center-open/s,'Release Center carousel panel must open the mounted release panel')

console.log('Holo carousel real-destination repair contract: PASS')
