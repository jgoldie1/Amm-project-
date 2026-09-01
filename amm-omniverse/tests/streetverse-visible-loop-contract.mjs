import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

const root=path.resolve(import.meta.dirname,'..')
const worldPath=path.join(root,'src','components','StreetVerseOmniWorld.tsx')
const studioPath=path.join(root,'src','components','MediaStudioLauncher.tsx')
const world=fs.readFileSync(worldPath,'utf8')
const studio=fs.readFileSync(studioPath,'utf8')

const checks=[
  ['StreetVerse resident population is materialized',/NPC_NEAR_SPAWN/.test(world)&&/for\(let i=0;i<24;i\+\+\)/.test(world)],
  ['AI Spirit skins are materialized',/function aiSpirit/.test(world)&&/for\(let i=0;i<8;i\+\+\)/.test(world)],
  ['Traffic heading follows direction of travel',/c\.rotation\.y=dir>0\?0:Math\.PI/.test(world)],
  ['Player can enter and exit vehicles',/setIsDriving\(true\)/.test(world)&&/setIsDriving\(false\)/.test(world)],
  ['Mission completion produces a ledger receipt',/appendStreetVerseRevenue/.test(world)&&/receipt\.hash/.test(world)],
  ['StreetVerse exposes Reel Creator',/tryamm:media-studio-open/.test(world)&&/Create StreetVerse Reel/.test(world)],
  ['Reel Studio supports MediaRecorder capture',/navigator\.mediaDevices\?\.getDisplayMedia/.test(studio)&&/new MediaRecorder/.test(studio)],
  ['Reel Studio supports phone save\/share',/navigator\.share/.test(studio)&&/SAVE TO PHONE|saveToPhone/.test(studio)],
  ['Reel Studio supports production publishing',/upload-intent/.test(studio)&&/publishProduction/.test(studio)],
]

const failed=checks.filter(([,ok])=>!ok)
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`)
assert.equal(failed.length,0,`StreetVerse visible loop contract failed: ${failed.map(([name])=>name).join(', ')}`)
console.log('StreetVerse visible loop contract: GREEN')
