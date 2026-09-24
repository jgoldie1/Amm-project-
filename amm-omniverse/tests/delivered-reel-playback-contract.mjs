import fs from 'node:fs'
import assert from 'node:assert/strict'
const api=fs.readFileSync('api/media/publication.js','utf8')
const ui=fs.readFileSync('src/components/PublicReelPage.tsx','utf8')
assert.match(api,/createSignedPlayback/)
assert.match(api,/playbackUrl/)
assert.match(api,/status!=='delivered'/)
assert.match(api,/approved','restored/)
assert.match(ui,/src=\{data\.media\.playbackUrl\}/)
assert.doesNotMatch(ui,/display:'none'/)
assert.match(ui,/requestPictureInPicture/)
assert.match(ui,/preload=\{bufferPolicy/)
console.log('delivered Reel playback contract ok')
