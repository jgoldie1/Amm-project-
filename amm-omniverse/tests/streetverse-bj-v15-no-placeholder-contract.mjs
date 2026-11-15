import fs from 'node:fs'
import assert from 'node:assert/strict'
const code=fs.readFileSync(new URL('../src/components/StreetVerseHoloLab3DPreview.tsx',import.meta.url),'utf8')
const installer=fs.readFileSync(new URL('../scripts/install-bj-v15.mjs',import.meta.url),'utf8')
assert.match(code,/BJ_STUBBS_V15_RECOVERED\.glb/,'BJ V15 required path missing')
assert.match(code,/proxy\.visible=false/,'Diagnostic character must not be visible')
assert.match(code,/ERROR: BJ V15 GLB missing/,'Missing real asset must be reported')
assert.match(installer,/122e77b243bb9feac9c6e835a500207d034ef8ee710f52751a89ee917e685258/,'Checksum lock missing')
console.log('BJ V15 no-placeholder loader and checksum installer contract PASS')
