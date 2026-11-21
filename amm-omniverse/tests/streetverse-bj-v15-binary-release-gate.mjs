import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
const asset=new URL('../public/assets/characters/BJ_STUBBS_V15_RECOVERED.glb',import.meta.url)
assert.ok(fs.existsSync(asset),'RELEASE BLOCKED: BJ V15 binary missing. Install recovered verified GLB with scripts/install_verified_streetverse_glbs.py')
const data=fs.readFileSync(asset)
assert.equal(data.length,6214772,'RELEASE BLOCKED: BJ GLB byte size mismatch')
assert.equal(crypto.createHash('sha256').update(data).digest('hex'),'122e77b243bb9feac9c6e835a500207d034ef8ee710f52751a89ee917e685258','RELEASE BLOCKED: BJ GLB SHA256 mismatch')
assert.equal(data.toString('ascii',0,4),'glTF','RELEASE BLOCKED: not a binary GLB')
console.log('Verified BJ V15 binary release gate PASS')
