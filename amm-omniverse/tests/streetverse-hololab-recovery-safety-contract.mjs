import assert from 'node:assert/strict'
import fs from 'node:fs'
const source=fs.readFileSync(new URL('../src/runtime/StreetVerseHoloLabMotionRuntime.ts',import.meta.url),'utf8')
assert.match(source,/warping:null,arrived:null/,'Arrival bypass must remain disabled')
const collision=fs.readFileSync(new URL('../src/runtime/StreetVerseHoloLabCollision.ts',import.meta.url),'utf8')
assert.match(collision,/Math\.min\(deltaSeconds,0\.05\)/,'Frame time must be bounded')
const audit=JSON.parse(fs.readFileSync(new URL('../assets/hololab-nov15-asset-audit.json',import.meta.url),'utf8'))
assert.equal(audit.recovery.googleDriveFileId,'1pnn4N-PZFyGU-jMnYZQiWgfOF29l8Hca')
assert.equal(audit.assets[0].sha256,'122e77b243bb9feac9c6e835a500207d034ef8ee710f52751a89ee917e685258')
console.log('HoloLab arrival bypass and recovered asset registry PASS')
