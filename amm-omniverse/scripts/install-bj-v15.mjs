import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
const expected='122e77b243bb9feac9c6e835a500207d034ef8ee710f52751a89ee917e685258'
const destination=path.resolve('public/assets/characters/BJ_STUBBS_V15_RECOVERED.glb')
const source=process.argv[2]
if(!source){console.error('Usage: node scripts/install-bj-v15.mjs /path/to/BJ_STUBBS_V15_RECOVERED.glb');process.exit(2)}
const bytes=fs.readFileSync(source)
const digest=crypto.createHash('sha256').update(bytes).digest('hex')
if(digest!==expected){console.error('BJ V15 SHA256 mismatch. Refusing to install unverified rig.');process.exit(1)}
fs.mkdirSync(path.dirname(destination),{recursive:true})
fs.writeFileSync(destination,bytes)
console.log('Installed verified BJ V15 GLB:',destination,bytes.length,'bytes')
